import { useRef, useState, useEffect } from 'react';
import { TaskType, ServerTaskRelationType, editTaskProps } from '@/types';
import { useAuth } from '@/contexts/AuthenticationContext';
import { getSQLiteTimestamp } from '@/utils/utils';
import {
  createTaskForServerRelation,
  editTaskFromServerRelation,
  getServerTasksByRelationId,
  removeTaskFromServerRelation,
} from '@/service/database';
const useServerTasks = () => {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const { user } = useAuth();
  const relation = useRef<ServerTaskRelationType | null>(null);

  useEffect(() => {
    refresh();
  }, [relation.current?.id]);

  const refresh = async () => {
    if (!relation.current) {
      setTasks([]);
      return;
    }
    const result = await getServerTasksByRelationId(relation.current.id);
    console.log(JSON.stringify(result, null, 2));
    const tasks = result.tasks;
    console.log(JSON.stringify(tasks, null, 2));
    setTasks(tasks);
  };

  const changeRelation = (newRelation: ServerTaskRelationType) => {
    relation.current = newRelation;
    setTasks([]);
    console.log('relation.current:', relation.current);
  };
  const addTaskToDb = async (newTask: Omit<TaskType, 'id'>) => {
    console.log('newTask', newTask);
    if (relation.current === null) return;
    const response = await createTaskForServerRelation(
      relation.current.id,
      newTask
    );
    console.log('response in addTaskToDB', response);
    setTasks((prevTasks) => [...prevTasks, response]);
  };

  const editTaskToDb = async ({ id, text }: editTaskProps) => {
    if (relation.current === null) return;
    await editTaskFromServerRelation(relation.current.id, { id, text });
  };

  const isToggled = (task: TaskType): boolean => {
    if (!task?.completed_at && !task?.completed_by) return false;
    return true;
  };
  const removeTaskFromDb = async (ids: string | string[]) => {
    if (Array.isArray(ids)) {
      const promises = ids.map((id) =>
        removeTaskFromServerRelation(relation.current?.id as string, id)
      );
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
    const data = await removeTaskFromServerRelation(
      relation.current?.id as string,
      ids
    );
    setTasks(tasks.filter((t) => t.id !== data.id));
    return data;
  };

  const toggleTaskInDb = async (id: string) => {
    if (relation.current === null) return;
    const togglableTask = tasks.find((t) => t.id === id);
    if (user?.id && togglableTask) {
      const response = isToggled(togglableTask)
        ? await editTaskFromServerRelation(togglableTask.task_relations_id, {
            id,
            completed_at: null,
            completed_by: null,
          })
        : await editTaskFromServerRelation(togglableTask.task_relations_id, {
            id,
            completed_at: getSQLiteTimestamp(),
            completed_by: user?.id,
          });

      console.log(response);
      setTasks((prevTasks) => [
        ...prevTasks.map((t) => (t.id === id ? response : t)),
      ]);
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

export default useServerTasks;
