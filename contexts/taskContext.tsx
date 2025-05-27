import React, {
  useRef,
  createContext,
  useContext,
  PropsWithChildren,
  useState,
  useEffect,
} from 'react';
import { BaseTaskRelationsType, TaskType } from '@/types';
import useLocalTasks from '@/contexts/useLocalTasks';
import useServerTasks from './useServerTasks';
import { useAuth } from './AuthenticationContext';
import useRelationSocket from '@/hooks/useRelationSocket';

type TaskContextProps = {
  relation: BaseTaskRelationsType | null;
  tasks: TaskType[];
  editTask: (newTask: TaskType) => void;
  storeTask: (newTask: Omit<TaskType, 'id'>) => void;
  refresh: (relation: BaseTaskRelationsType) => void;
  toggleTask: (task: TaskType) => void;
  removeTask: (task: TaskType | TaskType[]) => void;
  loading: boolean;
};
export const TaskContext = createContext<TaskContextProps>({
  relation: null,
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
  const { user } = useAuth();
  const {
    socket,
    isConnected,
    connectToSocket,
    emitCreateTask,
    emitEditTask,
    emitRemoveTask,
  } = useRelationSocket();

  useEffect(() => {
    if (!socket) return;
    socket.on('taskCreated', (data: TaskType) => {
      setTasks((prev) => [...prev, data]);
    });
    socket.on('taskEdited', (data: TaskType) => {
      setTasks((prev) =>
        prev.map((task) => (task.id === data.id ? data : task))
      );
    });
    socket.on('tasksRemoved', (data: TaskType[]) => {
      const ids = data.map((task) => task.id);
      setTasks((prev) => prev.filter((task) => !ids.includes(task.id)));
    });
  }, [socket]);

  const isLocal = (relation: BaseTaskRelationsType) =>
    relation.relation_location === 'Local';

  const refresh = async (relation: BaseTaskRelationsType) => {
    setRelation(relation);
    connectToSocket(relation);
    const refreshedTasks = isLocal(relation)
      ? await localTasks.refresh(relation.id)
      : await serverTasks.refresh(relation.id);
    setTasks(refreshedTasks);
  };
  const editTask = async (newTasks: TaskType) => {
    if (relation === null) return;
    if (isConnected) {
      emitEditTask(newTasks);
      return;
    }
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
    if (isConnected) {
      emitCreateTask(initNewTask);
      return;
    }
    const storedTask = isLocal(relation)
      ? await localTasks.addTaskToDb(initNewTask)
      : await serverTasks.addTaskToDb(initNewTask);
    setTasks((prev) => [...prev, storedTask]);
    return storedTask;
  };
  const isToggled = (task: TaskType): boolean => {
    if (!task?.completed_at && !task?.completed_by) return false;
    return true;
  };
  const toggleTask = async (task: TaskType) => {
    if (!relation || !user?.id) return;
    const initToggledTask = isToggled(task)
      ? { ...task, completed_at: null, completed_by: null }
      : {
          ...task,
          completed_at: new Date().toISOString(),
          completed_by: user.id,
        };
    if (isConnected) {
      emitEditTask(initToggledTask);
      return;
    }
    const toggledTask = isLocal(relation)
      ? await localTasks.toggleTaskInDb(initToggledTask)
      : await serverTasks.toggleTaskInDb(initToggledTask);
    setTasks((prev) => prev.map((t) => (t.id === task.id ? toggledTask : t)));
  };
  const removeTask = async (task: TaskType | TaskType[]) => {
    if (!relation) return;
    const tasksArray = Array.isArray(task) ? task : [task];

    if (isConnected) {
      emitRemoveTask(tasksArray);
      return;
    }
    const response = isLocal(relation)
      ? await localTasks.removeTaskFromDb(tasksArray)
      : await serverTasks.removeTaskFromDb(tasksArray);
    const responseIds = response.map((task) => task.id);
    setTasks((prev) => prev.filter((task) => !responseIds.includes(task.id)));
  };

  return (
    <TaskContext.Provider
      value={{
        relation,
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
