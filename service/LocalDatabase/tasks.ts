import { getDatabaseSingleton } from './initialize';
import { EditTaskProps } from '@/types';
import * as Crypto from 'expo-crypto';
import { TaskType } from '@groceries/shared_types';
import { SQLiteDatabase } from 'expo-sqlite';

export const createTasks = async (task: TaskType): Promise<TaskType | null> => {
  console.log('[DB] createTasks');
  try {
    const db = await getDatabaseSingleton();
    const date = new Date().toISOString();
    console.log('in createTasks');
    const result = await db.getFirstAsync<TaskType>(
      'INSERT INTO tasks (id, task, created_at, task_relations_id, last_modified, order_idx ) VALUES (?, ?, ?, ?, ?, ?) RETURNING *;',
      [Crypto.randomUUID(), task.task, date, task.task_relations_id, date, task.order_idx]
    );
    console.log(result);
    return result;
  } catch (e) {
    console.log('error occurred', e);
    return null;
  }
};

export const getTasksById = async (id: string): Promise<TaskType[]> => {
  console.log('[DB] getTasksById');
  try {
    const db = await getDatabaseSingleton();
    const result = await db.getAllAsync<TaskType>(
      'SELECT * FROM tasks WHERE task_relations_id=? ORDER BY order_idx;',
      id
    );
    return result;
  } catch (e) {
    console.log('error occurred', e);
    return [];
  }
};
export const editTask = async ({ id, task }: EditTaskProps): Promise<TaskType | null> => {
  console.log('[DB] editTask');
  try {
    const db = await getDatabaseSingleton();
    const result = await db.getFirstAsync<TaskType>(
      'UPDATE tasks SET task = ?, last_modified = ? WHERE id=? RETURNING *',
      task,
      new Date().toISOString(),
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
  console.log('[DB] toggleTask');
  try {
    const db = await getDatabaseSingleton();
    const result = await db.getFirstAsync<TaskType>(
      'UPDATE tasks SET completed_at = ?, completed_by=?, last_modified=? WHERE id=? RETURNING *',
      completed_at,
      completed_by,
      new Date().toISOString(),
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
  console.log('[DB] removeTask');
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
  console.log('[DB] reorderTasks');
  const db = await getDatabaseSingleton();
  await db.withTransactionAsync(async () => {
    for (const { order_idx, id } of tasks) {
      await db.runAsync(
        'UPDATE tasks SET order_idx = ?, last_modified=? WHERE id=? RETURNING *',
        order_idx || null,
        new Date().toISOString(),
        id
      );
    }
  });
  return getTasksById(tasks[0].task_relations_id);
};

export const insertCachedTask = async (
  taskData: TaskType[],
  txQuery?: SQLiteDatabase
): Promise<TaskType[] | null> => {
  console.log('[DB] insertCachedTask');
  try {
    const db = txQuery || (await getDatabaseSingleton());
    const dynamicValues = taskData.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
    const dynamicParameters = taskData.flatMap(
      ({
        id,
        task,
        created_at,
        completed_at,
        completed_by,
        task_relations_id,
        order_idx,
        last_modified,
      }) => [
        id,
        task,
        created_at,
        completed_at,
        completed_by,
        task_relations_id,
        order_idx,
        last_modified,
      ]
    );

    const queryString = `INSERT OR REPLACE INTO tasks (id, task, created_at, completed_at, completed_by, task_relations_id, order_idx, last_modified)
        VALUES ${dynamicValues};`;
    const response = await db.getAllAsync<TaskType>(queryString, dynamicParameters);
    return response;
  } catch (e) {
    console.error('Error inserting cached task:', e);
    return null;
  }
};
export const deleteAllServerTasksByRelationId = async (
  task_relation_id: string,
  txQuery: SQLiteDatabase
) => {
  console.log('[DB] deleteAllServerTasksByRelationId');
  const db = txQuery;
  try {
    await db.runAsync('DELETE FROM tasks WHERE task_relations_id = ?', [task_relation_id]);
  } catch (e) {
    console.log(e);
  }
};

export const replaceCachedTasks = async (tasks: TaskType[], task_relations_id: string) => {
  console.log('[DB] replaceCachedTasks', task_relations_id);
  try {
    const db = await getDatabaseSingleton();
    await db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM tasks WHERE task_relations_id = ?', [task_relations_id]);
      await insertCachedTask(tasks, db);
    });
  } catch (e) {
    console.log('replaceCachedTasks', e);
    throw e;
  }
};
