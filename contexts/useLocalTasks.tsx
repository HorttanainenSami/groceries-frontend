import { useRef, useState, useEffect } from 'react';
import { LocalTaskRelationType, TaskType, editTaskProps } from '@/types';
import {
  createTasks,
  getTasksById,
  toggleTask,
  editTask,
  removeTask,
} from '@/service/LocalDatabase';
import { useAuth } from '@/contexts/AuthenticationContext';
import { getSQLiteTimestamp } from '@/utils/utils';
const useLocalTasks = () => {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const { user } = useAuth();
  const relation = useRef<LocalTaskRelationType | null>(null);

  useEffect(() => {
    console.log('relation.current in useEffect:', relation.current);
    refresh();
  }, [relation.current?.id]);

  const refresh = async () => {
    if (!relation.current) {
      setTasks([]);
      return;
    }
    console.log('relation is locally stored:', relation.current.id);
    const result = await getTasksById(relation.current.id);
    console.log(JSON.stringify(result, null, 2));
    setTasks(result);
  };

  const changeRelation = (newRelation: LocalTaskRelationType) => {
    relation.current = newRelation;
    setTasks([]);
    console.log('relation.current changeRelation:', relation.current, newRelation);
  };
  const addTaskToDb = async (newTask: Omit<TaskType, 'id'>) => {
    console.log('newTask', newTask);
    const response = await createTasks(newTask);
    if (response) setTasks((prev) => [...prev, response]);
  };

  const editTaskToDb = async ({ id, task }: editTaskProps) => {
    await editTask({ id, task });
  };

  const isToggled = (task: TaskType): boolean => {
    if (!task?.completed_at && !task?.completed_by) return false;
    return true;
  };
  const removeTaskFromDb = async (id: string | string[]) => {
    if (Array.isArray(id)) {
      const promises = id.map(removeTask);
      const response = await Promise.all(promises);

      setTasks(
        tasks.filter(
          (t) =>
            !response
              .filter((i) => i !== null)
              .map((i) => i!.id)
              .includes(t.id)
        )
      );
      return response;
    }
    const data = await removeTask(id);
    console.log('data', data);
    if (data) setTasks(tasks.filter((t) => t.id !== data.id));
    return data;
  };

  const toggleTaskInDb = async (id: string) => {
    const togglableTask = tasks.find((t) => t.id === id);
    if (user?.id && togglableTask) {
      isToggled(togglableTask)
        ? await toggleTask({
            id: togglableTask.id,
            completed_at: null,
            completed_by: null,
          })
        : await toggleTask({
            id: togglableTask.id,
            completed_at: getSQLiteTimestamp(),
            completed_by: user?.id,
          });
    }
  };

  return {
    changeRelation,
    refresh,
    removeTaskFromDb,
    tasks,
    addTaskToDb,
    setTasks,
    editTaskToDb,
    toggleTaskInDb,
  };
};

export default useLocalTasks;
