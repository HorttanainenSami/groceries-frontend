import { useRelationContext } from '@/contexts/RelationContext';
import useRelationsSocket from './useRelationsSocket';
import { relationsDAO, getDatabaseSingleton, taskDAO } from '@/service/LocalDatabase';

import React from 'react';
import {
  ClientToServerRelatiosShare,
  LocalRelationType,
  RelationType,
  ServerRelationType,
  ServerRelationWithTasksType,
} from '@groceries/shared_types';
import { useSyncContext } from '@/contexts/SyncContext';

const useRelationStorage = () => {
  const { relations, setRelations } = useRelationContext();
  const loading = React.useRef(false);
  const isMounted = React.useRef(true);
  const { addToQueue, pendingOperations, isSyncing, lastTimeSynced } = useSyncContext();

  const handleChangeNameBroadcast = React.useCallback(
    async (broadcastedRelation: ServerRelationType) => {
      loading.current = true;
      setRelations((prev) =>
        prev.map((rel) => (rel.id === broadcastedRelation.id ? broadcastedRelation : rel))
      );
      loading.current = false;
      await relationsDAO.updateName(broadcastedRelation.id, broadcastedRelation.name);
    },
    [setRelations]
  );

  const handleDeleteBroadcast = React.useCallback(
    async (deletedRelations: [boolean, string][]) => {
      loading.current = true;
      setRelations((prev) => {
        const filtered = prev.filter((r) => !deletedRelations.map((r) => r[1]).includes(r.id));
        return filtered;
      });
      loading.current = false;
      const deletedIds = deletedRelations
        .filter((i) => i[0])
        .map((i) => ({
          id: i[1],
        }));
      relationsDAO.delete(deletedIds);
    },
    [setRelations]
  );

  const handleShareBroadcast = React.useCallback(
    async (t: ServerRelationWithTasksType[]) => {
      console.log('performing transaction in hadnleShare');
      setRelations((prev) => [...prev, ...t]);
      loading.current = true;
      const db = await getDatabaseSingleton();
      loading.current = false;

      await Promise.all(
        t.map(async (relation) => {
          const { tasks, ...rest } = relation;
          // Store relation
          await relationsDAO.insertCached({ relation: rest, txQuery: db });
          // Store all tasks for relation
          if (tasks.length > 0) {
            await taskDAO.insertCached(tasks, db);
          }
        })
      );
    },
    [setRelations]
  );

  const { emitGetRelations, emitShareWithUser, connected } = useRelationsSocket({
    onChangeName: handleChangeNameBroadcast,
    onDelete: handleDeleteBroadcast,
    onShare: handleShareBroadcast,
  });

  React.useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fetch from server when socket connects
  React.useEffect(() => {
    if (connected && isMounted.current && !loading.current && !isSyncing) {
      getRelations();
    }
  }, [connected, lastTimeSynced]);

  const getRelations = async () => {
    if (loading.current) return;

    loading.current = true;
    try {
      const cached = await relationsDAO.getAll();
      setRelations([...cached]);
      // update cached storage
      if (connected && pendingOperations.length === 0 && isMounted.current) {
        const server = await emitGetRelations();
        await relationsDAO.replaceAllCached(server);
        const newCachedReleations = await relationsDAO.getAll();
        setRelations([...newCachedReleations]);
      }
    } catch (error) {
      console.error('Error getting relations:', error);
      loading.current = false;
    } finally {
      loading.current = false;
    }
  };
  const refresh = async () => getRelations();

  const addRelationLocal = async (name: string) => {
    await relationsDAO.create({ name });
    refresh();
  };
  const removeRelations = async (relations: RelationType[]) => {
    try {
      const server = relations.filter((i) => i.relation_location === 'Server');
      const removeAll = await relationsDAO.delete(relations);
      if (server.length > 0) {
        server.map((i) => addToQueue({ type: 'relation-delete', data: i }));
      }
      const removed = removeAll.filter(([res]) => res === true).map(([, id]) => id);
      setRelations((prev) => prev.filter((r) => !removed.includes(r.id)));
      return removeAll;
    } catch (e) {
      console.log(e);
      throw e;
    }
  };

  const editRelationsName = async (
    id: string,
    newName: string
  ): Promise<LocalRelationType | ServerRelationType | null> => {
    const relation = relations.find((r) => r.id === id);
    if (!relation) {
      console.error('Relation not found for id:', id);
      return null;
    }
    const db = await relationsDAO.updateName(id, newName);
    if (!db) {
      console.error('Failed to change relation name in DB for id:', id);
      return null;
    }
    if (relation.relation_location === 'Server') {
      addToQueue({
        type: 'relation-edit',
        data: { ...relation, name: newName },
      });
    }
    const updatedRelations = relations.map((r) => (r.id === id ? { ...r, name: db.name } : r));
    setRelations(updatedRelations);
    console.log('Relations state updated.');
    return db;
  };

  const shareRelation = async ({
    task_relations,
    user_shared_with,
  }: ClientToServerRelatiosShare) => {
    try {
      if (!connected) return;
      const serverResponse = await emitShareWithUser({
        user_shared_with,
        task_relations,
      });

      const relations = Array.isArray(task_relations) ? task_relations : [task_relations];
      const localRelations = relations.filter(
        (i) => i.relation_location === 'Local'
      ) as LocalRelationType[];

      const deleted = localRelations.length === 0 ? [] : await relationsDAO.delete(localRelations);

      const successfulDeletes = deleted
        .filter((result) => result[0] === true)
        .map((result) => result[1]);

      setRelations((prev) => {
        const removed = prev.filter((i) => !successfulDeletes.includes(i.id));
        return [...removed, ...serverResponse];
      });
    } catch (e) {
      console.log('error occurred', e);
      if (e instanceof Error) {
        console.log('error occurred', e);
      }
      throw e;
    }
  };
  return {
    relations,
    getRelations,
    refresh,
    addRelationLocal,
    removeRelations,
    shareRelation,
    editRelationsName,
    loading,
  };
};

export default useRelationStorage;
