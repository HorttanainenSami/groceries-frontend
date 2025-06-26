import { TaskType } from '@/types';
import {
  createTaskForServerRelation,
  editTaskFromServerRelation,
  getServerTasksByRelationId,
  removeTaskFromServerRelation,
} from '@/service/database';
const useServerTasks = () => {
  const refresh = async (id: string) => {
    const { tasks } = await getServerTasksByRelationId(id);
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
    removeItems: TaskType[]
  ): Promise<TaskType[]> => {
    const promises = removeItems.map(({ id, task_relations_id }) =>
      removeTaskFromServerRelation(task_relations_id, id)
    );
    const response = await Promise.all(promises);

    return response;
  };


  const toggleTaskInDb = async (task: TaskType): Promise<TaskType> => {
    const response = await editTaskFromServerRelation(task.task_relations_id, {
      id: task.id,
      completed_at: task.completed_at,
      completed_by: task.completed_by,
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
