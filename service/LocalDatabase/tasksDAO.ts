import { getDatabaseSingleton } from './initialize';
import { EditTaskProps } from '@/types';
import * as Crypto from 'expo-crypto';
import { TaskType } from '@groceries/shared_types';
import { SQLiteDatabase } from 'expo-sqlite';
type ToggleTaskProps = {
  id: string;
  completed_at: string | null;
  completed_by: string | null;
};
class TaskDAO {
  create = async (
    task: Pick<TaskType, 'task' | 'task_relations_id' | 'order_idx'>
  ): Promise<TaskType | null> => {
    console.log('[TaskDAO] create');
    try {
      const db = await getDatabaseSingleton();
      const date = new Date().toISOString();
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

  getById = async (id: string): Promise<TaskType[]> => {
    console.log('[TaskDAO] getById');
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
  update = async ({ id, task }: EditTaskProps): Promise<TaskType | null> => {
    console.log('[TaskDAO] update');
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

  toggle = async ({ id, completed_by, completed_at }: ToggleTaskProps): Promise<TaskType> => {
    console.log('[TaskDAO] toggle');
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
  remove = async (id: string): Promise<TaskType | null> => {
    console.log('[TaskDAO] remove');
    try {
      const db = await getDatabaseSingleton();
      const result = await db.getFirstAsync<TaskType>(
        'DELETE FROM tasks WHERE id=? RETURNING *',
        id
      );
      console.log(result);
      return result;
    } catch (e) {
      console.log('error occurred', e);
      return null;
    }
  };
  reorder = async (tasks: TaskType[]): Promise<TaskType[]> => {
    console.log('[TaskDAO] reorder');
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
    return this.getById(tasks[0].task_relations_id);
  };

  insertCached = async (
    taskData: TaskType[],
    txQuery?: SQLiteDatabase
  ): Promise<TaskType[] | null> => {
    console.log('[TaskDAO] insertCached');
    try {
      if (taskData.length === 0) return null;
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

  clearAllCached = async (task_relation_id: string, txQuery: SQLiteDatabase) => {
    console.log('[TaskDAO] clearAllCached');
    const db = txQuery;
    try {
      await db.runAsync('DELETE FROM tasks WHERE task_relations_id = ?', [task_relation_id]);
    } catch (e) {
      console.log(e);
    }
  };

  replaceAllCached = async (
    tasks: TaskType[],
    task_relations_id: string
  ): Promise<TaskType[] | null> => {
    console.log('[TaskDAO] replaceAllCached', task_relations_id);
    try {
      const db = await getDatabaseSingleton();
      let result: TaskType[] | null = null;
      await db.withTransactionAsync(async () => {
        await db.runAsync('DELETE FROM tasks WHERE task_relations_id = ?', [task_relations_id]);
        result = await this.insertCached(tasks, db);
      });
      return result;
    } catch (e) {
      console.log('replaceCachedTasks', e);
      throw e;
    }
  };

  updateCached = async (
    serverTask: TaskType,
    txQuery?: SQLiteDatabase
  ): Promise<TaskType | null> => {
    console.log('[TaskDAO] updateCached');
    try {
      const db = txQuery || (await getDatabaseSingleton());
      const result = await db.getFirstAsync<TaskType>(
        `INSERT OR REPLACE INTO tasks (id, task, created_at, completed_at, completed_by, task_relations_id, order_idx, last_modified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
        [
          serverTask.id,
          serverTask.task,
          serverTask.created_at,
          serverTask.completed_at,
          serverTask.completed_by,
          serverTask.task_relations_id,
          serverTask.order_idx,
          serverTask.last_modified,
        ]
      );
      return result;
    } catch (e) {
      console.error('Error updating cached task:', e);
      return null;
    }
  };
}

export const taskDAO = new TaskDAO();
