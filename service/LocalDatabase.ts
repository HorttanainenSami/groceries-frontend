import { openDatabaseAsync, SQLiteDatabase } from 'expo-sqlite';
import { editTaskProps, LocalTaskRelationType, TaskType } from '@/types';
import * as Crypto from 'expo-crypto';

export const initDb = async () => {
  const db = await getDatabaseSingleton();
  // used to clear db if changes made to tables
  /*
  await db.execAsync(`
  DROP TABLE IF EXISTS tasks;
  DROP TABLE IF EXISTS task_relations;
  `);
  */
  await db.execAsync(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS task_relations (
    id UUID PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    relation_location TEXT CHECK(relation_location IN ('Local', 'Server')) DEFAULT 'Local'
  );`);
  await db.execAsync(`
  CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY NOT NULL,
    task TEXT NOT NULL,
    created_at TEXT NOT NULL,
    completed_at TEXT,
    completed_by UUID,
    task_relations_id UUID,
    order_idx INTEGER DEFAULT NULL,
    FOREIGN KEY (task_relations_id) REFERENCES task_relations(id) ON DELETE CASCADE
  );`);
};

export type createTasksType = {
  name: string;
};

let databaseInstance: SQLiteDatabase | null = null;

const getDatabaseSingleton = async (): Promise<SQLiteDatabase> => {
  // Check if openDatabaseAsync is defined (i.e., provider is available)
  if (typeof openDatabaseAsync !== 'function') {
    throw new Error('Database provider is not available.');
  }
  if (!databaseInstance) {
    databaseInstance = await openDatabaseAsync('todo');
  }
  return databaseInstance;
};
export const createTasksRelations = async ({ name }: createTasksType) => {
  try {
    const db = await getDatabaseSingleton();
    const result = await db.runAsync(
      'INSERT INTO task_relations (id, name, created_at, relation_location) VALUES (?, ?, datetime("now"), ?)',
      [Crypto.randomUUID(), name, 'Local']
    );
    console.log(result.changes);
  } catch (e) {
    console.log('sql error occurred', e);
  }
};
export const changeRelationName = async (
  id: string,
  newName: string
): Promise<LocalTaskRelationType | null> => {
  try {
    const db = await getDatabaseSingleton();
    const result = await db.getFirstAsync<LocalTaskRelationType>(
      'UPDATE task_relations SET name = ? WHERE id=? RETURNING *',
      newName,
      id
    );
    if (!result) {
      console.log('No relation found with the given ID');
      return null;
    }
    console.log('Relation name changed successfully:', result);
    return result;
  } catch (e) {
    console.log('error occurred', e);
    if (e instanceof Error) {
      console.error('Error message:', e.message);
    }
    throw e; // Re-throw the error for further handling if needed
  }
};

export const getTaskRelations = async (): Promise<LocalTaskRelationType[]> => {
  try {
    const db = await getDatabaseSingleton();
    const result = await db.getAllAsync<LocalTaskRelationType>(
      'SELECT * FROM task_relations;'
    );
    return result;
  } catch (e) {
    console.log('error occurred', e);
    return [];
  }
};

export const deleteRelationsWithTasks = async (
  local_id: string
): Promise<[boolean, string]> => {
  try {
    const db = await getDatabaseSingleton();
    console.log('deleting relation with id', local_id);
    const response = await db.runAsync(
      'DELETE FROM task_relations WHERE id=?;',
      [local_id]
    );
    return [response.changes > 0, local_id];
  } catch (e) {
    console.log('error occurred', e);
    return [false, local_id];
  }
};

export const createTasks = async ({
  task,
  task_relations_id,
}: Omit<TaskType, 'id'>): Promise<TaskType | null> => {
  try {
    console.log('in createTasks');
    const db = await getDatabaseSingleton();
    const result = await db.getFirstAsync<TaskType>(
      'INSERT INTO tasks (id, task, created_at, task_relations_id ) VALUES (?, ?, datetime("now"), ?) RETURNING *;',
      [Crypto.randomUUID(), task, task_relations_id]
    );
    console.log(result);
    return result;
  } catch (e) {
    console.log('error occurred', e);
    return null;
  }
};
export const debug = async () => {
  const db = await getDatabaseSingleton();
  const result2 = await db.getAllAsync<LocalTaskRelationType>(
    'SELECT * FROM task_relations;'
  );

  const tasks = await Promise.all(
    result2.map(async (relation) => {
      const taskList = await db.getAllAsync<TaskType>(
        'SELECT * FROM tasks WHERE task_relations_id=?;',
        [relation.id]
      );
      return { relation, tasks: taskList };
    })
  );
  console.log('result:', JSON.stringify(tasks, null, 2));
  return tasks;
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
export const editTask = async ({
  id,
  task,
}: editTaskProps): Promise<TaskType | null> => {
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
type toggleTaskProps = {
  id: string;
  completed_at: string | null;
  completed_by: string | null;
};
export const toggleTask = async ({
  id,
  completed_by,
  completed_at,
}: toggleTaskProps): Promise<TaskType> => {
  try {
    const db = await getDatabaseSingleton();
    const result = await db.getFirstAsync<TaskType>(
      'UPDATE tasks SET completed_at = ?, completed_by=? WHERE id=? RETURNING *',
      completed_at,
      completed_by,
      id
    );
    if(!result) throw new Error('Task not found');
    return result;
  } catch (e) {
    console.log('error occurred', e);
    throw e;
  }
};
export const removeTask = async (id: string): Promise<TaskType | null> => {
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
export const reorderTasks = async (tasks : TaskType[]) :Promise<TaskType[]> => {
  if(tasks.length===0) return getTasksById(tasks[0].task_relations_id)
  console.log('reorder');
  try{
    const db = await getDatabaseSingleton();
    await db.withTransactionAsync(async () => {
      for(const {order_idx, id} of tasks){
        await db.runAsync(
          'UPDATE tasks SET order_idx = ? WHERE id=? RETURNING *',
          order_idx||null,
          id
        );
      }
    })
    return getTasksById(tasks[0].task_relations_id);
  }catch(e){
    console.log(e);
    return getTasksById(tasks[0].task_relations_id);
  }
}
