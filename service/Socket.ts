import { io, Socket } from 'socket.io-client';
import { uri } from '@/service/database';
let socket: Socket | null = null;

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
