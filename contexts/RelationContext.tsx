import { BaseTaskRelationsType, ServerTaskRelationType } from '@/types';
import React, { createContext } from 'react';

type RelationContextType = {
  relations: BaseTaskRelationsType[] | ServerTaskRelationType[];
  setRelations: React.Dispatch<
    React.SetStateAction<BaseTaskRelationsType[] | ServerTaskRelationType[]>
  >;
};

const RelationContext = createContext<RelationContextType>({
  relations: [],
  setRelations: () => {},
});

export const useRelationContext = () => {
  const context = React.useContext(RelationContext);
  if (!context) {
    throw new Error(
      'useRelationContext must be used within a RelationProvider'
    );
  }
  return context;
};
export const RelationProvider = ({ children }: React.PropsWithChildren) => {
  const [relations, setRelations] = React.useState<BaseTaskRelationsType[]>([]);

  return (
    <RelationContext.Provider
      value={{
        relations,
        setRelations,
      }}>
      {children}
    </RelationContext.Provider>
  );
};
