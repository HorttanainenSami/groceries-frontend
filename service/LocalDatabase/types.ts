import {
  PendingOperation,
  PendingType,
  RelationSchema,
  RelationType,
} from '@groceries/shared_types';

export type TaskRelationRow = TaskRelationLocalRow | TaskRelationServerRow;
export type TaskRelationLocalRow = {
  id: string;
  name: string;
  created_at: string;
  relation_location: 'Local';
  last_modified: string;
  shared_with_name: null;
  shared_with_email: null;
  shared_with_id: null;
  permission: null;
};
export type TaskRelationServerRow = {
  id: string;
  name: string;
  created_at: string;
  relation_location: 'Server';
  shared_with_name: string;
  shared_with_email: string;
  shared_with_id: string;
  last_modified: string;
  permission: 'owner' | 'edit';
};

export type TaskRow = {
  id: string;
  task: string;
  created_at: string;
  completed_at: string | null;
  completed_by: string | null;
  task_relations_id: string;
  order_idx: number | null;
  last_modified: string;
};

export type PendingOperationRow = {
  id: string;
  type: PendingType;
  data: string; // JSON stringified data
  timestamp: string;
  retry_count: number;
};

export type InsertTaskRelation = Omit<TaskRelationRow, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type InsertTask = Omit<TaskRow, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type InsertPendingOperation = Omit<PendingOperation, 'retry_count'> & {
  retry_count?: number;
};
import { z } from 'zod';

export const toSqlParams = (relation: RelationType, date: string) => {
  if (relation.relation_location === 'Server') {
    const sharedWith = relation.shared_with?.[0] ?? null;
    return [
      relation.name,
      relation.created_at,
      'Server',
      sharedWith?.name ?? null,
      sharedWith?.email ?? null,
      sharedWith?.id ?? null,
      relation.permission,
      date,
      relation.id,
    ];
  }
  return [
    relation.name,
    relation.created_at,
    'Local',
    null,
    null,
    null,
    'owner',
    date,
    relation.id,
  ];
};

export const TaskRelationRowSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    created_at: z.string(),
    last_modified: z.string().nullable(),
    relation_location: z.enum(['Local', 'Server']),
    shared_with_id: z.string().nullable(),
    shared_with_name: z.string().nullable(),
    shared_with_email: z.string().nullable(),
    permission: z.enum(['owner', 'edit']).nullable(),
  })
  .transform((row): z.infer<typeof RelationSchema> => {
    if (row.relation_location === 'Server') {
      return {
        id: row.id,
        name: row.name,
        created_at: row.created_at,
        last_modified: row.last_modified!,
        relation_location: 'Server',
        permission: row.permission!,
        shared_with: row.shared_with_id
          ? [{ id: row.shared_with_id, name: row.shared_with_name!, email: row.shared_with_email! }]
          : null,
      };
    }
    return {
      id: row.id,
      name: row.name,
      created_at: row.created_at,
      last_modified: row.last_modified!,
      relation_location: 'Local',
    };
  });
