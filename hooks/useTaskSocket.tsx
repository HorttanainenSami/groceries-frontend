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
      console.log('task:create broadcast received', payload.data);
      props?.onTaskCreated?.(payload.data);
    };

    const handleTaskEdited = (payload: { edited_task: TaskType }) => {
      console.log('task:edit broadcast received', payload);
      props?.onTaskEdited?.(payload.edited_task);
    };

    const handleTaskRemoved = (payload: { remove_tasks: TaskType[] }) => {
      console.log('task:remove broadcast received', payload.remove_tasks);
      props?.onTaskRemoved?.(payload.remove_tasks);
    };
    const handleTaskReordered = (payload: { reordered_tasks: TaskType[] }) => {
      console.log('task:reordered_broadcast_recieved', payload.reordered_tasks);
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

  const emitCreateTask = async (task: TaskType) => {
    return new Promise<TaskType | TaskType[]>((resolve, reject) => {
      socket.emit('task:create', { new_task: task }, (response) => {
        console.log('task:created', response);
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  };

  const emitEditTask = async (task: TaskType) => {
    return new Promise<TaskType>((resolve, reject) => {
      socket.emit('task:edit', { edited_task: task }, (response) => {
        console.log('task:edited', response);
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  };
  const emitReorderTask = async (tasks: TaskType[]) => {
    return new Promise<TaskType[]>((resolve, reject) => {
      socket.emit('task:reorder', { reordered_tasks: tasks }, (response) => {
        console.log('task:reordered', response);
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  };

  const emitRemoveTask = async (tasks: TaskType[]) => {
    return new Promise<TaskType[]>((resolve, reject) => {
      socket.emit('task:remove', { remove_tasks: tasks }, (response) => {
        console.log('task:removed', response);
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
    emitCreateTask,
    emitEditTask,
    emitRemoveTask,
    emitReorderTask,
    connected,
  };
};

export default useTaskSocket;
