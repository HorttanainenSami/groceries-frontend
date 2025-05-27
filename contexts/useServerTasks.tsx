import { TaskType } from '@/types';
import { getSQLiteTimestamp } from '@/utils/utils';
import {
  createTaskForServerRelation,
  editTaskFromServerRelation,
  getServerTasksByRelationId,
  removeTaskFromServerRelation,
} from '@/service/database';
const useServerTasks = () => {
  const refresh = async (id: string) => {
    const { tasks } = await getServerTasksByRelationId(id);
    console.log(JSON.stringify(tasks, null, 2));
    return tasks;
  };

  const addTaskToDb = async (
    newTask: Omit<TaskType, 'id'>
  ): Promise<TaskType> => {
    console.log('newTask', newTask);
    const response = await createTaskForServerRelation(newTask);
    console.log('response in addTaskToDB', response);
    return response;
  };

  const editTaskToDb = async ({
    id,
    task,
    task_relations_id,
  }: TaskType): Promise<TaskType> => {
    return await editTaskFromServerRelation(task_relations_id, { id, task });
  };

  const removeTaskFromDb = async (
    removeItems: { id: string; relation_id: string }[]
  ): Promise<TaskType[]> => {
    const promises = removeItems.map(({ id, relation_id }) =>
      removeTaskFromServerRelation(relation_id, id)
    );
    const response = await Promise.all(promises);

    return response;
  };

  const isToggled = (task: TaskType): boolean => {
    if (!task?.completed_at && !task?.completed_by) return false;
    return true;
  };
  const toggleTaskInDb = async (
    task: TaskType,
    toggled_by_id: string
  ): Promise<TaskType> => {
    const response = isToggled(task)
      ? await editTaskFromServerRelation(task.task_relations_id, {
          id: task.id,
          completed_at: null,
          completed_by: null,
        })
      : await editTaskFromServerRelation(task.task_relations_id, {
          id: task.id,
          completed_at: getSQLiteTimestamp(),
          completed_by: toggled_by_id,
        });
    console.log(response);
    return response;
  };

  return {
    refresh,
    removeTaskFromDb,
    addTaskToDb,
    editTaskToDb,
    toggleTaskInDb,
  };
};

export default useServerTasks;
