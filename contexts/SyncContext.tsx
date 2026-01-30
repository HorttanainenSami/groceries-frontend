import React from 'react';
import * as Crypto from 'expo-crypto';
import { useSocketContext } from './SocketContext';
import {
  addPendingOperation,
  getPendingOperations,
  removePendingOperation,
  taskDAO,
  relationsDAO,
} from '@/service/LocalDatabase';
import { PendingOperation } from '@groceries/shared_types';
import { sendSyncOperationsBatch } from '@/service/serverAPI';

type SyncContextType = {
  addToQueue: (op: Omit<PendingOperation, 'id' | 'timestamp' | 'retryCount'>) => void;
  pendingOperations: PendingOperation[];
  lastTimeSynced: string | null;
  isSyncing: boolean;
  syncAll: (onSuccess?: () => Promise<void>) => Promise<void>;
};

const SyncContext = React.createContext<SyncContextType | null>(null);

export const useSyncContext = () => {
  const context = React.useContext(SyncContext);
  if (!context) {
    throw new Error('useSyncContext must be used within a SyncContextProvider');
  }
  return context;
};

export const SyncContextProvider = ({ children }: React.PropsWithChildren) => {
  const [lastTimeSynced, setLastTimeSynced] = React.useState<string | null>(null);
  const [pendingOperations, setPendingOperations] = React.useState<PendingOperation[]>([]);
  const isSyncing = React.useRef(false);
  const { connected } = useSocketContext();
  const retryTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);
  // Fetch pending que from sql on mount
  React.useEffect(() => {
    const loadQueue = async () => {
      try {
        await fetchPendingQueue();
      } catch (e) {
        console.log('Failed to load queue, ', e);
      }
    };
    loadQueue();
  }, []);
  //Sync all when connected
  React.useEffect(() => {
    if (connected && !isSyncing.current && pendingOperations.length > 0) {
      syncAll();
    }
  }, [connected, pendingOperations.length, isSyncing]);

  const fetchPendingQueue = async () => {
    const operations = await getPendingOperations();
    setPendingOperations(operations);
  };
  const addToQueue = async (op: Omit<PendingOperation, 'id' | 'timestamp' | 'retryCount'>) => {
    const initOp: PendingOperation = {
      ...op,
      id: Crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      retryCount: 0,
    } as PendingOperation;
    setPendingOperations((prev) => [...prev, initOp]);
    await addPendingOperation(initOp);
  };

  const syncAll = async () => {
    if (isSyncing.current || !connected || pendingOperations.length === 0) {
      return;
    }
    isSyncing.current = true;

    try {
      // Push opertaions to server
      const result = await sendSyncOperationsBatch(pendingOperations);

      const { success, failed } = result;

      const pendingOpsMap = new Map(pendingOperations.map((op) => [op.id, op]));

      // Handle all failed that returned server item (LWW conflict resolution)
      const failedLWWTask = failed
        .filter((i) => i.type === 'task')
        .map((failed) => taskDAO.updateCached(failed.serverTask));
      const failedLWWRelation = failed
        .filter((i) => i.type === 'relation')
        .map((failed) => relationsDAO.updateCached([failed.serverRelations]));

      // Handle operations that failed because relation was deleted on server
      const relationDeletedReasons = ['Relation deleted', 'Relation already deleted from server'];
      const relationDeletedPromises = failed
        .filter((i) => i.type === 'simple' && relationDeletedReasons.includes(i.reason))
        .map((i) => {
          const op = pendingOpsMap.get(i.id);
          if (!op) return null;
          // Get relation ID based on operation type
          if (op.type.startsWith('task-')) {
            return (op.data as { task_relations_id: string }).task_relations_id;
          } else if (op.type.startsWith('relation-delete')) {
            return null;
          } else if (op.type.startsWith('relation-')) {
            return (op.data as { id: string }).id;
          }
          return null;
        })
        .filter((id): id is string => id !== null) // filter undefined and null
        .map((relationId) => relationsDAO.moveFromCachedToLocal(relationId));
      await Promise.all(relationDeletedPromises);
      await Promise.all([...failedLWWTask, ...failedLWWRelation]);

      // Remove ops from db
      await Promise.all([
        ...success.map((op) => removePendingOperation(op.id)),
        ...failed.map((op) => removePendingOperation(op.id)),
      ]);

      // Refresh que from db
      await fetchPendingQueue();
    } catch (error) {
      console.error('Batch sync failed:', error);
      // Schedule automatic retry for failed batch operations
      const remainingOps = await getPendingOperations();
      if (remainingOps.length > 0 && connected) {
        // Clear any existing retry timeout
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }

        retryTimeoutRef.current = setTimeout(() => {
          syncAll();
        }, 10000);
      }
    } finally {
      isSyncing.current = false;
      console.log('last time synced updated');
      setLastTimeSynced(new Date().toISOString());
    }
  };
  return (
    <SyncContext.Provider
      value={{
        isSyncing: isSyncing.current,
        lastTimeSynced,
        pendingOperations,
        addToQueue,
        syncAll,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};
