import { useRelationContext } from '@/contexts/RelationContext';
import useRelationsSocket from './useRelationsSocket';
import { relationsDAO, getDatabaseSingleton, taskDAO } from '@/service/LocalDatabase';
import { useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
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
  const [isFocused, setisFocused] = React.useState(true);
  const { addToQueue, pendingOperations, isSyncing, lastTimeSynced } = useSyncContext();
  useFocusEffect(
    useCallback(() => {
      setisFocused(true);
      return () => {
        setisFocused(false);
      };
    }, [])
  );
  const handleChangeNameBroadcast = React.useCallback(
    async (broadcastedRelation: ServerRelationType) => {
      setRelations((prev) =>
        prev.map((rel) => (rel.id === broadcastedRelation.id ? broadcastedRelation : rel))
      );
      await relationsDAO.updateName(broadcastedRelation.id, broadcastedRelation.name);
    },
    [setRelations]
  );

  const handleDeleteBroadcast = React.useCallback(
    async (deletedRelations: [boolean, string][]) => {
      setRelations((prev) => {
        const filtered = prev.filter((r) => !deletedRelations.map((r) => r[1]).includes(r.id));
        return filtered;
      });
      const deletedIds = deletedRelations
        .filter((i) => i[0])
        .map((i) => ({
          id: i[1],
        }));
      await relationsDAO.delete(deletedIds);
    },
    [setRelations]
  );

  const handleShareBroadcast = React.useCallback(
    async (t: ServerRelationWithTasksType[]) => {
      console.log('performing transaction in handleShare');
      setRelations((prev) => [...prev, ...t]);
      const db = await getDatabaseSingleton();
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

  // Fetch from server when socket connects
  React.useEffect(() => {
    console.log('relation refresh effect');
    if (isFocused) {
      getRelations();
    }
  }, [connected, lastTimeSynced, isFocused]);

  const getRelations = async () => {
    if (loading.current) return;
    console.log('relation refresh');

    loading.current = true;
    try {
      // update cached storage
      if (connected && pendingOperations.length === 0 && !isSyncing) {
        const server = await emitGetRelations();
        console.log(JSON.stringify(server, null, 2));
        await relationsDAO.replaceAllCached(server);
      }
      const cached = await relationsDAO.getAll();
      setRelations([...cached]);
    } catch (error) {
      console.error('Error getting relations:', error);
    } finally {
      loading.current = false;
    }
  };
  const refresh = async () => getRelations();

  const addRelationLocal = async (name: string) => {
    const newRelation = await relationsDAO.create({ name });
    setRelations((prev) => [newRelation, ...prev]);
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
    if (loading.current || !connected) return false;

    loading.current = true;
    try {
      const serverResponse = await emitShareWithUser({
        user_shared_with,
        task_relations,
      });
      const serverResponseMap = new Map(serverResponse.map((r) => [r.id, r]));
      await Promise.all(serverResponse.map((r) => relationsDAO.update(r)));
      setRelations((prev) =>
        prev.map((relation) => serverResponseMap.get(relation.id) ?? relation)
      );
      return true;
    } catch (e) {
      console.log('error occurred', e);
      throw e;
    } finally {
      loading.current = false;
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
