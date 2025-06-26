import React, { useEffect, useState } from 'react';
import {
  BaseTaskRelationsType,
  ServerTaskRelationsWithTasksType,
  TaskType,
} from '@/types';
import { useSocketContext } from '@/contexts/SocketContext';

const useTaskSocket = (
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>
) => {
  const { socket, loading } = useSocketContext();
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const loadingRef = React.useRef<boolean>(false);

  useEffect(() => {
    if (!socket) {
      return;
    }
    const handleTaskJoined = ({
      tasks,
      ...data
    }: ServerTaskRelationsWithTasksType) => {
      console.log('task:join:success', data, JSON.stringify(tasks, null, 2));
      setCurrentRoom(data.id);
      setTasks(tasks);
      loadingRef.current = false;
    };
    const handleTaskCreated = (data: TaskType) => {
      console.log('task:created', data);
      setTasks((prev) => [...prev, data]);
    };

    const handleTaskEdited = (data: TaskType) => {
      console.log('task:edited', data);
      setTasks((prev) =>
        prev.map((task) => (task.id === data.id ? data : task))
      );
    };

    const handleTasksRemoved = (data: TaskType[]) => {
      console.log('task:removed', data);
      const ids = data.map((task) => task.id);
      setTasks((prev) => prev.filter((task) => !ids.includes(task.id)));
    };

    const handleTaskRefresh = (data: any) => {
      console.log('task:refresh', data);
      setTasks(data.tasks);
    };
    socket.onAnyOutgoing((event, ...args) => {
      console.log(
        'ON ANY OUTGOING                      Socket event emitted, ',
        event,
        JSON.stringify(args, null, 2)
      );
    });
    socket.onAny((event, ...args) => {
      console.log(
        'ON ANY INCOMING                      Socket event received, ',
        event,
        JSON.stringify(args, null, 2)
      );
    });
    const reconnectHandler = (attemptNumber: number) => {
      if (!currentRoom) {
        console.log('No current room to rejoin');
        loadingRef.current = false;
        return;
      }
      console.log(`Reconnected to server after ${attemptNumber} attempts`);
      if (socket.connected) {
        console.log('Socket is not connected, attempting to connect');
        socket.emit('task:join', currentRoom);
      }
    };
    socket.on('task:join:success', handleTaskJoined);
    socket.on('task:created', handleTaskCreated);
    socket.on('task:edited', handleTaskEdited);
    socket.on('task:removed', handleTasksRemoved);
    socket.on('task:refresh', handleTaskRefresh);
    socket.on('reconnect', reconnectHandler);

    return () => {
      setCurrentRoom(null);
      socket.off('task:join:success', handleTaskJoined);
      socket.off('reconnect', reconnectHandler);

      socket.off('task:created', handleTaskCreated);
      socket.off('task:edited', handleTaskEdited);
      socket.off('task:removed', handleTasksRemoved);
      socket.off('task:refresh', handleTaskRefresh);
    };
  }, [socket]);

  const emitJoinTaskRoom = (relation: BaseTaskRelationsType) => {
    loadingRef.current = true;
    socket?.emit('task:join', relation.id);
  };
  const isConnected = () => {
    if (!currentRoom) {
      console.log('No relation is set');
      return false;
    }
    if (!socket) {
      console.log('Socket is not initialized');
      return false;
    }
    return socket.connected;
  };

  const emitCreateTask = (task: Omit<TaskType, 'id'>) => {
    if (!socket) {
      console.log('Socket is not initialized');
      return;
    }
    socket.emit('task:create', task);
  };
  const emitEditTask = (task: TaskType) => {
    if (!socket) {
      console.log('Socket is not initialized');
      return;
    }
    socket.emit('task:edit', task);
  };

  const emitRemoveTask = (task: TaskType[]) => {
    if (!socket) {
      console.log('Socket is not initialized');
      return;
    }
    socket.emit('task:remove', task);
  };
  const emitRefresh = (relation: BaseTaskRelationsType) => {
    if (!socket) {
      console.log('Socket is not initialized');
      return;
    }
    socket.emit('task:refresh', relation);
  };
  return {
    loading: loading || loadingRef.current,
    socket: socket,
    isConnected: isConnected,
    emitCreateTask,
    emitEditTask,
    emitRemoveTask,
    emitRefresh,
    emitJoinTaskRoom,
  };
};
export default useTaskSocket;
