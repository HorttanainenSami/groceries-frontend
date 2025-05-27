import React, { useEffect } from 'react';
import { uri } from '@/service/database';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthenticationContext';
import { BaseTaskRelationsType, TaskType } from '@/types';

const useRelationSocket = () => {
  const { user } = useAuth();
  const [id, setId] = React.useState<string | null>(null);
  const [socket, setSocket] = React.useState<Socket | null>(null);

  useEffect(() => {
    if (!user || !user.token|| !id) {
      return;
    }
    const s = io(uri + '/relation', {
      auth: {
        token: user.token,
        relation_id: id,
      },
    });
    setSocket(s);
    s.on('connect', () => {
      console.log('Socket connected', s.id);
    });
    return () => {
      console.log('useEffect socket disconnect', id);
      s.disconnect();
      setSocket(null);
    };
  }, [id]);

  const connectToSocket = async (relation:BaseTaskRelationsType) => {
    if (relation.relation_location == 'Local') {
      setId(null);
      return;
    }
    setId(relation.id);
    
  };

  const emitCreateTask = (task: Omit<TaskType, 'id'>) => {
    if (!socket) {
      console.error('Socket is not initialized');
      return;
    }
    socket.emit('createTask', task );
  };
  const emitEditTask = (task: Omit<TaskType, 'id'>) => {
    if (!socket) {
      console.error('Socket is not initialized');
      return;
    }
    socket.emit('editTask', task );
  };

  const emitRemoveTask = (task: TaskType[]) => {
    if (!socket) {
      console.error('Socket is not initialized');
      return;
    }
    socket.emit('removeTask', task);
  }
  return {
    socket,
    isConnected: socket?.connected || false,
    emitCreateTask,
    connectToSocket,
    emitEditTask,
    emitRemoveTask,
  };
};
export default useRelationSocket;
