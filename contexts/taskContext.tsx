import { useRef, createContext, useContext, PropsWithChildren, useState } from 'react';
import { ServerTaskRelationSchema, BaseTaskRelationsType, LocalTaskRelationSchema, TaskType } from '@/types';
import useLocalTasks from '@/contexts/useLocalTasks'
import useServerTasks from './useServerTasks';

type TaskContextProps = {
  tasks: TaskType[],
  editTask: (newTask: TaskType) => void,
  storeTask: (newTask: Omit<TaskType, 'id'>) => void,
  refresh: () => void,
  changeRelationContext: (relation: BaseTaskRelationsType) => void,
  toggleTask : (id:string) => void,
  removeTask : (ids:string|string[]) => void,
  loading: boolean,
 }
export const TaskContext = createContext<TaskContextProps>({
   tasks: [],
   editTask : () => {},
   storeTask : () => {},
   toggleTask : () => {},
   refresh : () => {},
   changeRelationContext : () => {},
   removeTask : () => {},
   loading: true,
  });

export const useTaskStorage = () => useContext(TaskContext);

export const TaskContextProvider = ({children} : PropsWithChildren) => {
  const loading  = useRef<boolean>(true);
  const [relation, setRelation] = useState<BaseTaskRelationsType|null>(null);
  const localTasks = useLocalTasks();
  const serverTasks = useServerTasks();
  const taskManager = (relations: BaseTaskRelationsType) => relations.relation_location === 'Local' ? localTasks : serverTasks;

  const tasks = () => {
    if(relation === null) return [];
    return taskManager(relation).tasks;
  }  
  const refresh = () => {
    if(relation === null) return {};
    return taskManager(relation).refresh();
  }  
  const editTask = async (newTasks: TaskType) => {
    if(relation === null) return;
    
      await taskManager(relation).editTaskToDb({id:newTasks.id, text: newTasks.text});
      await taskManager(relation).refresh();
    
  };
    const storeTask = async (newTasks: Omit<TaskType, 'id'>) =>{
    if(relation === null) return;

    console.log('newTasks', newTasks);
    await taskManager(relation).addTaskToDb(newTasks);
  }
  const toggleTask = async (id: string) =>{
    if(relation === null) return;
    
    await taskManager(relation).toggleTaskInDb(id);
    await taskManager(relation).refresh();
  }
  const removeTask = async (ids: string|string[]) =>{
    if(relation === null) return;
    await taskManager(relation).removeTaskFromDb(ids);
  }
  const changeRelationContext = async (relation:BaseTaskRelationsType) => {
    if(relation === null) return;
    loading.current = true;
    setRelation(relation);
    if (relation.relation_location === 'Local') {
      const parsedRelation = LocalTaskRelationSchema.parse(relation);
      localTasks.changeRelation(parsedRelation);
    }else if(relation.relation_location === 'Server'){
      const parsedRelation = ServerTaskRelationSchema.parse(relation);
      serverTasks.changeRelation(parsedRelation);
    }else {
      console.log('relation doenst have location');
      loading.current = false;
      return;
    }
    await taskManager(relation).refresh();
    loading.current=false;
  };

  return(
    <TaskContext.Provider value={{ removeTask, changeRelationContext, loading: loading.current, toggleTask, tasks:tasks(), editTask, storeTask, refresh}} >
      {children}
    </TaskContext.Provider>
  );
};

