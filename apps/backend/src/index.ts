import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app.js';
import { env } from './config/env.js';

const { httpServer } = createApp();

const PORT = env.PORT;

httpServer.listen(PORT, () => {
  console.log(`
🚀 MindMate-Talk API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Server running at: http://localhost:${PORT}
📍 API endpoint: http://localhost:${PORT}/api/v1
📍 Health check: http://localhost:${PORT}/api/v1/health
📍 Environment: ${env.NODE_ENV}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  httpServer.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});
