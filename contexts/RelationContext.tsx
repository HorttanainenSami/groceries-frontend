
import { getServerRelations, shareListWithUser } from '@/service/database';
import { createTasksRelations, getTaskRelations } from '@/service/LocalDatabase';
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
};

const RelationContext = createContext<RelationContextType>({
	relations: [],
	refresh: () => new Promise((res) => res()),
	loading: false,
	shareRelation: () => new Promise((res) => res()),
	addRelationLocal: () => new Promise((resolve) => resolve()),
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
	
	const shareRelation = async ({user, relations}: ShareRelationType) => {
		// push selected relations with tasks to server
    const response= await shareListWithUser({user, relationsToShare: relations});
    console.log('response' , response);
    // delete current data from local database and replace it with data from server
	}
  return(
    <RelationContext.Provider value={{relations, loading, refresh, shareRelation,addRelationLocal}}>
      {children}
    </RelationContext.Provider>
  )
};

