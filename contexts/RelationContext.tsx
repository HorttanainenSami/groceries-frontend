
import { getServerRelations, removeRelationFromServer, shareListWithUser } from '@/service/database';
import { createTasksRelations, deleteRelationsWithTasks, getTaskRelations } from '@/service/LocalDatabase';
import { BaseTaskRelationsType, BaseTaskRelationsWithTasksType, SearchUserType } from '@/types';
import React, {createContext} from 'react';

type ShareRelationType = {
	user: SearchUserType;
	relations: BaseTaskRelationsWithTasksType[]; 
};

type RelationContextType = {
	relations: BaseTaskRelationsType[];
	refresh: () => Promise<void>;
	loading: boolean;
	shareRelation: (data: ShareRelationType) => Promise<void>;
	addRelationLocal: (name:string) => Promise<void>;
	removeRelations: (relations: BaseTaskRelationsType[]) => Promise<[boolean, string][]>;
};

const RelationContext = createContext<RelationContextType>({
	relations: [],
	refresh: () => new Promise((res) => res()),
	loading: false,
	shareRelation: () => new Promise((res) => res()),
	addRelationLocal: () => new Promise((res) => res()),
	removeRelations: () => Promise.resolve([] as [boolean,string][]),
});

export const useRelationContext = () => {
  const context = React.useContext(RelationContext);
  if (!context) {
    throw new Error('useRelationContext must be used within a RelationProvider');
  }
  return context;
};
export const RelationProvider = ({children}: React.PropsWithChildren) => {
  const [relations, setRelations] = React.useState<BaseTaskRelationsType[]>([]);
  const [loading, setLoading] = React.useState(false);

	const getRelations = async () => {
			setLoading(true);
			await Promise.all([getTaskRelations(), getServerRelations()])
			.then((values) => setRelations([...values[0], ...values[1]]))
			.finally(() => setLoading(false))
	}
	const refresh = async () => getRelations();

	const addRelationLocal = async (name: string) => {
		await createTasksRelations({name});	
		refresh();
	}
	const removeRelations = async (relations: BaseTaskRelationsType[]):Promise<[boolean,string][]> => {
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
	
	const shareRelation = async ({user, relations}: ShareRelationType) => {
		try{

			// push selected relations with tasks to server
			const response= await shareListWithUser({user, relationsToShare: relations});
			console.log('response from server', response);
			// here we need info about which relations are shared and which are not
			// delete current data from local database and replace it with data from server
			if(!response) return;
			const deleteLocalRelationsIds = relations.map((relations) => relations.id);
			const deleteRelationsPromises = deleteLocalRelationsIds.map(id => deleteRelationsWithTasks(id));
			console.log('delete these', deleteLocalRelationsIds, deleteRelationsPromises);
			const promises = await Promise.all(deleteRelationsPromises);
			console.log('delete these', deleteLocalRelationsIds, promises)
			console.log('add these', response)
			setRelations((prev) => prev.filter((relations) => !deleteLocalRelationsIds.includes(relations.id)))
			setRelations((prev) => [...prev, ...response.map((relation) => ({...relation, shared: 1}))]);
		}catch(e){
			console.log('error occurred', e);
			if(e instanceof Error){
				console.log('error occurred', e);
			}
			throw e;
		}
	}
  return(
    <RelationContext.Provider value={{relations, loading, refresh, shareRelation,addRelationLocal, removeRelations}}>
      {children}
    </RelationContext.Provider>
  )
};

