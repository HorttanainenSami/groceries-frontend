import useLocalTasks from '@/hooks/useLocalTasks';
import useServerTasks from './useServerTasks';
import useAuth from '@/hooks/useAuth';
import useTaskSocket from '@/hooks/useTaskSocket';
import React, { useEffect } from 'react';
import { BaseTaskRelationsType, TaskType } from '@/types';
import { useTaskContext } from '@/contexts/taskContext';

const useTaskStorage = () => {
  const { relation, setTasks, tasks, setRelation } = useTaskContext();
  const loading = React.useRef<boolean>(false);
  const { user } = useAuth();
  const localTasks = useLocalTasks();
  const serverTasks = useServerTasks();
  const {
    loading: socketLoading,
    socket,
    isConnected,
    emitCreateTask,
    emitEditTask,
    emitRemoveTask,
    emitJoinTaskRoom,
  } = useTaskSocket(setTasks);

  

  const isLocal = (relation: BaseTaskRelationsType) =>
    relation.relation_location === 'Local';

  const refresh = async (relation: BaseTaskRelationsType) => {
    setRelation(relation);
    if (socket) {
      emitJoinTaskRoom(relation);
      return;
    }
    const refreshedTasks = isLocal(relation)
      ? await localTasks.refresh(relation.id)
      : await serverTasks.refresh(relation.id);
    setTasks(refreshedTasks);
  };
  const waitConnection = () => (
    new Promise<void>((resolve) => {
      if (!socketLoading) {
        resolve();
      } else {
        let count = 0
        const interval = setInterval(() => {
          if (!socketLoading|| count > 5) {
            clearInterval(interval);
            resolve();
          }
          console.log(`Waiting for socket connection... ${count}s`);
          count++;
        }, 1000);
        
      }
    }
  ))
  const editTask = async (newTasks: TaskType) => {
    if (relation === null) return;
    socketLoading && waitConnection();
    if (isConnected()) {
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
    socketLoading && waitConnection();

    if (isConnected()) {
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
    socketLoading && waitConnection();

    if (isConnected()) {
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
    socketLoading && waitConnection();

    if (isConnected()) {
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
