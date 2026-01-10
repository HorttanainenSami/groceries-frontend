import { PendingOperation, PendingType } from '@groceries/shared_types';

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
  synced: null;
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
  synced: 'synced' | 'pending';
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
  synced: 'synced' | 'pending' | null;
};

export type PendingOperationRow = {
  id: string;
  type: PendingType;
  data: string; // JSON stringified data
  timestamp: string;
  retry_count: number;
  status: 'pending' | 'failed';
};

export type InsertTaskRelation = Omit<TaskRelationRow, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type InsertTask = Omit<TaskRow, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type InsertPendingOperation = Omit<PendingOperation, 'retry_count' | 'status'> & {
  retry_count?: number;
  status?: 'pending' | 'failed';
};
