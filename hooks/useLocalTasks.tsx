import { taskDAO } from '@/service/LocalDatabase';
import { TaskType } from '@groceries/shared_types';
import { randomUUID } from 'expo-crypto';
type AddTaskToDbProps = Omit<TaskType, 'id'> & { id?: string };
const useLocalTasks = () => {
  const refresh = async (id: string) => {
    const result = await taskDAO.getById(id);

    return result;
  };
  const addTaskToDb = async (newTask: AddTaskToDbProps): Promise<TaskType> => {
    console.log('newTask', newTask);

    const response = await taskDAO.create({ id: randomUUID(), ...newTask });
    if (!response) throw new Error('Failed to create task');
    return response;
  };

  const editTaskToDb = async ({ id, task }: TaskType): Promise<TaskType> => {
    const response = await taskDAO.update({ id, task });
    if (!response) throw new Error('Failed to edit task');
    return response;
  };

  const removeTaskFromDb = async (removeItems: TaskType[]): Promise<TaskType[]> => {
    const promises = removeItems.map(({ id }) => taskDAO.remove(id));
    const response = await Promise.all(promises);
    return response.filter((t) => t !== null) as TaskType[];
  };

  const toggleTaskInDb = async (task: TaskType): Promise<TaskType> => {
    return await taskDAO.toggle({
      id: task.id,
      completed_at: task.completed_at,
      completed_by: task.completed_by,
    });
  };

  const reorderTasksInDb = async (reorderedTasks: TaskType[]): Promise<TaskType[]> =>
    await taskDAO.reorder(reorderedTasks);

  return {
    refresh,
    removeTaskFromDb,
    addTaskToDb,
    editTaskToDb,
    toggleTaskInDb,
    reorderTasksInDb,
  };
};

export default useLocalTasks;
