import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import connectDB from './src/config/db.js';
import initSocket from './src/sockets/index.js';

import authRoutes from './src/routes/authRoutes.js';
import boardRoutes from './src/routes/boardRoutes.js';
import memberRoutes from './src/routes/memberRoutes.js';
import canvasRoutes from './src/routes/canvasRoutes.js';
import pageRoutes from './src/routes/pageRoutes.js';

import { notFound, errorHandler } from './src/middleware/errorMiddleware.js';

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

initSocket(server);

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Handle preflight for all routes
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.sendStatus(204);
  }
  next();
});

app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/boards/:boardId/members', memberRoutes);
app.use('/api/boards/:boardId/pages', pageRoutes);
app.use('/api/boards/:boardId/canvas', canvasRoutes);

app.get('/', (req, res) => res.json({ message: 'Whiteboard API running ✅' }));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));