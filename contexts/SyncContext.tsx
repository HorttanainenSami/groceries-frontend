import React from 'react';
import * as Crypto from 'expo-crypto';
import { useSocketContext } from './SocketContext';
import {
  addPendingOperation,
  getPendingOperations,
  removePendingOperation,
} from '@/service/LocalDatabase';
import { PendingOperation } from '@groceries/shared_types';
import { sendSyncOperationsBatch } from '@/service/database';

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
  const [isSyncing, setIsSyncing] = React.useState(false);
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
    if (connected && !isSyncing && pendingOperations.length > 0) {
      syncAll();
    }
  }, [connected, pendingOperations.length]);

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
    if (isSyncing || !connected || pendingOperations.length === 0) {
      return;
    }
    setIsSyncing(true);

    try {
      // Push opertaions to server
      const result = await sendSyncOperationsBatch(pendingOperations);

      const { success, failed } = result;

      // Remove ops from db
      await Promise.all([
        success.map((id) => removePendingOperation(id.id)),
        failed.map((id) => removePendingOperation(id.id)),
      ]);

      // Notify user if any operation were not successful
      if (failed.length > 0) {
        console.warn(
          `${failed.length} operations failed to sync after 5 retries and were discarded`
        );
        // TODO: Show toast/notification to user
      }

      // Refresh que from db
      await fetchPendingQueue();
      setLastTimeSynced(new Date().toISOString());

      setLastTimeSynced(new Date().toISOString());
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
      setIsSyncing(false);
    }
  };
  return (
    <SyncContext.Provider
      value={{ isSyncing, lastTimeSynced, pendingOperations, addToQueue, syncAll }}
    >
      {children}
    </SyncContext.Provider>
  );
};
