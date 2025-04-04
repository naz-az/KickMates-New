import { Request, Response } from 'express';
import db, { allAsync, getAsync } from '../db';

// Extend Request type to include user property
interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

/**
 * Get top recommended courses
 */
export const getTopCourses = async (req: AuthRequest, res: Response) => {
  try {
    const courses = await allAsync(
      `SELECT * FROM dashboard_courses ORDER BY rating DESC, attendees DESC LIMIT 4`
    );
    
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error getting top courses:', error);
    res.status(500).json({ message: 'Failed to fetch top courses' });
  }
};

/**
 * Get user courses with participants
 */
export const getUserCourses = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  
  try {
    // Get user courses
    const userCourses = await allAsync(
      `SELECT * FROM user_courses WHERE user_id = ?`,
      [userId]
    );
    
    // Get participants for each course
    const coursesWithParticipants = await Promise.all(
      userCourses.map(async (course: any) => {
        const participants = await allAsync(
          `SELECT u.id, u.profile_image 
           FROM course_participants cp
           JOIN users u ON cp.user_id = u.id
           WHERE cp.course_id = ?`,
          [course.id]
        );
        
        return {
          ...course,
          participants: participants.map((p: any) => p.profile_image)
        };
      })
    );
    
    res.status(200).json(coursesWithParticipants);
  } catch (error) {
    console.error('Error getting user courses:', error);
    res.status(500).json({ message: 'Failed to fetch user courses' });
  }
};

/**
 * Get user statistics
 */
export const getUserStatistics = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  
  try {
    const stats = await getAsync(
      `SELECT * FROM user_statistics WHERE user_id = ?`,
      [userId]
    );
    
    if (!stats) {
      return res.status(404).json({ message: 'Statistics not found' });
    }
    
    // Format the response
    const formattedStats = {
      score: {
        value: stats.score,
        change: stats.score_change
      },
      completedHours: {
        value: stats.completed_hours,
        change: stats.completed_hours_change
      },
      totalStudents: {
        value: stats.total_students,
        change: stats.total_students_change
      },
      totalHours: {
        value: stats.total_hours,
        change: stats.total_hours_change
      }
    };
    
    res.status(200).json(formattedStats);
  } catch (error) {
    console.error('Error getting user statistics:', error);
    res.status(500).json({ message: 'Failed to fetch user statistics' });
  }
};

/**
 * Get productivity data
 */
export const getProductivityData = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  
  try {
    const productivityData = await allAsync(
      `SELECT * FROM productivity_data WHERE user_id = ? ORDER BY 
       CASE 
         WHEN day = 'Mon' THEN 1
         WHEN day = 'Tue' THEN 2
         WHEN day = 'Wed' THEN 3
         WHEN day = 'Thu' THEN 4
         WHEN day = 'Fri' THEN 5
         WHEN day = 'Sat' THEN 6
         WHEN day = 'Sun' THEN 7
       END`,
      [userId]
    );
    
    // Format the response
    const formattedData = {
      days: productivityData.map((d: any) => d.day),
      mentoring: productivityData.map((d: any) => d.mentoring),
      selfImprove: productivityData.map((d: any) => d.self_improve),
      student: productivityData.map((d: any) => d.student)
    };
    
    res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error getting productivity data:', error);
    res.status(500).json({ message: 'Failed to fetch productivity data' });
  }
};

/**
 * Get upcoming events
 */
export const getUpcomingEvents = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  
  try {
    const events = await allAsync(
      `SELECT * FROM upcoming_events WHERE user_id = ? ORDER BY event_date`,
      [userId]
    );
    
    res.status(200).json(events);
  } catch (error) {
    console.error('Error getting upcoming events:', error);
    res.status(500).json({ message: 'Failed to fetch upcoming events' });
  }
}; 