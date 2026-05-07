const getRoomPresence = (io, boardId) => {
  const room = io.sockets.adapter.rooms.get(boardId);
  if (!room) return { users: [], count: 0 };

  const users = Array.from(room).map((socketId) => {
    const current = io.sockets.sockets.get(socketId);
    return {
      id: current?.userId || socketId,
      name: current?.userName || 'Guest',
    };
  });

  return { users, count: room.size };
};

const presenceHandler = (io, socket) => {

  //user presence and cursor movement
  socket.on('cursor:move', (data) => {
    const userId = socket.userId || data.userId || socket.id;
    const name = socket.userName || data.name || 'Guest';
    socket.to(data.boardId).emit('cursor:move', {
      userId,
      name,
      x: data.x,
      y: data.y,
    });
  });

  socket.on('board:join', ({ boardId, user }) => {
    socket.join(boardId);
    socket.userId = user?._id || user?.id || socket.id;
    socket.userName = user?.name || 'Guest';
    socket.currentBoard = boardId;
    socket.to(boardId).emit('user:joined', { userId: socket.userId, name: socket.userName });
    const presence = getRoomPresence(io, boardId);
    io.to(boardId).emit('room:presence', presence);
  });

  socket.on('board:leave', ({ boardId }) => {
    socket.leave(boardId);
    socket.to(boardId).emit('user:left', { userId: socket.userId });
    socket.currentBoard = null;
    const presence = getRoomPresence(io, boardId);
    io.to(boardId).emit('room:presence', presence);
  });

  socket.on('disconnect', () => {
    if (socket.currentBoard) {
      socket.to(socket.currentBoard).emit('user:left', { userId: socket.userId });
      const presence = getRoomPresence(io, socket.currentBoard);
      io.to(socket.currentBoard).emit('room:presence', presence);
    }
  });
};

export default presenceHandler;