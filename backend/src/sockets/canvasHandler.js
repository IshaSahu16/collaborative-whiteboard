const canvasHandler = (io, socket) => {

  // Listen for drawing events and broadcast them to other users in the same board
  socket.on('draw:start', (data) => {
    socket.to(data.boardId).emit('draw:start', data);
  });

  // Broadcast drawing movements to other users in the same board
  socket.on('draw:move', (data) => {
    socket.to(data.boardId).emit('draw:move', data);
  });

  socket.on('draw:end', (data) => {
    socket.to(data.boardId).emit('draw:end', data);
  });

  socket.on('element:delete', (data) => {
    socket.to(data.boardId).emit('element:delete', data);
  });

  socket.on('canvas:undo', (data) => {
    socket.to(data.boardId).emit('canvas:undo', data);
  });
  
  socket.on('page:change', (data) => {
    socket.to(data.boardId).emit('page:change', data);
  });
};

export default canvasHandler;