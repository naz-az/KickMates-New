import { Router } from 'express';
import { register, login, getProfile, updateProfile, getUserEvents, getUserBookmarks, getAllUsers, getUserById, getUserEventsById, changePassword, deleteAccount, uploadProfileImage } from '../controllers/userController';
import { authenticate } from '../middlewares/auth';
import { upload } from '../middlewares/upload';
import { RequestHandler } from 'express';

const router = Router();

// Public routes
router.post('/register', register as RequestHandler);
router.post('/login', login as RequestHandler);
router.get('/all', getAllUsers as RequestHandler);

// Protected routes
router.get('/profile', authenticate, getProfile as RequestHandler);
router.put('/profile', authenticate, updateProfile as RequestHandler);
router.post('/profile/upload-image', authenticate, upload.single('profileImage'), uploadProfileImage as RequestHandler);
router.get('/events', authenticate, getUserEvents as RequestHandler);
router.get('/bookmarks', authenticate, getUserBookmarks as RequestHandler);
router.post('/change-password', authenticate, changePassword as RequestHandler);
router.post('/delete-account', authenticate, deleteAccount as RequestHandler);

// Routes with params - must come after more specific routes
router.get('/:id', getUserById as RequestHandler);
router.get('/:id/events', getUserEventsById as RequestHandler);

export default router; 