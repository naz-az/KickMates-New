import { Router } from 'express';
import { 
  createEvent, 
  getEvents, 
  getEventById, 
  updateEvent, 
  deleteEvent, 
  joinEvent, 
  leaveEvent, 
  bookmarkEvent, 
  addComment, 
  deleteComment 
} from '../controllers/eventController';
import { authenticate } from '../middlewares/auth';
import { RequestHandler } from 'express';

const router = Router();

// Public routes
router.get('/', getEvents as RequestHandler);
router.get('/:id', getEventById as RequestHandler);

// Protected routes
router.post('/', authenticate, createEvent as RequestHandler);
router.put('/:id', authenticate, updateEvent as RequestHandler);
router.delete('/:id', authenticate, deleteEvent as RequestHandler);
router.post('/:id/join', authenticate, joinEvent as RequestHandler);
router.delete('/:id/leave', authenticate, leaveEvent as RequestHandler);
router.post('/:id/bookmark', authenticate, bookmarkEvent as RequestHandler);
router.post('/:id/comments', authenticate, addComment as RequestHandler);
router.delete('/:id/comments/:commentId', authenticate, deleteComment as RequestHandler);

export default router; 