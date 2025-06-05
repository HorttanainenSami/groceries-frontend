import useLocalTasks from '@/hooks/useLocalTasks';
import useServerTasks from './useServerTasks';
import useAuth from '@/hooks/useAuth';
import useTaskSocket from '@/hooks/useTaskSocket';
import React, {
  useEffect,
} from 'react';
import { BaseTaskRelationsType, TaskType } from '@/types';
import { useTaskContext } from '@/contexts/taskContext';


const useTaskStorage = () => {
  const { relation, setTasks, tasks, setRelation } = useTaskContext();
  const loading = React.useRef<boolean>(false);
  const { user } = useAuth();
  const localTasks = useLocalTasks();
  const serverTasks = useServerTasks();
  const {
    socket,
    isConnected,
    connectToSocket,
    emitCreateTask,
    emitEditTask,
    emitRemoveTask,
    emitRefresh,
    socketDisconnect,
    loading: socketLoading,
  } = useTaskSocket();

  useEffect(() => {
    if (!socket) return;
    socket.on('taskCreated', (data: TaskType) => {
      console.log('taskCreated', data);
      setTasks((prev) => [...prev, data]);
    });
    socket.on('taskEdited', (data: TaskType) => {
      console.log('taskEdited', data);
      setTasks((prev) =>
        prev.map((task) => (task.id === data.id ? data : task))
      );
    });
    socket.on('tasksRemoved', (data: TaskType[]) => {
      console.log('tasksRemoved', data);
      const ids = data.map((task) => task.id);
      setTasks((prev) => prev.filter((task) => !ids.includes(task.id)));
    });
    socket.on('taskRefresh', (data: any) => {
      ///HERE FIX THIS backend sends stupid data if no tasks are present
      //make schema for this or give better data from backend
      console.log('taskRefreshed', data);
      setTasks(data.tasks);
    });
    return () => {
      socketDisconnect();
    };
  }, [socket]);

  useEffect(() => {
    loading.current = socketLoading;
  }, [socketLoading]);

  const isLocal = (relation: BaseTaskRelationsType) =>
    relation.relation_location === 'Local';

  const refresh = async (relation: BaseTaskRelationsType) => {
    setRelation(relation);
    const connect = await connectToSocket(relation);
    if (connect) {
      emitRefresh(relation);
      return;
    }
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

  return {
    relation,
    tasks,
    setTasks,
    setRelation,
    loading: loading.current,
    refresh,
    editTask,
    storeTask,
    toggleTask,
    removeTask,
  };
};


export default useTaskStorage;