import useAuth from '@/hooks/useAuth';
import useTaskSocket from '@/hooks/useTaskSocket';
import React, { useCallback, useEffect, useRef } from 'react';
import { useTaskContext } from '@/contexts/taskContext';
import { RelationType, TaskType } from '@groceries/shared_types';
import { useSyncContext } from '@/contexts/SyncContext';
import { taskDAO } from '@/service/LocalDatabase';
import { useFocusEffect } from 'expo-router';
import { relationsDAO } from '@/service/LocalDatabase';
import { randomUUID } from 'expo-crypto';

const useTaskStorage = () => {
  const { relationRef, setTasks, tasks } = useTaskContext();
  const loading = React.useRef<boolean>(false);
  const { user } = useAuth();
  const { addToQueue, lastTimeSynced, isSyncing, pendingOperations } = useSyncContext();
  const isMounted = useRef(false);

  useFocusEffect(
    useCallback(() => {
      isMounted.current = true;
      return () => {
        isMounted.current = false;
      };
    }, [])
  );

  const handleTaskCreatedBroadcast = React.useCallback(
    async (tasks: TaskType[]) => {
      setTasks((prev) => [...prev, ...tasks]);
      console.log('hello from broadcast', tasks);
      await taskDAO.insertCached(tasks);
    },
    [setTasks]
  );

  const handleTaskEditedBroadcast = React.useCallback(
    async (task: TaskType) => {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      await taskDAO.update({ id: task.id, task: task.task });
    },
    [setTasks]
  );

  const handleTaskRemovedBroadcast = React.useCallback(
    async (tasks: TaskType[]) => {
      const removedIds = new Set(tasks.map((t) => t.id));
      setTasks((prev) => prev.filter((t) => !removedIds.has(t.id)));
      const promises = tasks.map(({ id }) => taskDAO.remove(id));
      await Promise.all(promises);
    },
    [setTasks]
  );

  const handleTaskReorderedBroadcast = React.useCallback(
    async (tasks: TaskType[]) => {
      const taskMap = new Map(tasks.map((t) => [t.id, t]));
      setTasks((prev) => [...prev.map((t) => taskMap.get(t.id) ?? t)]);
      await taskDAO.reorder(tasks);
    },
    [setTasks]
  );

  const { emitJoinTaskRoom, connected } = useTaskSocket({
    onTaskCreated: handleTaskCreatedBroadcast,
    onTaskEdited: handleTaskEditedBroadcast,
    onTaskRemoved: handleTaskRemovedBroadcast,
    onTaskReordered: handleTaskReorderedBroadcast,
  });
  const isLocal = (relation: RelationType) => relation.relation_location === 'Local';

  useEffect(() => {
    // perforrm refresh if connected and mounted
    const relation = relationRef.current;
    if (
      connected &&
      isMounted.current &&
      relation &&
      !isSyncing &&
      pendingOperations.length === 0
    ) {
      (async () => {
        const freshRelation = await relationsDAO.get(relation.id);
        if (!freshRelation) return;
        refresh(freshRelation);
      })();
    }
  }, [connected, lastTimeSynced]);

  const refresh = async (relation: RelationType) => {
    if (loading.current) return;

    loading.current = true;
    try {
      relationRef.current = relation;
      //fetch tasks from cache
      const refreshedTasks = await taskDAO.getById(relation.id);

      if (isLocal(relation) || !connected) {
        loading.current = false;
        setTasks(refreshedTasks);

        return;
      }

      const response = await emitJoinTaskRoom(relation.id);

      await taskDAO.replaceAllCached(response.tasks, relationRef.current.id);
      const updated = await taskDAO.getById(relation.id);
      setTasks(updated);
    } catch (error) {
      console.error('Failed to refresh tasks:', error);
    } finally {
      loading.current = false;
    }
  };

  const reorderTasks = async (reorderedTasks: TaskType[]) => {
    try {
      if (tasks.length !== reorderedTasks.length) {
        return;
      }
      if (relationRef.current === null) return;
      const tasksMap = new Map(tasks.map(({ id, order_idx }) => [id, order_idx]));
      const tasksOrderModified = reorderedTasks.filter(
        (task) => tasksMap.get(task.id) !== task.order_idx
      );
      if (tasksOrderModified.length === 0) {
        return;
      }

      setTasks(reorderedTasks);
      await taskDAO.reorder(tasksOrderModified);

      if (!isLocal(relationRef.current)) {
        if (tasksOrderModified.length !== 0) {
          addToQueue({ type: 'task-reorder', data: tasksOrderModified });
        }
      }
    } catch (e) {
      console.log(e);
    }
  };
  const editTask = async (newTask: TaskType) => {
    if (relationRef.current === null) return;
    //cache
    const editedTask = await taskDAO.update({ id: newTask.id, task: newTask.task });
    if (!editedTask) return;
    setTasks((prev) => prev.map((task) => (task.id === editedTask.id ? editedTask : task)));
    //que if in server
    if (!isLocal(relationRef.current)) {
      addToQueue({ type: 'task-edit', data: newTask });
      return;
    }
  };
  const storeTask = async (newTask: Omit<TaskType, 'id' | 'last_modified'>) => {
    if (relationRef.current === null) return;
    const initNewTask = {
      ...newTask,
      id: randomUUID(),
      task_relations_id: relationRef.current.id,
      last_modified: new Date().toISOString(),
    };
    //cache
    const storedTask = await taskDAO.create(initNewTask);
    if (!storedTask) return;
    setTasks((prev) => [...prev, storedTask]);
    //que
    if (!isLocal(relationRef.current)) {
      console.log('server relation, ', JSON.stringify(relationRef.current));
      addToQueue({ type: 'task-create', data: storedTask });
    }
    return storedTask;
  };

  const isToggled = (task: TaskType): boolean => {
    if (!task?.completed_at && !task?.completed_by) return false;
    return true;
  };
  const toggleTask = async (task: TaskType) => {
    if (!relationRef.current || !user?.id) return;
    const initToggledTask = isToggled(task)
      ? { ...task, completed_at: null, completed_by: null }
      : {
          ...task,
          completed_at: new Date().toISOString(),
          completed_by: user.id,
        };
    setTasks((prev) => prev.map((t) => (t.id === task.id ? initToggledTask : t)));
    const toggledTask = await taskDAO.toggle({
      id: initToggledTask.id,
      completed_at: initToggledTask.completed_at,
      completed_by: initToggledTask.completed_by,
    });

    if (!isLocal(relationRef.current)) {
      addToQueue({ type: 'task-toggle', data: toggledTask });
    }
  };
  const removeTask = async (task: TaskType | TaskType[]) => {
    if (!relationRef.current) return;
    const tasksArray = Array.isArray(task) ? task : [task];

    const promises = tasksArray.map(({ id }) => taskDAO.remove(id));
    const response = await Promise.all(promises);
    const responseIds = response.filter((i) => i !== null).map((task) => task.id);
    setTasks((prev) => prev.filter((task) => !responseIds.includes(task.id)));

    if (!isLocal(relationRef.current)) {
      response
        .filter((i) => i !== null)
        .map((task) => addToQueue({ type: 'task-delete', data: task }));
    }
  };

  return {
    relation: relationRef.current,
    tasks,
    setTasks,
    loading: loading.current,
    refresh,
    editTask,
    storeTask,
    toggleTask,
    removeTask,
    reorderTasks,
    isSyncing,
  };
};

export default useTaskStorage;
