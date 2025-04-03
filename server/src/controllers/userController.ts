import { Request, Response } from 'express';
import { getAsync, allAsync, runAsync } from '../db';
import { comparePassword, generateToken, hashPassword } from '../utils/auth';

// Register new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, full_name, bio } = req.body;

    // Validate input
    if (!username || !email || !password) {
      res.status(400).json({ message: 'Please provide username, email and password' });
      return;
    }

    // Check if user already exists
    const existingUser = await getAsync(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser) {
      res.status(400).json({ message: 'Username or email already in use' });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert user
    const result = await runAsync(
      `INSERT INTO users (username, email, password, full_name, bio) 
       VALUES (?, ?, ?, ?, ?)`,
      [username, email, hashedPassword, full_name || null, bio || null]
    );

    // Generate token
    const token = generateToken(result.lastID);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.lastID,
        username,
        email,
        full_name,
        bio
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ message: 'Please provide email and password' });
      return;
    }

    // Find user
    const user = await getAsync(
      'SELECT id, username, email, password, full_name, bio, profile_image FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Check password
    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get user profile
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;

    const user = await getAsync(
      `SELECT id, username, email, full_name, bio, profile_image, created_at 
       FROM users WHERE id = ?`,
      [userId]
    );

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { full_name, bio, profile_image } = req.body;

    // Update user
    await runAsync(
      `UPDATE users 
       SET full_name = COALESCE(?, full_name), 
           bio = COALESCE(?, bio), 
           profile_image = COALESCE(?, profile_image),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [full_name, bio, profile_image, userId]
    );

    // Get updated user
    const updatedUser = await getAsync(
      `SELECT id, username, email, full_name, bio, profile_image, created_at 
       FROM users WHERE id = ?`,
      [userId]
    );

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// Get user's events
export const getUserEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id || req.user.id;

    // Get events created by user
    const createdEvents = await allAsync(
      `SELECT e.*, u.username as creator_name
       FROM events e
       JOIN users u ON e.creator_id = u.id
       WHERE e.creator_id = ?
       ORDER BY e.start_date DESC`,
      [userId]
    );

    // Get events user is participating in
    const participatingEvents = await allAsync(
      `SELECT e.*, u.username as creator_name, p.status
       FROM events e
       JOIN participants p ON e.id = p.event_id
       JOIN users u ON e.creator_id = u.id
       WHERE p.user_id = ? AND e.creator_id != ?
       ORDER BY e.start_date DESC`,
      [userId, userId]
    );

    res.status(200).json({
      createdEvents,
      participatingEvents
    });
  } catch (error) {
    console.error('Get user events error:', error);
    res.status(500).json({ message: 'Server error fetching user events' });
  }
};

// Get user's bookmarked events
export const getUserBookmarks = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;

    const bookmarkedEvents = await allAsync(
      `SELECT e.*, u.username as creator_name
       FROM events e
       JOIN bookmarks b ON e.id = b.event_id
       JOIN users u ON e.creator_id = u.id
       WHERE b.user_id = ?
       ORDER BY e.start_date ASC`,
      [userId]
    );

    res.status(200).json({ bookmarkedEvents });
  } catch (error) {
    console.error('Get user bookmarks error:', error);
    res.status(500).json({ message: 'Server error fetching bookmarks' });
  }
};
