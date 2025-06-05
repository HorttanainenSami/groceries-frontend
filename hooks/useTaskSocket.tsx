import React from 'react';
import { uri } from '@/service/database';
import { io, Socket } from 'socket.io-client';
import useAuth from '@/hooks/useAuth';
import { BaseTaskRelationsType, TaskType } from '@/types';

const useTaskSocket = () => {
  const { user } = useAuth();
  const socketRef = React.useRef<Socket | null>(null);
  const loading = React.useRef<boolean>(false);

  const disconnect = () => {
    socketRef.current?.disconnect();
    socketRef.current = null;
  };
  const connectToSocket = async (relation: BaseTaskRelationsType) =>
    new Promise((res, rej) => {
      loading.current = true;
      if (!user || !user.token || relation.relation_location !== 'Server') {
        console.log(
          'useEffect socket disconnect',
          'user:',
          user,
          'token:',
          user?.token,
          'token'
        );
        loading.current = false;
        return rej(false);
      }
      const s = io(uri + '/relation', {
        auth: {
          token: user.token,
          relation_id: relation.id,
        },
      });
      socketRef.current = s;
      s.on('connect', () => {
        console.log('Socket connected', s.id);
      });
      loading.current = false;
      console.log('connectToSocket', relation);
      s.on('disconnect', () => {
        console.log('Socket disconnected');
      });
      res(true);
    });

  const emitCreateTask = (task: Omit<TaskType, 'id'>) => {
    if (!socketRef.current) {
      console.error('Socket is not initialized');
      return;
    }
    socketRef.current.emit('createTask', task);
  };
  const emitEditTask = (task: Omit<TaskType, 'id'>) => {
    if (!socketRef.current) {
      console.error('Socket is not initialized');
      return;
    }
    socketRef.current.emit('editTask', task);
  };

  const emitRemoveTask = (task: TaskType[]) => {
    if (!socketRef.current) {
      console.error('Socket is not initialized');
      return;
    }
    socketRef.current.emit('removeTask', task);
  };
  const emitRefresh = (relation: BaseTaskRelationsType) => {
    if (!socketRef.current) {
      console.error('Socket is not initialized');
      return;
    }
    socketRef.current.emit('taskRefresh', relation);
  };
  return {
    loading: loading.current,
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
    emitCreateTask,
    connectToSocket,
    emitEditTask,
    emitRemoveTask,
    emitRefresh,
    socketDisconnect: disconnect,
  };
};
export default useTaskSocket;
