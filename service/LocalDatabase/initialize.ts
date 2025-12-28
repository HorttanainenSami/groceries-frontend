import { openDatabaseAsync, SQLiteDatabase } from 'expo-sqlite';

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
    relation_location TEXT CHECK(relation_location IN ('Local', 'Server'))
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

let databaseInstance: SQLiteDatabase | null = null;

export const getDatabaseSingleton = async (): Promise<SQLiteDatabase> => {
  // Check if openDatabaseAsync is defined (i.e., provider is available)
  if (typeof openDatabaseAsync !== 'function') {
    throw new Error('Database provider is not available.');
  }
  if (!databaseInstance) {
    databaseInstance = await openDatabaseAsync('todo');
  }
  return databaseInstance;
};
