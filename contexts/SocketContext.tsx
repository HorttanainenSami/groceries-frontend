import React, { useEffect } from 'react';
import { Socket, io } from 'socket.io-client';
import { uri } from '@/service/database';
import useAuth from '@/hooks/useAuth';

type SocketContextProps = {
  socket: Socket | null;
  loading: boolean;
};

const socketContextValues = {
  socket: null as Socket | null,
  loading: false,
};

const SocketContext =
  React.createContext<SocketContextProps>(socketContextValues);

export const useSocketContext = () => {
  const context = React.useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }: React.PropsWithChildren) => {
  const [socket, setSocket] = React.useState<Socket | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const { user } = useAuth();

  React.useEffect(() => {
    setLoading(true);
    if (!user) {
      setLoading(false);
      if (socket) socket.disconnect();
      setSocket(null);
      return;
    }
    const ws = io(uri + '/user', {
      auth: {
        token: user.token,
      },
    });

    ws.on('connect', () => {
      setLoading(false);
      console.log('Socket connected', ws.id);
      setSocket(ws);
    });
    ws.on('disconnect', () => {
      console.log('Socket disconnected emitter');
      setLoading(false);
      setSocket(null);
    });
    ws.on('error', (err) => {
      console.log(err);
      setLoading(false);
    });
    ws.on('connect_error', async (err) => {
      console.error('Connection error:', err.stack, err.message);
      setLoading(false);
    });

    return () => {
      ws.disconnect();
    };
  }, [user?.token]);

  return (
    <SocketContext.Provider value={{ socket, loading }}>
      {children}
    </SocketContext.Provider>
  );
};
