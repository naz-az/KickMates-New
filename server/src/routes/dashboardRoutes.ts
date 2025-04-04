import { Router } from 'express';
import { 
  getTopCourses,
  getUserCourses,
  getUserStatistics,
  getProductivityData,
  getUpcomingEvents
} from '../controllers/dashboardController';
import { authenticate } from '../middlewares/auth';
import { RequestHandler } from 'express';

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

// Get top recommended courses
router.get('/top-courses', getTopCourses as RequestHandler);

// Get user courses
router.get('/user-courses', getUserCourses as RequestHandler);

// Get user statistics
router.get('/statistics', getUserStatistics as RequestHandler);

// Get productivity data
router.get('/productivity', getProductivityData as RequestHandler);

// Get upcoming events
router.get('/upcoming-events', getUpcomingEvents as RequestHandler);

export default router; 