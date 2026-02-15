import { Router } from 'express';
import multer from 'multer';
import {
  textChatHandler,
  voiceChatHandler,
  getConversationHandler,
  getConversationHistoryHandler,
  deleteConversationHandler,
  getAgentSignedUrlHandler,
} from '../controllers/chatController.js';
import { optionalAuthMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Configure multer for audio file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['audio/webm', 'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: ${allowedMimes.join(', ')}`));
    }
  },
});

// Apply optional auth to all routes
router.use(optionalAuthMiddleware);

// Text chat endpoint
router.post('/text', textChatHandler);

// Voice chat endpoint (with audio upload) - legacy
router.post('/voice', upload.single('audio'), voiceChatHandler);

// ElevenLabs agent signed URL
router.get('/agent/signed-url', getAgentSignedUrlHandler);

// Get recent conversations history
router.get('/history', getConversationHistoryHandler);

// Get conversation by ID
router.get('/:conversationId', getConversationHandler);

// Delete conversation
router.delete('/:conversationId', deleteConversationHandler);

export default router;
