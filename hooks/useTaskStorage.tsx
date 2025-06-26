import useLocalTasks from '@/hooks/useLocalTasks';
import useAuth from '@/hooks/useAuth';
import useTaskSocket from '@/hooks/useTaskSocket';
import React from 'react';
import { BaseTaskRelationsType, TaskType } from '@/types';
import { useTaskContext } from '@/contexts/taskContext';
import { useSocketContext } from '@/contexts/SocketContext';

const useTaskStorage = () => {
  const { relation, setTasks, tasks, setRelation } = useTaskContext();
  const loading = React.useRef<boolean>(false);
  const { user } = useAuth();
  const localTasks = useLocalTasks();
  const { waitConnection } = useSocketContext();
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
    loading && waitConnection();
    if (!isLocal(relation)) {
      emitJoinTaskRoom(relation);
      return;
    }
    const refreshedTasks = await localTasks.refresh(relation.id);

    setTasks(refreshedTasks);
  };
  const editTask = async (newTasks: TaskType) => {
    if (relation === null) return;
    socketLoading && waitConnection();
    if (isConnected()) {
      emitEditTask(newTasks);
      return;
    }
    const editedTask = await localTasks.editTaskToDb(newTasks);
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
    const storedTask = await localTasks.addTaskToDb(initNewTask);
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
    const toggledTask = await localTasks.toggleTaskInDb(initToggledTask);
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
    const response = await localTasks.removeTaskFromDb(tasksArray);
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
