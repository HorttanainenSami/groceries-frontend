import { useEffect } from 'react';
import { useSocketContext } from '@/contexts/SocketContext';
import { ServerRelationWithTasksType, TaskType } from '@groceries/shared_types';

type UseTaskSocketProps = {
  onTaskCreated?: (task: TaskType[]) => void;
  onTaskEdited?: (task: TaskType) => void;
  onTaskRemoved?: (tasks: TaskType[]) => void;
  onTaskReordered?: (tasks: TaskType[]) => void;
};

const useTaskSocket = (props?: UseTaskSocketProps) => {
  const { socket, connected } = useSocketContext();

  useEffect(() => {
    if (!socket) return;

    const handleTaskCreated = (payload: { data: TaskType[] }) => {
      props?.onTaskCreated?.(payload.data);
    };

    const handleTaskEdited = (payload: { edited_task: TaskType }) => {
      props?.onTaskEdited?.(payload.edited_task);
    };

    const handleTaskRemoved = (payload: { remove_tasks: TaskType[] }) => {
      props?.onTaskRemoved?.(payload.remove_tasks);
    };
    const handleTaskReordered = (payload: { reordered_tasks: TaskType[] }) => {
      props?.onTaskReordered?.(payload.reordered_tasks);
    };

    socket.on('task:create', handleTaskCreated);
    socket.on('task:edit', handleTaskEdited);
    socket.on('task:remove', handleTaskRemoved);
    socket.on('task:reorder', handleTaskReordered);

    return () => {
      socket.off('task:create', handleTaskCreated);
      socket.off('task:edit', handleTaskEdited);
      socket.off('task:remove', handleTaskRemoved);
      socket.off('task:reorder', handleTaskReordered);
    };
  }, [socket?.connected, props]);

  const emitJoinTaskRoom = async (relationId: string) => {
    return new Promise<ServerRelationWithTasksType>((resolve, reject) => {
      socket.emit('task:join', { relation_id: relationId }, (response) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  };

  return {
    emitJoinTaskRoom,
    connected,
  };
};

export default useTaskSocket;
