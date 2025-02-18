import { openDatabaseAsync, useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import z from 'zod';
import {editTaskProps, TaskRelationsType, TaskType } from '@/types';

export const initDb = async () => {
  
const db = await openDatabaseAsync('todo');
 //used to clear db if changes made to tables
/*
  await db.execAsync(`
  DROP TABLE IF EXISTS tasks;
  DROP TABLE IF EXISTS task;
  DROP TABLE IF EXISTS tasks_relations;
  `);
  */
  await db.execAsync(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS task_relations (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    shared boolean NOT NULL,
    created_at TEXT NOT NULL
  );`)
  await db.execAsync(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT NOT NULL,
    completed_at TEXT,
    completed_by TEXT,
    task_relations_id INTEGER,
    FOREIGN KEY (task_relations_id) REFERENCES task_relations(id) ON DELETE CASCADE
  );`)
}

export type createTasksType = {
  name: string,
}
let db: any;

const getDatabaseSingleton = async () => {
  if (!db) {
    db = await openDatabaseAsync('todo');
  }
  return db;
};
export const createTasksRelations = async ({name}: createTasksType) => {
  try{
    const db = await getDatabaseSingleton();
    const result = await db.runAsync('INSERT INTO task_relations (name, shared, created_at) VALUES (?, ?, datetime("now"))', name, false);
    console.log(result.changes);

  }catch(e) {
    console.log('sql error occurred', e);
  }
};
export type createTaskType = {
  text: string,
  task_relations_id: string,
}
export const createTasks = async ({text,created_at, task_relations_id}:Omit<TaskType,'id'>): Promise<TaskType> => {
    const db = await getDatabaseSingleton();
    const result = await db.getFirstAsync('INSERT INTO tasks (text, created_at, task_relations_id ) VALUES (?, ?, ?) RETURNING *;', [text, created_at, task_relations_id]);
    console.log(result);
    return result;
};

export const getTaskRelations = async (): Promise<TaskRelationsType[]> => {
  const db = await getDatabaseSingleton();
  const result = await db.getAllAsync('SELECT * FROM task_relations;');
  return result;
};

export const getTasksById = async (id: number) : Promise<TaskType[]> => {
  const db = await getDatabaseSingleton();
  const result = await db.getAllAsync('SELECT * FROM tasks WHERE task_relations_id=?;', id);
  return result;
};
export const editTask = async ({id, text }: editTaskProps) : Promise<TaskType[]> => {
  const db = await getDatabaseSingleton();
  const result = await db.getFirstAsync('UPDATE tasks SET text = ? WHERE id=? RETURNING *', text, id );
  return result;
};
type toggleTaskProps = {
  id: number, 
  completed_at: string|null,
  completed_by: string|null,
}
export const toggleTask = async ({id, completed_by, completed_at}: toggleTaskProps) : Promise<TaskType> => {
  const db = await getDatabaseSingleton();
  const result = await db.getFirstAsync('UPDATE tasks SET completed_at = ?, completed_by=? WHERE id=? RETURNING *', completed_at, completed_by, id );
  return result;
};
export const removeTask = async (id:number): Promise<boolean> => {
  console.log('in removeTask');
  const db = await getDatabaseSingleton();
  const result = await db.runAsync('DELETE FROM tasks WHERE id=? RETURNING *', id);
  console.log('result:', result);
  return result;
};
