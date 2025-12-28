import { getDatabaseSingleton } from './initialize';
import { EditTaskProps } from '@/types';
import * as Crypto from 'expo-crypto';
import { TaskType } from '@groceries/shared_types';

export const createTasks = async ({
  task,
  task_relations_id,
}: Omit<TaskType, 'id'>): Promise<TaskType | null> => {
  try {
    console.log('in createTasks');
    const db = await getDatabaseSingleton();
    const result = await db.getFirstAsync<TaskType>(
      'INSERT INTO tasks (id, task, created_at, task_relations_id ) VALUES (?, ?, ?, ?) RETURNING *;',
      [Crypto.randomUUID(), task, new Date().toISOString(), task_relations_id]
    );
    console.log(result);
    return result;
  } catch (e) {
    console.log('error occurred', e);
    return null;
  }
};

export const getTasksById = async (id: string): Promise<TaskType[]> => {
  try {
    const db = await getDatabaseSingleton();
    const result = await db.getAllAsync<TaskType>(
      'SELECT * FROM tasks WHERE task_relations_id=? ORDER BY order_idx;',
      id
    );
    console.log('result:', JSON.stringify(result, null, 2));
    return result;
  } catch (e) {
    console.log('error occurred', e);
    return [];
  }
};
export const editTask = async ({ id, task }: EditTaskProps): Promise<TaskType | null> => {
  try {
    const db = await getDatabaseSingleton();
    const result = await db.getFirstAsync<TaskType>(
      'UPDATE tasks SET task = ? WHERE id=? RETURNING *',
      task,
      id
    );
    return result;
  } catch (e) {
    console.log('error occurred', e);
    return null;
  }
};
type ToggleTaskProps = {
  id: string;
  completed_at: string | null;
  completed_by: string | null;
};
export const toggleTask = async ({
  id,
  completed_by,
  completed_at,
}: ToggleTaskProps): Promise<TaskType> => {
  try {
    const db = await getDatabaseSingleton();
    const result = await db.getFirstAsync<TaskType>(
      'UPDATE tasks SET completed_at = ?, completed_by=? WHERE id=? RETURNING *',
      completed_at,
      completed_by,
      id
    );
    if (!result) throw new Error('Task not found');
    return result;
  } catch (e) {
    console.log('error occurred', e);
    throw e;
  }
};
export const removeTask = async (id: string): Promise<TaskType | null> => {
  try {
    const db = await getDatabaseSingleton();
    const result = await db.getFirstAsync<TaskType>('DELETE FROM tasks WHERE id=? RETURNING *', id);
    console.log(result);
    return result;
  } catch (e) {
    console.log('error occurred', e);
    return null;
  }
};
export const reorderTasks = async (tasks: TaskType[]): Promise<TaskType[]> => {
  if (tasks.length === 0) return getTasksById(tasks[0].task_relations_id);
  console.log('reorder');
  try {
    const db = await getDatabaseSingleton();
    await db.withTransactionAsync(async () => {
      for (const { order_idx, id } of tasks) {
        await db.runAsync(
          'UPDATE tasks SET order_idx = ? WHERE id=? RETURNING *',
          order_idx || null,
          id
        );
      }
    });
    return getTasksById(tasks[0].task_relations_id);
  } catch (e) {
    console.log(e);
    return getTasksById(tasks[0].task_relations_id);
  }
};
