import { useRelationContext } from '@/contexts/RelationContext';
import {
  getServerRelations,
  removeRelationFromServer,
  shareListWithUser,
} from '@/service/database';
import {
  createTasksRelations,
  deleteRelationsWithTasks,
  getTaskRelations,
} from '@/service/LocalDatabase';
import {
  BaseTaskRelationsType,
  BaseTaskRelationsWithTasksType,
  SearchUserType,
} from '@/types';
import React from 'react';

type ShareRelationType = {
  user: SearchUserType;
  relations: BaseTaskRelationsWithTasksType[];
};
const useRelationStorage = () => {
  const { relations, setRelations } = useRelationContext();
  const [loading, setLoading] = React.useState(false);

  const getRelations = async () => {
    setLoading(true);
    await Promise.all([getTaskRelations(), getServerRelations()])
      .then((values) => setRelations([...values[0], ...values[1]]))
      .finally(() => setLoading(false));
  };
  const refresh = async () => getRelations();

  const addRelationLocal = async (name: string) => {
    await createTasksRelations({ name });
    refresh();
  };
  const removeRelations = async (
    relations: BaseTaskRelationsType[]
  ): Promise<[boolean, string][]> => {
    const removeAll = await Promise.all(
      relations.map(async (relation) => {
        if (relation.relation_location === 'Local') {
          return deleteRelationsWithTasks(relation.id);
        } else {
          return removeRelationFromServer(relation.id);
        }
      })
    );
    return removeAll;
  };

  const shareRelation = async ({ user, relations }: ShareRelationType) => {
    try {
      const response = await shareListWithUser({
        user,
        relationsToShare: relations,
      });
      console.log('response from server', response);
      if (!response) return;
      const deleteLocalRelationsIds = relations.map(
        (relations) => relations.id
      );
      const deleteRelationsPromises = deleteLocalRelationsIds.map((id) =>
        deleteRelationsWithTasks(id)
      );
      console.log(
        'delete these',
        deleteLocalRelationsIds,
        deleteRelationsPromises
      );
      const promises = await Promise.all(deleteRelationsPromises);
      console.log('delete these', deleteLocalRelationsIds, promises);
      console.log('add these', response);
      setRelations((prev) =>
        prev.filter(
          (relations) => !deleteLocalRelationsIds.includes(relations.id)
        )
      );
      setRelations((prev) => [
        ...prev,
        ...response.map((relation) => ({ ...relation, shared: 1 })),
      ]);
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
    loading,
  };
};

export default useRelationStorage;
