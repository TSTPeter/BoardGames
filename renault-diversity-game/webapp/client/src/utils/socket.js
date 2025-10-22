import { io } from 'socket.io-client';

// Use the current domain in production, localhost in development
const SOCKET_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin 
  : (process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001');

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export default socket;
