import { Router } from 'express';
import {
  guestLoginHandler,
  registerHandler,
  loginHandler,
  linkAccountHandler,
  refreshTokenHandler,
  getMeHandler,
  updateProfileHandler,
} from '../controllers/authController.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Public routes
router.post('/guest', guestLoginHandler);
router.post('/register', optionalAuthMiddleware, registerHandler);
router.post('/login', loginHandler);
router.post('/refresh', refreshTokenHandler);

// Protected routes
router.post('/link', authMiddleware, linkAccountHandler);
router.get('/me', authMiddleware, getMeHandler);
router.patch('/profile', authMiddleware, updateProfileHandler);

export default router;
