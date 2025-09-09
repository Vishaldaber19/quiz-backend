const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/database');
const { handleConnection } = require('./socket/socketHandlers');

require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:3000", 
      "http://localhost:5174", 
      "http://localhost:5173",
      "https://quiz-frontend-ykfx.onrender.com"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.set('io', io);

connectDB();

app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://192.168.*.*:3000', 
    'http://192.168.*.*:5173', 
    'http://192.168.*.*:5174',
    'https://quiz-frontend-ykfx.onrender.com'
  ],
  credentials: true
}));
app.use(express.json());

app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/votes', require('./routes/votes'));

app.get('/', (req, res) => {
  res.json({ 
    message: 'Live Polling Quiz API is running!',
    endpoints: {
      'GET /api/quiz/current': 'Get current active quiz',
      'POST /api/quiz': 'Create new quiz',
      'POST /api/votes': 'Submit a vote',
      'GET /api/votes/:quizId/results': 'Get quiz results'
    }
  });
});

io.on('connection', handleConnection);

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access the API at:`);
  console.log(`  Local: http://localhost:${PORT}`);
  console.log(`  Network: http://[your-ip]:${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});