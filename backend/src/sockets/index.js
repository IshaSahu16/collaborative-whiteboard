import { Server } from 'socket.io';
import canvasHandler from './canvasHandler.js';
import presenceHandler from './presenceHandler.js';

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    canvasHandler(io, socket);
    presenceHandler(io, socket);
  });

  return io;
};

export default initSocket;