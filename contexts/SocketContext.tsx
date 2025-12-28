import React from 'react';
import { socketSingleton } from '@/service/Socket';
import useAuth from '@/hooks/useAuth';
import { SocketClientType } from '@groceries/shared_types';
import { Socket } from 'socket.io-client';

type SocketContextProps = {
  socket: SocketClientType;
  connected: boolean;
};

const socketContextValues = {
  socket: socketSingleton(),
  connected: false,
};

const SocketContext = React.createContext<SocketContextProps>(socketContextValues);

export const useSocketContext = () => {
  const context = React.useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }: React.PropsWithChildren) => {
  const [socket] = React.useState(() => socketSingleton());
  const [connected, setConnected] = React.useState(false);
  const { user, logout } = useAuth();

  React.useEffect(() => {
    socket.auth = { token: user?.token };
    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.disconnect();
    };
  }, [user?.token, socket]);

  React.useEffect(() => {
    const connectHandler = () => {
      console.log('Socket connected');
      setConnected(true);
    };
    const disconnectHandler = (reason: Socket.DisconnectReason) => {
      console.log('Socket disconnected emitter ', reason);
      setConnected(false);
    };

    const connectErrorHandler = async (err: Error) => {
      console.error('Connection error:', err.stack, err.message);
      setConnected(false);
      if (err.message === 'Invalid token' || err.message === 'jwt expired') {
        console.error('Invalid token, logging out');
        logout();
      }
    };
    socket.on('connect', connectHandler);
    socket.on('disconnect', disconnectHandler);
    socket.on('connect_error', connectErrorHandler);
    return () => {
      socket.off('connect', connectHandler);
      socket.off('disconnect', disconnectHandler);
      socket.off('connect_error', connectErrorHandler);
    };
  }, [logout, socket]);

  const contextValue = React.useMemo(
    () => ({
      socket,
      connected,
    }),
    [socket, connected]
  );
  return <SocketContext.Provider value={contextValue}>{children}</SocketContext.Provider>;
};
