import React, { createContext, useContext, PropsWithChildren, useState } from 'react';
import { BaseTaskRelationsType, TaskType } from '@/types';

type TaskContextProps = {
  relation: BaseTaskRelationsType | null;
  tasks: TaskType[];
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>;
  setRelation: React.Dispatch<React.SetStateAction<BaseTaskRelationsType | null>>;
};
export const TaskContext = createContext<TaskContextProps>({
  relation: null,
  tasks: [],
  setTasks: () => {},
  setRelation: () => {},
});

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskContextProvider');
  }
  return context;
};

export const TaskContextProvider = ({ children }: PropsWithChildren) => {
  const [relation, setRelation] = useState<BaseTaskRelationsType | null>(null);
  const [tasks, setTasks] = useState<TaskType[]>([]);

  return (
    <TaskContext.Provider
      value={{
        relation,
        setRelation,
        tasks,
        setTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
