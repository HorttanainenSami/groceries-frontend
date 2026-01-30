import { getDatabaseSingleton } from './initialize';
import { PendingOperationRow, InsertPendingOperation } from './types';
import { PendingOperation } from '@groceries/shared_types';

const rowToOperation = (row: PendingOperationRow): PendingOperation =>
  ({
    id: row.id,
    type: row.type,
    data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data,
    timestamp: row.timestamp,
    retryCount: row.retry_count,
  }) as PendingOperation;

export const addPendingOperation = async (operation: InsertPendingOperation): Promise<string> => {
  console.log('[DB] addPendingOperation');
  const db = await getDatabaseSingleton();

  await db.runAsync(
    `INSERT INTO pending_operations
     (id, type, data, timestamp, retry_count)
     VALUES (?, ?, ?, ?, ?)`,
    [
      operation.id,
      operation.type,
      JSON.stringify(operation.data),
      operation.timestamp,
      operation.retry_count ?? 0,
    ]
  );

  return operation.id;
};

export const getPendingOperations = async (): Promise<PendingOperation[]> => {
  console.log('[DB] getPendingOperations');
  const db = await getDatabaseSingleton();
  const rows = await db.getAllAsync<PendingOperationRow>(
    'SELECT * FROM pending_operations ORDER BY timestamp ASC',
    ['pending']
  );

  return rows.map(rowToOperation);
};

export const incrementRetryCount = async (id: string): Promise<number> => {
  console.log('[DB] incrementRetryCount');
  const db = await getDatabaseSingleton();
  const result = await db.getFirstAsync<{ retry_count: number }>(
    'UPDATE pending_operations SET retry_count = retry_count + 1 WHERE id = ? RETURNING retry_count',
    [id]
  );

  return result?.retry_count ?? 0;
};

export const removePendingOperation = async (id: string): Promise<void> => {
  console.log('[DB] removePendingOperation');
  const db = await getDatabaseSingleton();
  await db.runAsync('DELETE FROM pending_operations WHERE id = ?', [id]);
};
