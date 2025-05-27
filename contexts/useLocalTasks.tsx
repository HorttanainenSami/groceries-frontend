import { TaskType } from '@/types';
import {
  createTasks,
  getTasksById,
  toggleTask,
  editTask,
  removeTask,
} from '@/service/LocalDatabase';
import { getSQLiteTimestamp } from '@/utils/utils';
const useLocalTasks = () => {
  const refresh = async (id: string) => {
    console.log('relation is locally stored:');
    const result = await getTasksById(id);
    console.log(JSON.stringify(result, null, 2));
    return result;
  };

  const addTaskToDb = async (
    newTask: Omit<TaskType, 'id'>
  ): Promise<TaskType> => {
    console.log('newTask', newTask);
    const response = await createTasks(newTask);
    if (!response) throw new Error('Failed to create task');
    return response;
  };

  const editTaskToDb = async ({ id, task }: TaskType): Promise<TaskType> => {
    const response = await editTask({ id, task });
    if (!response) throw new Error('Failed to edit task');
    return response;
  };

  const isToggled = (task: TaskType): boolean => {
    if (!task?.completed_at && !task?.completed_by) return false;
    return true;
  };
  const removeTaskFromDb = async (
    removeItems: { id: string; relation_id: string }[]
  ): Promise<TaskType[]> => {
    const promises = removeItems.map(({ id }) => removeTask(id));
    const response = await Promise.all(promises);
    return response.filter((t) => t !== null) as TaskType[];
  };

  const toggleTaskInDb = async (
    task: TaskType,
    toggled_by_id: string
  ): Promise<TaskType> => {
    return isToggled(task)
      ? await toggleTask({
          id: task.id,
          completed_at: null,
          completed_by: null,
        })
      : await toggleTask({
          id: task.id,
          completed_at: getSQLiteTimestamp(),
          completed_by: toggled_by_id,
        });
  };

  return {
    refresh,
    removeTaskFromDb,
    addTaskToDb,
    editTaskToDb,
    toggleTaskInDb,
  };
};

export default useLocalTasks;
