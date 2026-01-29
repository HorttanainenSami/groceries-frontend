import { getDatabaseSingleton } from './initialize';
import * as Crypto from 'expo-crypto';
import { LocalRelationType, RelationType, ServerRelationType } from '@groceries/shared_types';
import { TaskRelationRow } from './types';
import { SQLiteDatabase } from 'expo-sqlite';

export type CreateTasksType = {
  name: string;
};
type StoreServerRelationProps = {
  relation: ServerRelationType;
  txQuery?: SQLiteDatabase;
};

class RelationsDAO {
  create = async ({ name }: CreateTasksType): Promise<LocalRelationType> => {
    console.log('[relationsDAO] create');
    try {
      const date = new Date().toISOString();
      const id = Crypto.randomUUID();
      const db = await getDatabaseSingleton();

      await db.runAsync(
        'INSERT INTO task_relations (id, name, created_at, relation_location, last_modified) VALUES (?, ?, ?, ?, ?)',
        [id, name, date, 'Local', date]
      );

      return {
        id,
        name,
        created_at: date,
        relation_location: 'Local',
        last_modified: date,
      };
    } catch (e) {
      console.log('sql error occurred', e);
      throw e;
    }
  };

  updateName = async (id: string, newName: string): Promise<LocalRelationType | null> => {
    console.log('[relationsDAO] updateName');
    try {
      const db = await getDatabaseSingleton();
      const result = await db.getFirstAsync<LocalRelationType>(
        'UPDATE task_relations SET name = ?, last_modified=? WHERE id=? RETURNING *',
        newName,
        new Date().toISOString(),
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

  getAll = async (): Promise<RelationType[]> => {
    console.log('[relationsDAO] getAll');
    try {
      const db = await getDatabaseSingleton();
      const result = await db.getAllAsync<TaskRelationRow>('SELECT * FROM task_relations;');
      return result.map((relation) => {
        if (relation.relation_location === 'Server') {
          const {
            shared_with_email: email,
            shared_with_id: id,
            shared_with_name: name,
            ...rest
          } = relation;

          return { ...rest, shared_with: [{ name, id, email }] };
        } else {
          const { id, name, created_at, relation_location, last_modified } = relation;
          return { id, name, created_at, relation_location, last_modified };
        }
      });
    } catch (e) {
      console.log('error occurred', e);
      return [];
    }
  };

  delete = async (
    relations: RelationType[] | Pick<RelationType, 'id'>[]
  ): Promise<[boolean, string][]> => {
    console.log('[relationsDAO] delete');
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
  /// Used only to store server relation to local device
  insertCached = async ({ relation, txQuery }: StoreServerRelationProps) => {
    console.log('[relationsDAO] insertCached');
    const db = txQuery ? txQuery : await getDatabaseSingleton();
    await db.runAsync(
      `INSERT INTO task_relations (id, name, created_at, relation_location, last_modified, shared_with_id, shared_with_name, shared_with_email,permission)
     VALUES (?, ?, ?, 'Server', ?, ?, ?, ?, ?)`,
      [
        relation.id,
        relation.name,
        relation.created_at,
        relation.last_modified,
        relation.shared_with![0].id,
        relation.shared_with![0].name,
        relation.shared_with![0].email,
        relation.permission ?? null,
      ]
    );
  };
  /// Deletes all locally stored server relations
  clearAllCached = async (txQuery?: SQLiteDatabase) => {
    console.log('[relationsDAO] clearAllCached');
    const db = txQuery ? txQuery : await getDatabaseSingleton();
    await db.runAsync('DELETE FROM task_relations WHERE relation_location = ?', ['Server']);
  };
  /// replace cached relation by deleting all cached relations and inserting provided relations
  /// used when server returns updated relation
  replaceAllCached = async (serverRelations: ServerRelationType[]) => {
    console.log('[relationsDAO] replaceServerRelations');
    const db = await getDatabaseSingleton();

    await db.withTransactionAsync(async () => {
      await this.clearAllCached(db);

      for (const relation of serverRelations) {
        await this.insertCached({ relation, txQuery: db });
      }
    });
  };

  updateCached = async (serverRelations: ServerRelationType[]) => {
    console.log('[relationsDAO] updateCached');
    const db = await getDatabaseSingleton();

    await db.withTransactionAsync(async () => {
      for (const relation of serverRelations) {
        await db.runAsync(
          `UPDATE task_relations
         SET name = ?, created_at = ?, relation_location = 'Server', last_modified = ?,
             shared_with_id = ?, shared_with_name = ?, shared_with_email = ?, permission = ?
         WHERE id = ?`,
          [
            relation.name,
            relation.created_at,
            relation.last_modified,
            relation.shared_with![0].id,
            relation.shared_with![0].name,
            relation.shared_with![0].email,
            relation.permission ?? null,
            relation.id,
          ]
        );
      }
    });
  };

  moveFromCachedToLocal = async (relationId: string) => {
    console.log('[relationsDAO] moveFromCachedToLocal');
    const db = await getDatabaseSingleton();

    await db.runAsync(
      `UPDATE task_relations
         SET relation_location = 'Local',
             shared_with_id = ?, shared_with_name = ?, shared_with_email = ?, permission = ?
         WHERE id = ?`,
      [null, null, null, 'owner', relationId]
    );
  };
}
//singleton pattern
export const relationsDAO = new RelationsDAO();
