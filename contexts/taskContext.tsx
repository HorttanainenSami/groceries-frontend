import { useRef, useEffect, createContext,useState, useContext, Children, PropsWithChildren, SetStateAction } from 'react';
import { TaskType } from '@/types';
import useTasks from '@/contexts/useTasks'

type TaskContextProps = {
  tasks: TaskType[],
  editTask: (newTask: TaskType) => void,
  storeTask: (newTask: Omit<TaskType, 'id'>) => void,
  refresh: () => void,
  changeRelationId: (id: number) => void,
  toggleTask : (id:number) => void,
  removeTask : (ids:number|number[]) => void,
  loading: boolean,
 }
export const TaskContext = createContext<TaskContextProps>({
   tasks: [],
   editTask : () => {},
   storeTask : () => {},
   toggleTask : () => {},
   refresh : () => {},
   changeRelationId : () => {},
   removeTask : () => {},
   loading: true,
  });

export const useTaskStorage = () => useContext(TaskContext);

export const TaskContextProvider = ({children} : PropsWithChildren) => {
  const [listOfTasks, setListOfTasks] = useState<TaskType[]>([]);
  const loading  = useRef<boolean>(true);
  const {toggleTaskInDb,changeRelation, refresh, removeTaskFromDb, tasks, addTaskToDb, setTasks, editTaskToDb} = useTasks();


  const editTask = async (newTasks: TaskType) => {
    await editTaskToDb({id:newTasks.id, text: newTasks.text});
    await refresh();
  }
  const storeTask = async (newTasks: Omit<TaskType, 'id'>) =>{
    await addTaskToDb(newTasks);
    await refresh();
  }
  const toggleTask = async (id: number) =>{
    await toggleTaskInDb(id);
    await refresh();
  }
  const removeTask = async (ids: number|number[]) =>{
    await removeTaskFromDb(ids);
    await refresh();
  }
  const changeRelationId = async (id:number) => {
    loading.current = true;
    await changeRelation(id);
    await refresh();
    loading.current=false;
  };

  return(
    <TaskContext.Provider value={{ removeTask, changeRelationId, loading: loading.current, toggleTask, tasks, editTask, storeTask, refresh}} >
      {children}
    </TaskContext.Provider>
  );
};

