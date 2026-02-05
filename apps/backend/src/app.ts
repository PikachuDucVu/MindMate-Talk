import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestIdMiddleware, loggerMiddleware } from './middleware/requestId.js';

export function createApp() {
  const app = express();
  const httpServer = createServer(app);

  // Socket.IO setup
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
  });

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  }));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Custom middleware
  app.use(requestIdMiddleware);
  app.use(loggerMiddleware);

  // API routes
  app.use('/api/v1', routes);

  // Root endpoint
  app.get('/', (_req, res) => {
    res.json({
      name: 'MindMate-Talk API',
      version: '1.0.0',
      docs: '/api/v1/health',
    });
  });

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  // Socket.IO events
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });

    // Voice chat events (for future WebSocket streaming)
    socket.on('voice:start', (data) => {
      console.log(`Voice start: ${data.conversationId}`);
      socket.emit('ai:thinking');
    });

    socket.on('voice:chunk', (data) => {
      // Handle audio chunk streaming
      console.log(`Voice chunk received: ${data.sequence}`);
    });

    socket.on('voice:end', async (data) => {
      console.log(`Voice end: ${data.conversationId}`);
      // Process audio and send response
      socket.emit('ai:response:end', {
        messageId: 'msg_placeholder',
        content: 'Voice processing placeholder',
        crisisLevel: 'NONE',
      });
    });
  });

  return { app, httpServer, io };
}
