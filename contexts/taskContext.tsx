import { RelationType, TaskType } from '@groceries/shared_types';
import React, { createContext, useContext, PropsWithChildren, useState } from 'react';

type TaskContextProps = {
  relationRef: React.RefObject<RelationType | null>;
  tasks: TaskType[];
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>;
};
export const TaskContext = createContext<TaskContextProps>({
  relationRef: React.createRef(),
  tasks: [],
  setTasks: () => {},
});

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskContextProvider');
  }
  return context;
};

export const TaskContextProvider = ({ children }: PropsWithChildren) => {
  const relationRef = React.useRef<RelationType | null>(null);
  const [tasks, setTasks] = useState<TaskType[]>([]);

  return (
    <TaskContext.Provider
      value={{
        relationRef,
        tasks: tasks.sort((a, b) => a.order_idx - b.order_idx),
        setTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
