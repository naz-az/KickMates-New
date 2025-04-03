import { Router } from 'express';
import { register, login, getProfile, updateProfile, getUserEvents, getUserBookmarks } from '../controllers/userController';
import { authenticate } from '../middlewares/auth';
import { RequestHandler } from 'express';

const router = Router();

// Public routes
router.post('/register', register as RequestHandler);
router.post('/login', login as RequestHandler);

// Protected routes
router.get('/profile', authenticate, getProfile as RequestHandler);
router.put('/profile', authenticate, updateProfile as RequestHandler);
router.get('/events', authenticate, getUserEvents as RequestHandler);
router.get('/bookmarks', authenticate, getUserBookmarks as RequestHandler);

export default router; 