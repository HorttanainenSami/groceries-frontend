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
    const response = await Promise.all([
      getTaskRelations(),
      getServerRelations(),
    ]);
    console.log(JSON.stringify(response, null, 2));
    setRelations([...response[0], ...response[1]]);
    setLoading(false);
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

  const shareRelation = async ({ user, relations: relationsToShare }: ShareRelationType) => {
    try {
      const response = await shareListWithUser({
        user,
        relationsToShare,
      });
      console.log('response from server', JSON.stringify(response, null, 2));
      if (!response) return;
      const deleteLocalRelationsIds = relationsToShare.map(
        (relations) => relations.id
      );
   
 
      const promises = await Promise.all(deleteLocalRelationsIds.map((id) =>
        deleteRelationsWithTasks(id)));
      const successfulDeletes = promises
        .filter((result) => result[0] === true)
        .map((result) => result[1]);
      console.log('successful deletes', successfulDeletes);
      const remainingRelations = relations.filter(
        (r) => !successfulDeletes.includes(r.id)
      );
      console.log('deleted', remainingRelations);
      setRelations([...remainingRelations, ...response]);
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
