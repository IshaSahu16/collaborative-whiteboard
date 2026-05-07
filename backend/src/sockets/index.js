import { Server } from 'socket.io';
import canvasHandler from './canvasHandler.js';
import presenceHandler from './presenceHandler.js';

const initSocket = (server) => {

  const allowedOrigins = [
  'http://localhost:3000',
  'https://collaborative-whiteboard-coral.vercel.app',
  process.env.CLIENT_URL,
  ].filter(Boolean);

  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
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