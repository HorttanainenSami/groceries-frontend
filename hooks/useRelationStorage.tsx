import { useRelationContext } from '@/contexts/RelationContext';
import useRelationsSocket from './useRelationsSocket';
import {
  changeRelationName,
  createTasksRelations,
  deleteRelationWithTasks,
  getTaskRelations,
} from '@/service/LocalDatabase';

import React from 'react';
import { ClientToServerRelatiosShare,
  LocalRelationType,
  ServerRelationType,
  ServerRelationWithTasksType, } from '@groceries/shared_types';

const useRelationStorage = () => {
  const { relations, setRelations } = useRelationContext();
  
  const [loading, setLoading] = React.useState(false);

  const handleChangeNameBroadcast = React.useCallback((broadcastedRelation : ServerRelationType) => {
    setRelations(prev => prev.map(rel => rel.id ===broadcastedRelation.id?broadcastedRelation:rel))
  },[setRelations])

  const handleDeleteBroadcast = React.useCallback((deletedRelations : [boolean, string][]) => {
    setRelations(prev => {
      const filtered = prev.filter(r => !deletedRelations.map(r => r[1]).includes(r.id));
      return filtered;
    })
  },[setRelations])

  const handleShareBroadcast = React.useCallback((t : ServerRelationWithTasksType[]) => {
    setRelations(prev => [...prev, ...t])
  },[setRelations])

  const { 
    emitChangeRelationName,
    emitDeleteRelation,
    emitGetRelations,
    emitShareWithUser
  } = useRelationsSocket({onChangeName: handleChangeNameBroadcast, onDelete: handleDeleteBroadcast, onShare: handleShareBroadcast});

  const getRelations = async () => {
    setLoading(true);
    try {
      const [local, server] = await Promise.all([getTaskRelations(), emitGetRelations()]);
      setRelations([...local,...server]);

    } catch (error) {
      console.error('Error getting relations:', error);
    } finally {
      setLoading(false);
    }
  };
  const refresh = async () => getRelations();

  const addRelationLocal = async (name: string) => {
    await createTasksRelations({ name });
    refresh();
  };
  const removeRelations = async (
    relations: (LocalRelationType|ServerRelationType)[]
  )=> {
    const local = relations.filter(i => i.relation_location==='Local')
    const server = relations.filter(i => i.relation_location==='Server')
    const removeAll =  await Promise.all([deleteRelationWithTasks(local), emitDeleteRelation(server)])
    const response = [...removeAll[0], ...removeAll[1]];
    const removed =response.filter(([res, ]) => res === true).map(([, id]) => id);
    const remainingRelations = relations.filter(r => !removed.includes(r.id) );
    setRelations(remainingRelations);
    return response;
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

    console.log('Attempting to change relation name in DB for id:', id);
    const db =
      relation.relation_location === 'Local'
        ? await changeRelationName(id, newName)
        : await emitChangeRelationName({id, name: newName});

    console.log('Response from changeRelationName (db):', db);
    if (!db) {
      console.error('Failed to change relation name in DB for id:', id);
      return null;
    }
    const updatedRelations = relations.map((r) =>
      r.id === id ? { ...r, name: db.name } : r
    );
    setRelations(updatedRelations);
    console.log('Relations state updated.');
    return db;
  };

  const shareRelation = async ({
    task_relations,
    user_shared_with,
  }: ClientToServerRelatiosShare) => {
    try {
      const serverResponse = await emitShareWithUser({
        user_shared_with,
        task_relations,
      });
      
      const relations = Array.isArray(task_relations)?task_relations: [task_relations];
      const localRelations = relations.filter(i => i.relation_location==='Local') as LocalRelationType[];

      const deleted = localRelations.length ===0 ? []: await deleteRelationWithTasks(localRelations);
    
      const successfulDeletes = deleted
        .filter((result) => result[0] === true)
        .map((result) => result[1]);

      
      setRelations(prev => {
        const removed = prev.filter(i => !successfulDeletes.includes(i.id));
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
