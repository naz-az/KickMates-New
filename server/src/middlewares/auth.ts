import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { getAsync } from '../db';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authorization token required' });
      return;
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
    
    // Check if user exists
    const user = await getAsync('SELECT id, username, email FROM users WHERE id = ?', [decoded.userId]);
    
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }
    
    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
}; 