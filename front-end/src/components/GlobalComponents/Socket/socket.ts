import { io } from 'socket.io-client';

const newSocket = io('http://localhost:3001', {
  transports: ['websocket']
});

export default newSocket;
