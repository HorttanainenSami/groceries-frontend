import {
  useRef,
  createContext,
  useContext,
  PropsWithChildren,
  useState,
} from 'react';
import {
  BaseTaskRelationsType,
  TaskType,
} from '@/types';
import useLocalTasks from '@/contexts/useLocalTasks';
import useServerTasks from './useServerTasks';
import { useAuth } from './AuthenticationContext';

type TaskContextProps = {
  tasks: TaskType[];
  editTask: (newTask: TaskType) => void;
  storeTask: (newTask: Omit<TaskType, 'id'>) => void;
  refresh: (relation:BaseTaskRelationsType) => void;
  toggleTask: (task: TaskType) => void;
  removeTask: (ids: string | string[]) => void;
  loading: boolean;
};
export const TaskContext = createContext<TaskContextProps>({
  tasks: [],
  editTask: () => {},
  storeTask: () => {},
  toggleTask: () => {},
  refresh: () => {},
  removeTask: () => {},
  loading: true,
});

export const useTaskStorage = () => useContext(TaskContext);

export const TaskContextProvider = ({ children }: PropsWithChildren) => {
  const loading = useRef<boolean>(true);
  const [relation, setRelation] = useState<BaseTaskRelationsType | null>(null);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const localTasks = useLocalTasks();
  const serverTasks = useServerTasks();
  const {user} = useAuth();

  const isLocal = (relation: BaseTaskRelationsType) =>
    relation.relation_location === 'Local';

  const refresh = async (relation: BaseTaskRelationsType) => {
    setRelation(relation);
    const refreshedTasks = isLocal(relation)
      ? await localTasks.refresh(relation.id)
      : await serverTasks.refresh(relation.id);
    setTasks(refreshedTasks);
  };
  const editTask = async (newTasks: TaskType) => {
    if (relation === null) return;

    const editedTask = isLocal(relation)
      ? await localTasks.editTaskToDb(newTasks)
      : await serverTasks.editTaskToDb(newTasks);
    setTasks((prev) =>
      prev.map((task) => (task.id === newTasks.id ? editedTask : task))
    );
  };
  const storeTask = async (newTasks: Omit<TaskType, 'id'>) => {
    if (relation === null) return;
    const initNewTask = { ...newTasks, relation_id: relation.id };
    const storedTask = isLocal(relation)
      ? await localTasks.addTaskToDb(initNewTask)
      : await serverTasks.addTaskToDb(initNewTask);
    setTasks((prev) => [...prev, storedTask]);
    return storedTask;
  };
  const toggleTask = async (task: TaskType) => {
    if (!relation||!user?.id) return;

    const toggledTask = isLocal(relation)
      ? await localTasks.toggleTaskInDb(task, user.id)
      : await serverTasks.toggleTaskInDb(task, user.id);
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? toggledTask : t))
    );
  };
  const removeTask = async (ids: string | string[]) => {
    if (!relation) return;
    const idsArray = Array.isArray(ids) ? ids : [ids];
    const response = isLocal(relation)
      ? await localTasks.removeTaskFromDb(idsArray.map((id) => ({ id, relation_id: relation.id })))
      : await serverTasks.removeTaskFromDb(idsArray.map((id) => ({ id, relation_id: relation.id })));
      const responseIds = response.map((task) => task.id);
    setTasks((prev) => prev.filter((task) => responseIds.includes(task.id)));

  };

  return (
    <TaskContext.Provider
      value={{
        removeTask,
        loading: loading.current,
        toggleTask,
        tasks,
        editTask,
        storeTask,
        refresh,
      }}>
      {children}
    </TaskContext.Provider>
  );
};
