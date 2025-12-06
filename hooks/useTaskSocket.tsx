import { useEffect } from 'react';
import { useSocketContext } from '@/contexts/SocketContext';
import {
  ServerTaskRelationsWithTasksType,
  TaskType,
} from '@/types';

type UseTaskSocketProps = {
  onTaskCreated?: (task: TaskType) => void;
  onTaskEdited?: (task: TaskType) => void;
  onTaskRemoved?: (tasks: TaskType[]) => void;
};

const useTaskSocket = (props?: UseTaskSocketProps) => {
  const { socket } = useSocketContext();

  useEffect(() => {
    if (!socket) return;

    const handleTaskCreated = (payload: { data: TaskType }) => {
      console.log('task:create broadcast received', payload);
      props?.onTaskCreated?.(payload.data);
    };

    const handleTaskEdited = (payload: { edited_task: TaskType }) => {
      console.log('task:edit broadcast received', payload);
      props?.onTaskEdited?.(payload.edited_task);
    };

    const handleTaskRemoved = (payload: { remove_tasks: TaskType[] }) => {
      console.log('task:remove broadcast received', payload);
      props?.onTaskRemoved?.(payload.remove_tasks);
    };

    socket.on('task:create', handleTaskCreated);
    socket.on('task:edit', handleTaskEdited);
    socket.on('task:remove', handleTaskRemoved);

    return () => {
      socket.off('task:create', handleTaskCreated);
      socket.off('task:edit', handleTaskEdited);
      socket.off('task:remove', handleTaskRemoved);
    };
  }, [socket, props]);

  const emitJoinTaskRoom = async (relationId: string) => {
    return new Promise<ServerTaskRelationsWithTasksType>((resolve, reject) => {
      socket.emit('task:join', { relation_id: relationId }, (response) => {
        console.log('task:join', response);
        response.success
          ? resolve(response.data)
          : reject(new Error(response.error));
      });
    });
  };

  const emitCreateTask = async (task: TaskType) => {
    return new Promise<TaskType | TaskType[]>((resolve, reject) => {
      socket.emit('task:create', { new_task: task }, (response) => {
        console.log('task:created', response);
        response.success
          ? resolve(response.data)
          : reject(new Error(response.error));
      });
    });
  };

  const emitEditTask = async (task: TaskType) => {
    return new Promise<TaskType>((resolve, reject) => {
      socket.emit('task:edit', { edited_task: task }, (response) => {
        console.log('task:edited', response);
        response.success
          ? resolve(response.data)
          : reject(new Error(response.error));
      });
    });
  };

  const emitRemoveTask = async (tasks: TaskType[]) => {
    return new Promise<TaskType[]>((resolve, reject) => {
      socket.emit('task:remove', { remove_tasks: tasks }, (response) => {
        console.log('task:removed', response);
        response.success
          ? resolve(response.data)
          : reject(new Error(response.error));
      });
    });
  };

  return {
    emitJoinTaskRoom,
    emitCreateTask,
    emitEditTask,
    emitRemoveTask,
  };
};

export default useTaskSocket;
