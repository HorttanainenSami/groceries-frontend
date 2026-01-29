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
  PRAGMA busy_timeout = 5000;
  CREATE TABLE IF NOT EXISTS task_relations (
    id UUID PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    relation_location TEXT CHECK(relation_location IN ('Local', 'Server')),
    shared_with_name TEXT,
    shared_with_email TEXT,
    shared_with_id UUID,
    permission TEXT CHECK(permission IN ('owner', 'edit')),
    last_modified TEXT
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
    last_modified TEXT,
    FOREIGN KEY (task_relations_id) REFERENCES task_relations(id) ON DELETE CASCADE
  );`);
  await db.execAsync(`
  CREATE TABLE IF NOT EXISTS pending_operations (
    id UUID PRIMARY KEY NOT NULL,
    type TEXT NOT NULL,
    data TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    retry_count INTEGER DEFAULT 0
  );`);
};

let databaseInstance: SQLiteDatabase | null = null;

// Determine database name based on environment
const getDatabaseName = () => {
  const dbName = process.env.EXPO_PUBLIC_DB_NAME || 'todo';
  console.log(`Using database: ${dbName}`);
  return dbName;
};

export const getDatabaseSingleton = async (): Promise<SQLiteDatabase> => {
  // Check if openDatabaseAsync is defined (i.e., provider is available)
  if (typeof openDatabaseAsync !== 'function') {
    throw new Error('Database provider is not available.');
  }
  if (!databaseInstance) {
    databaseInstance = await openDatabaseAsync(getDatabaseName());
  }
  return databaseInstance;
};

// For testing: reset database instance
export const resetDatabaseInstance = () => {
  databaseInstance = null;
};

// For testing: clear all data
export const clearTestDatabase = async () => {
  const dbName = process.env.EXPO_PUBLIC_DB_NAME || 'todo';
  if (dbName !== 'todo-test') {
    throw new Error('clearTestDatabase can only be called in test environment');
  }
  const db = await getDatabaseSingleton();
  await db.execAsync(`
    DELETE FROM tasks;
    DELETE FROM task_relations;
    DELETE FROM pending_operations;
  `);
};
