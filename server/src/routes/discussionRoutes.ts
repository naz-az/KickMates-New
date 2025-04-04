import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { 
  getDiscussions, 
  getDiscussionById,
  createDiscussion,
  updateDiscussion,
  deleteDiscussion,
  addComment,
  deleteComment,
  voteComment,
  voteDiscussion,
  uploadDiscussionImage
} from '../controllers/discussionController';
import { RequestHandler } from 'express';
import { upload } from '../middlewares/upload';

const router = Router();

// Public routes
router.get('/', getDiscussions as RequestHandler);
router.get('/:id', getDiscussionById as RequestHandler);

// Protected routes
router.post('/', authenticate, createDiscussion as RequestHandler);
router.put('/:id', authenticate, updateDiscussion as RequestHandler);
router.delete('/:id', authenticate, deleteDiscussion as RequestHandler);
router.post('/:id/vote', authenticate, voteDiscussion as RequestHandler);
router.post('/:id/comments', authenticate, addComment as RequestHandler);
router.delete('/:id/comments/:commentId', authenticate, deleteComment as RequestHandler);
router.post('/:id/comments/:commentId/vote', authenticate, voteComment as RequestHandler);
router.post('/:id/upload-image', authenticate, upload.single('discussionImage'), uploadDiscussionImage as RequestHandler);

export default router; 