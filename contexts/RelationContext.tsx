import { ServerRelationType, LocalRelationType } from '@groceries/shared_types';
import React, { createContext } from 'react';

type RelationContextType = {
  relations: (LocalRelationType | ServerRelationType)[];
  setRelations: React.Dispatch<React.SetStateAction<(LocalRelationType | ServerRelationType)[]>>;
};

const RelationContext = createContext<RelationContextType>({
  relations: [],
  setRelations: () => {},
});

export const useRelationContext = () => {
  const context = React.useContext(RelationContext);
  if (!context) {
    throw new Error('useRelationContext must be used within a RelationProvider');
  }
  return context;
};
export const RelationProvider = ({ children }: React.PropsWithChildren) => {
  const [relations, setRelations] = React.useState<(LocalRelationType | ServerRelationType)[]>([]);

  return (
    <RelationContext.Provider
      value={{
        relations,
        setRelations,
      }}
    >
      {children}
    </RelationContext.Provider>
  );
};
