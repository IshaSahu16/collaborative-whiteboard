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

// ─────────────────────────────────────────────────────────────────────
// ✅ PRODUCTION-READY CORS — supports both localhost and deployed frontend
// ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',                              // Local dev
  'http://localhost:3001',                              // Backup local port
  process.env.CLIENT_URL,                               // Vercel production URL
  'https://collaborative-whiteboard-coral.vercel.app/',                   // Replace with your actual Vercel URL
].filter(Boolean);  // Remove undefined values

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,  // Allow cookies to be sent cross-origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],  // Important for cookie auth
};

app.use(cors(corsOptions));

// ─────────────────────────────────────────────────────────────────────
// ✅ Explicit preflight handler (optional but safe)
// ─────────────────────────────────────────────────────────────────────
app.options('*', cors(corsOptions));

// ─────────────────────────────────────────────────────────────────────
// ✅ HELMET — secure HTTP headers (with cross-origin fixes for Socket.IO)
// ─────────────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },  // Allow cross-origin resources
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
}));

// ─────────────────────────────────────────────────────────────────────
// ✅ Logging (hide in production for performance)
// ─────────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─────────────────────────────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/boards/:boardId/members', memberRoutes);
app.use('/api/boards/:boardId/pages', pageRoutes);
app.use('/api/boards/:boardId/canvas', canvasRoutes);

// ─────────────────────────────────────────────────────────────────────
// Health check endpoint (useful for Render to verify deployment)
// ─────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ 
    message: 'Whiteboard API running ✅',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// ─────────────────────────────────────────────────────────────────────
// Error handlers (must be last)
// ─────────────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─────────────────────────────────────────────────────────────────────
// Start server
// ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Allowed origins:`, allowedOrigins);
});