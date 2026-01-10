import React, { useRef } from 'react';
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
  const [connected, setConnected] = React.useState(socket.connected);
  const { user, logout } = useAuth();
  const reconnectTimer = useRef<number | null>(null);

  // Check initial connection state on mount
  React.useEffect(() => {
    setConnected(socket.connected);
  }, [socket]);

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
      reconnectTimer.current = null;
      setConnected(true);
    };
    const disconnectHandler = (reason: Socket.DisconnectReason) => {
      console.log('Socket disconnected emitter ', reason);
      reconnectTimer.current = null;
      setConnected(false);
    };

    const connectErrorHandler = async (err: Error) => {
      console.error('Connection error');
      setConnected(false);
      if (err.message === 'Invalid token' || err.message === 'jwt expired') {
        console.error('Invalid token, logging out');
        logout();
      } else {
        const timer = setTimeout(() => {
          socket.connect();
        }, 5000);
        reconnectTimer.current = timer;
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

  return <SocketContext.Provider value={{ socket, connected }}>{children}</SocketContext.Provider>;
};
