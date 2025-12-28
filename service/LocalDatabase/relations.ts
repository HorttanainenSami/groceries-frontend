import { getDatabaseSingleton } from './initialize';
import * as Crypto from 'expo-crypto';
import { LocalRelationType } from '@groceries/shared_types';

export type CreateTasksType = {
  name: string;
};

export const createTasksRelations = async ({ name }: CreateTasksType) => {
  try {
    const db = await getDatabaseSingleton();
    const result = await db.runAsync(
      'INSERT INTO task_relations (id, name, created_at, relation_location) VALUES (?, ?, ?, ?)',
      [Crypto.randomUUID(), name, new Date().toISOString(), 'Local']
    );
    console.log(result.changes);
  } catch (e) {
    console.log('sql error occurred', e);
  }
};
export const changeRelationName = async (
  id: string,
  newName: string
): Promise<LocalRelationType | null> => {
  try {
    const db = await getDatabaseSingleton();
    const result = await db.getFirstAsync<LocalRelationType>(
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

export const getTaskRelations = async (): Promise<LocalRelationType[]> => {
  try {
    const db = await getDatabaseSingleton();
    const result = await db.getAllAsync<LocalRelationType>('SELECT * FROM task_relations;');
    return result;
  } catch (e) {
    console.log('error occurred', e);
    return [];
  }
};

export const deleteRelationWithTasks = async (
  relations: LocalRelationType[]
): Promise<[boolean, string][]> => {
  try {
    const db = await getDatabaseSingleton();
    await db.withTransactionAsync(async () => {
      await Promise.all(
        relations.map(({ id }) => db.runAsync('DELETE FROM task_relations WHERE id=?;', [id]))
      );
    });

    return relations.map(({ id }) => [true, id]);
  } catch (e) {
    console.log('error occurred', e);
    return relations.map(({ id }) => [false, id]);
  }
};
