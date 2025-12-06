import { io } from 'socket.io-client';
import { uri } from '@/service/database';
import { SocketClientType } from '@groceries/shared_types';
let socket: SocketClientType | null = null;

export const socketSingleton = () => {
  if (!socket) {
    socket = io(uri + '/user', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket'],
      upgrade: true,
      multiplex: false,
      autoConnect: false,
      withCredentials: true,
    });
  }
  return socket;
};
