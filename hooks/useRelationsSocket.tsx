import { useSocketContext } from '@/contexts/SocketContext';
import {
  ServerRelationType,
  ClientToServerRelatiosChangeName,
  ClientToServerRelatiosShare,
  ServerRelationWithTasksType,
} from '@groceries/shared_types';
import { useEffect } from 'react';
type UseRelationSocketProps = {
  onChangeName?: (relation: ServerRelationType) => void;
  onDelete?: (relations: [boolean, string][]) => void;
  onShare?: (relation: ServerRelationWithTasksType[]) => void;
};
const useRelationsSocket = (props?: UseRelationSocketProps) => {
  const { socket, connected } = useSocketContext();

  useEffect(() => {
    const handleRelationNameChange = (payload: ServerRelationType) => {
      props?.onChangeName?.(payload);
    };

    const handleRelationDelete = (relations: [boolean, string][]) => {
      props?.onDelete?.(relations);
    };
    const handleRelationShare = (relation: ServerRelationWithTasksType[]) => {
      props?.onShare?.(relation);
    };

    socket.on('relations:change_name', handleRelationNameChange);
    socket.on('relations:delete', handleRelationDelete);
    socket.on('relations:share', handleRelationShare);

    return () => {
      socket.off('relations:change_name', handleRelationNameChange);
      socket.off('relations:delete', handleRelationDelete);
      socket.off('relations:share', handleRelationShare);
    };
  }, [socket, props]);

  const emitGetRelations = async () => {
    return new Promise<ServerRelationType[]>((resolve, reject) => {
      socket.emit('relations:get_relations', (response) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  };

  const emitChangeRelationName = async (payload: ClientToServerRelatiosChangeName) => {
    return new Promise<ServerRelationType>((resolve, reject) => {
      socket.emit('relations:change_name', payload, (response) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  };

  const emitDeleteRelation = async (id: ServerRelationType[] | ServerRelationType) => {
    return new Promise<[boolean, string][]>((resolve, reject) => {
      socket.emit('relations:delete', id, (response) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  };

  const emitShareWithUser = async (payload: ClientToServerRelatiosShare) => {
    return new Promise<ServerRelationWithTasksType[]>((resolve, reject) => {
      socket.emit('relations:share', payload, (response) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  };
  return {
    emitGetRelations,
    emitChangeRelationName,
    emitDeleteRelation,
    emitShareWithUser,
    connected,
  };
};

export default useRelationsSocket;
