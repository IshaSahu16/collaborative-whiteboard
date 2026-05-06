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
    const room = io.sockets.adapter.rooms.get(boardId);          // Get the room object for the board
    io.to(socket.id).emit('room:users', room ? room.size : 1);  // Emit the current number of users in the room to the newly joined user
  });

  socket.on('board:leave', ({ boardId }) => {
    socket.leave(boardId);
    socket.to(boardId).emit('user:left', { userId: socket.userId });
  });

  socket.on('disconnect', () => {
    if (socket.currentBoard) {
      socket.to(socket.currentBoard).emit('user:left', { userId: socket.userId });
    }
  });
};

export default presenceHandler;