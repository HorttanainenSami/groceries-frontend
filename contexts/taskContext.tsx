import { useEffect, createContext,useState, useContext, Children, PropsWithChildren, SetStateAction } from 'react';
import { checkboxText } from '@/types';
import useStorage from '@/hooks/AsyncStorage';

type TaskContextProps = {
  tasks: checkboxText[],
  editTasks: (newTasks: checkboxText[]) => void,
  storeTasks: (newTasks: checkboxText[]) => void,
  refresh: () => void,
  loading: boolean,
 }
export const TaskContext = createContext<TaskContextProps>({
   tasks: [],
   editTasks : ([]) => {},
   storeTasks : ([]) => {},
   refresh : () => {},
   loading: true,
  });

export const useTaskStorage = () => useContext(TaskContext);

export const TaskContextProvider = ({children} : PropsWithChildren) => {
  const [tasks, setTasks] = useState<checkboxText[]>([]);
  const {editTasksInStorage,loading, getTasksFromStorage, storeTasksInStorage} = useStorage();

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const data = await getTasksFromStorage();
        setTasks(data);
      }catch(e) {
        console.log(e);
      }
    }
    fetchData();
    return () => {
      mounted = false;
    };
  },[])

  const editTasks = (newTasks: checkboxText[]) => {
    setTasks(newTasks);
    editTasksInStorage(newTasks);
  };
  const storeTasks = (newTasks: checkboxText[]) => {
    setTasks(newTasks);
    storeTasksInStorage(newTasks);
  };

  const refresh = () => {
    getTasksFromStorage().then(response => setTasks(response));
  };
  return(
    <TaskContext.Provider value={{loading, tasks, editTasks, storeTasks, refresh}} >
      {children}
    </TaskContext.Provider>
  );
};

