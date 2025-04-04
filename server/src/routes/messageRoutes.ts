import express, { RequestHandler } from 'express';
import { 
  getConversations, 
  getMessages, 
  sendMessage, 
  createConversation,
  getConversation
} from '../controllers/messageController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all conversations for current user
router.get('/conversations', getConversations as RequestHandler);

// Create a new conversation
router.post('/conversations', createConversation as RequestHandler);

// Get a specific conversation
router.get('/conversations/:conversationId', getConversation as RequestHandler);

// Get messages for a specific conversation
router.get('/conversations/:conversationId/messages', getMessages as RequestHandler);

// Send a message to a conversation
router.post('/conversations/:conversationId/messages', sendMessage as RequestHandler);

export default router; 