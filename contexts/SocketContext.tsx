import React from 'react';
import { Socket } from 'socket.io-client';
import { socketSingleton } from '@/service/Socket';
import useAuth from '@/hooks/useAuth';
import useAppStateChange from '@/hooks/useAppStateChange';

type SocketContextProps = {
  socket: Socket | null;
  loading: boolean;
  waitConnection: () => Promise<void>;
};

const socketContextValues = {
  socket: null as Socket | null,
  loading: false,
  waitConnection: () => new Promise<void>((resolve) => resolve()),
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
  const active = useAppStateChange();
  const { user, logout } = useAuth();

  const waitConnection = () => (
    new Promise<void>((resolve) => {
      if (!loading) {
        resolve();
      } else {
        let count = 0
        const interval = setInterval(() => {
          if (!loading|| count > 5) {
            clearInterval(interval);
            resolve();
          }
          console.log(`Waiting for socket connection... ${count}s`);
          count++;
        }, 1000);
        
      }
    }
  ))
  React.useEffect(()=> {
    //reconnectiong logic
    if(active && socket &&  socket.disconnected){
      socket.connect();
    }
  }, [active, socket]);

  React.useEffect(() => {
    
    console.log('Initializing socket to context');
    setLoading(true);
    const ws = socketSingleton();
    setSocket(ws);
    ws.auth = {token: user?.token};
    ws.connect();
    const errorHandler = (err: Error) => {
      console.log('*WEBSOCKET ERROR HEREREEEEEEEE*', err);
      if (err.message === 'Invalid token' || err.message === 'jwt expired') {
        console.error('Invalid token, logging out');
        logout();
      }
    }
    const connectHandler = () => {
      console.log('Socket connected');
      setLoading(false);
    };
    const disconnectHandler = (reason: Socket.DisconnectReason) => {
      console.log('Socket disconnected emitter ', reason);
      setLoading(false);
    }
   
    const reconnectFailedHadler = () => {
      console.error('Reconnection failed after maximum attempts');
      // Notify the user or retry manually
    }
    
    const connectErrorHandler = async (err:Error) => {
      console.error('Connection error:', err.stack, err.message);
      setLoading(false);
    }
    ws.on('connect', connectHandler);
    ws.on('disconnect', disconnectHandler);
    ws.on('reconnect_failed',reconnectFailedHadler);
    ws.on('auth:error', errorHandler );
    ws.on('connect_error', connectErrorHandler);
    ws.on('token:error',errorHandler);
    return () => {
      ws.off('connect', connectHandler);
      ws.off('disconnect', disconnectHandler);
      ws.off('reconnect_failed', reconnectFailedHadler);
      ws.off('error', errorHandler);
      ws.off('connect_error', connectErrorHandler);
      console.log('Socket event listeners cleaned up');
      ws.disconnect();
      console.log('Socket disconnected and cleaned up');
      ws.off('token:error', errorHandler);

      setLoading(false);
    };
    
  }, [user?.token]);


  

  return (
    <SocketContext.Provider
      value={{
        socket,
        loading,
        waitConnection
      }}>
      {children}
    </SocketContext.Provider>
  );
};
