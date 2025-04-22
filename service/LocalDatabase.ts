import { openDatabaseAsync, SQLiteDatabase } from 'expo-sqlite';
import {editTaskProps, LocalTaskRelationType, TaskType } from '@/types';
import * as Crypto from 'expo-crypto';

export const initDb = async () => {
  const db = await openDatabaseAsync('todo');
  // used to clear db if changes made to tables
  /*
  await db.execAsync(`
  DROP TABLE IF EXISTS tasks;
  DROP TABLE IF EXISTS task;
  DROP TABLE IF EXISTS task_relations;
  `);
  */
  await db.execAsync(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS task_relations (
    id UUID PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    shared BOOLEAN NOT NULL,
    created_at TEXT NOT NULL,
    relation_location TEXT CHECK(relation_location IN ('Local', 'Server')) DEFAULT 'Local'
  );`);
  await db.execAsync(`
  CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT NOT NULL,
    completed_at TEXT,
    completed_by UUID,
    task_relations_id UUID,
    FOREIGN KEY (task_relations_id) REFERENCES task_relations(id) ON DELETE CASCADE
  );`);
};

export type createTasksType = {
  name: string,
}


let db: SQLiteDatabase | null = null;

const getDatabaseSingleton = async (): Promise<SQLiteDatabase> => {
  if (!db) {
    db = await openDatabaseAsync('todo');
  }
  return db;
};
export const createTasksRelations = async ({name}: createTasksType) => {
  try{
    const db = await getDatabaseSingleton();
    const result = await db.runAsync('INSERT INTO task_relations (id, name, shared, created_at, relation_location) VALUES (?, ?, ?, datetime("now"), ?)', [Crypto.randomUUID(), name, false, 'Local']);
    console.log(result.changes);

  }catch(e) {
    console.log('sql error occurred', e);
  }
};

export const getTaskRelations = async (): Promise<LocalTaskRelationType[]> => {
  const db = await getDatabaseSingleton();
  const result = await db.getAllAsync<LocalTaskRelationType>('SELECT * FROM task_relations;');
  return result;
};

export const deleteRelationsWithTasks = async (local_id: string): Promise<string> => {
  const db = await getDatabaseSingleton();
  await db.runAsync('DELETE FROM task_relations WHERE id=?;', [local_id]);
  return local_id;
};

export type createTaskType = {
  text: string,
  task_relations_id: string,
}
export const createTasks = async ({text,created_at, task_relations_id}:Omit<TaskType,'id'>): Promise<TaskType|null> => {
  console.log('in createTasks');
    const db = await getDatabaseSingleton();
    const result = await db.getFirstAsync<TaskType>('INSERT INTO tasks (id, text, created_at, task_relations_id ) VALUES (?, ?, ?, ?) RETURNING *;', [Crypto.randomUUID(), text, created_at, task_relations_id]);
    console.log(result);
    return result;
};
export const debug = async () => {
  const db = await getDatabaseSingleton();
  const result2 = await db.getAllAsync<LocalTaskRelationType>('SELECT * FROM task_relations;');

  const tasks = await Promise.all(
    result2.map(async (relation) => {
      const taskList = await db.getAllAsync<TaskType>('SELECT * FROM tasks WHERE task_relations_id=?;', [relation.id]);
      return { relation, tasks: taskList };
    })
  );
  console.log('result:', JSON.stringify(tasks, null, 2));
  return tasks;
};

export const getTasksById = async (id: string) : Promise<TaskType[]> => {
  const db = await getDatabaseSingleton();
  const result = await db.getAllAsync<TaskType>('SELECT * FROM tasks WHERE task_relations_id=?;', id);
  console.log('result:', result);
  return result;
};
export const editTask = async ({id, text }: editTaskProps) : Promise<TaskType|null> => {
  const db = await getDatabaseSingleton();
  const result = await db.getFirstAsync<TaskType>('UPDATE tasks SET text = ? WHERE id=? RETURNING *', text, id );
  return result;
};
type toggleTaskProps = {
  id: string, 
  completed_at: string|null,
  completed_by: string|null,
}
export const toggleTask = async ({id, completed_by, completed_at}: toggleTaskProps) : Promise<TaskType|null> => {
  const db = await getDatabaseSingleton();
  const result = await db.getFirstAsync<TaskType>('UPDATE tasks SET completed_at = ?, completed_by=? WHERE id=? RETURNING *', completed_at, completed_by, id );
  return result;
};
export const removeTask = async (id:string): Promise<TaskType|null> => {
  const db = await getDatabaseSingleton();
  const result = await db.getFirstAsync<TaskType>('DELETE FROM tasks WHERE id=? RETURNING *', id);
  console.log(result);
  return result;
};
