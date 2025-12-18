import useLocalTasks from '@/hooks/useLocalTasks';
import useAuth from '@/hooks/useAuth';
import useTaskSocket from '@/hooks/useTaskSocket';
import React from 'react';
import { useTaskContext } from '@/contexts/taskContext';
import { RelationType, TaskType } from '@groceries/shared_types';

const useTaskStorage = () => {
  const { relation, setTasks, tasks, setRelation } = useTaskContext();
  const loading = React.useRef<boolean>(false);
  const { user } = useAuth();
  const localTasks = useLocalTasks();

  const handleTaskCreatedBroadcast = React.useCallback(
    (task: TaskType) => {
      setTasks((prev) => [...prev, task]);
    },
    [setTasks]
  );

  const handleTaskEditedBroadcast = React.useCallback(
    (task: TaskType) => {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    },
    [setTasks]
  );

  const handleTaskRemovedBroadcast = React.useCallback(
    (tasks: TaskType[]) => {
      const removedIds = tasks.map((t) => t.id);
      setTasks((prev) => prev.filter((t) => !removedIds.includes(t.id)));
    },
    [setTasks]
  );
  const handleTaskReorderedBroadcast = React.useCallback(
    (tasks: TaskType[]) => {
      const taskMap = new Map(tasks.map((t) => [t.id, t]));
      setTasks((prev) => prev.map((t) => taskMap.get(t.id) ?? t));
    },
    [setTasks]
  );

  const { emitCreateTask, emitEditTask, emitRemoveTask, emitJoinTaskRoom, emitReorderTask } =
    useTaskSocket({
      onTaskCreated: handleTaskCreatedBroadcast,
      onTaskEdited: handleTaskEditedBroadcast,
      onTaskRemoved: handleTaskRemovedBroadcast,
      onTaskReordered: handleTaskReorderedBroadcast,
    });

  const isLocal = (relation: RelationType) => relation.relation_location === 'Local';

  const refresh = async (relation: RelationType) => {
    setRelation(relation);
    if (!isLocal(relation)) {
      try {
        const response = await emitJoinTaskRoom(relation.id);
        setTasks(response.tasks);
      } catch (error) {
        console.error('Failed to join task room:', error);
      }
      return;
    }
    const refreshedTasks = await localTasks.refresh(relation.id);

    setTasks(refreshedTasks);
  };
  const reorderTasks = async (reorderedTasks: TaskType[]) => {
    if (tasks.length !== reorderedTasks.length) {
      return;
    }
    if (relation === null) return;
    const changedTasks = reorderedTasks.filter(
      (task) => tasks.find((t) => t.id === task.id)?.order_idx !== task.order_idx
    );

    setTasks(reorderedTasks);

    if (!isLocal(relation)) {
      if (changedTasks.length !== 0) {
        emitReorderTask(changedTasks);
      }
      return;
    }
    await localTasks.reorderTasksInDb(reorderedTasks);
  };
  const editTask = async (newTasks: TaskType) => {
    if (relation === null) return;
    if (!isLocal(relation)) {
      try {
        const editedTask = await emitEditTask(newTasks);
        setTasks((prev) => prev.map((task) => (task.id === newTasks.id ? editedTask : task)));
      } catch (error) {
        console.error('Failed to edit task:', error);
      }
      return;
    }
    const editedTask = await localTasks.editTaskToDb(newTasks);
    setTasks((prev) => prev.map((task) => (task.id === newTasks.id ? editedTask : task)));
  };
  const storeTask = async (newTasks: Omit<TaskType, 'id'>) => {
    if (relation === null) return;
    const initNewTask = { ...newTasks, task_relations_id: relation.id };

    if (!isLocal(relation)) {
      console.log(initNewTask);
      try {
        const response = await emitCreateTask(initNewTask as TaskType);
        if (Array.isArray(response)) {
          setTasks((prev) => [...prev, ...response]);
          return response[0];
        } else {
          setTasks((prev) => [...prev, response]);
          return response;
        }
      } catch (error) {
        console.error('Failed to create task:', error);
      }
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

    if (!isLocal(relation)) {
      try {
        const toggledTask = await emitEditTask(initToggledTask);
        setTasks((prev) => prev.map((t) => (t.id === task.id ? toggledTask : t)));
      } catch (error) {
        console.error('Failed to toggle task:', error);
      }
      return;
    }
    const toggledTask = await localTasks.toggleTaskInDb(initToggledTask);
    setTasks((prev) => prev.map((t) => (t.id === task.id ? toggledTask : t)));
  };
  const removeTask = async (task: TaskType | TaskType[]) => {
    if (!relation) return;
    const tasksArray = Array.isArray(task) ? task : [task];

    if (!isLocal(relation)) {
      try {
        const removedTasks = await emitRemoveTask(tasksArray);
        const responseIds = removedTasks.map((task) => task.id);
        setTasks((prev) => prev.filter((task) => !responseIds.includes(task.id)));
      } catch (error) {
        console.error('Failed to remove task:', error);
      }
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
    reorderTasks,
  };
};

export default useTaskStorage;
