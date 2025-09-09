const socketAuth = (socket, next) => {
  next();
};

const handleConnection = (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinQuiz', (quizId) => {
    socket.join(`quiz-${quizId}`);
    console.log(`User ${socket.id} joined quiz ${quizId}`);
  });

  socket.on('leaveQuiz', (quizId) => {
    socket.leave(`quiz-${quizId}`);
    console.log(`User ${socket.id} left quiz ${quizId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
};

module.exports = {
  socketAuth,
  handleConnection
};