import { Request, Response } from 'express';
import db, { getAsync, allAsync, runAsync } from '../db';

// Create a new event
export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      sport_type,
      location,
      start_date,
      end_date,
      max_players,
      image_url
    } = req.body;

    const creator_id = req.user.id;

    // Validate input
    if (!title || !sport_type || !location || !start_date || !end_date || !max_players) {
      res.status(400).json({
        message: 'Please provide title, sport type, location, start date, end date, and max players'
      });
      return;
    }

    // Insert event
    const result = await runAsync(
      `INSERT INTO events (
        creator_id, title, description, sport_type, location, 
        start_date, end_date, max_players, current_players, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        creator_id, title, description, sport_type, location,
        start_date, end_date, max_players, 1, image_url
      ]
    );

    // Add creator as a participant
    await runAsync(
      `INSERT INTO participants (event_id, user_id, status) VALUES (?, ?, ?)`,
      [result.lastID, creator_id, 'confirmed']
    );

    // Get created event
    const event = await getAsync(
      `SELECT e.*, u.username as creator_name
       FROM events e
       JOIN users u ON e.creator_id = u.id
       WHERE e.id = ?`,
      [result.lastID]
    );

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error creating event' });
  }
};

// Get all events with filters
export const getEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sport_type, location, date, search } = req.query;
    
    let query = `
      SELECT e.*, u.username as creator_name,
      (SELECT COUNT(*) FROM participants WHERE event_id = e.id AND status = 'confirmed') as confirmed_players,
      (SELECT COUNT(*) FROM participants WHERE event_id = e.id AND status = 'waiting') as waiting_players
      FROM events e
      JOIN users u ON e.creator_id = u.id
      WHERE 1=1
    `;
    
    const params: any[] = [];

    // Apply filters
    if (sport_type) {
      query += ' AND e.sport_type = ?';
      params.push(sport_type);
    }
    
    if (location) {
      query += ' AND e.location LIKE ?';
      params.push(`%${location}%`);
    }
    
    if (date) {
      query += ' AND DATE(e.start_date) = DATE(?)';
      params.push(date);
    }
    
    if (search) {
      query += ' AND (e.title LIKE ? OR e.description LIKE ? OR e.sport_type LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY e.start_date ASC';
    
    const events = await allAsync(query, params);
    
    res.status(200).json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error fetching events' });
  }
};

// Get a single event by ID
export const getEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Get event details
    const event = await getAsync(
      `SELECT e.*, u.username as creator_name
       FROM events e
       JOIN users u ON e.creator_id = u.id
       WHERE e.id = ?`,
      [id]
    );
    
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    
    // Get participants
    const participants = await allAsync(
      `SELECT p.status, p.joined_at, u.id, u.username, u.profile_image
       FROM participants p
       JOIN users u ON p.user_id = u.id
       WHERE p.event_id = ?
       ORDER BY p.status, p.joined_at`,
      [id]
    );
    
    // Get comments
    const comments = await allAsync(
      `SELECT c.id, c.content, c.created_at, u.id as user_id, u.username, u.profile_image
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.event_id = ?
       ORDER BY c.created_at DESC`,
      [id]
    );
    
    // Check if user has bookmarked the event
    let isBookmarked = false;
    let participationStatus = null;
    
    if (req.user) {
      const bookmark = await getAsync(
        'SELECT id FROM bookmarks WHERE event_id = ? AND user_id = ?',
        [id, req.user.id]
      );
      
      isBookmarked = !!bookmark;
      
      const participation = await getAsync(
        'SELECT status FROM participants WHERE event_id = ? AND user_id = ?',
        [id, req.user.id]
      );
      
      if (participation) {
        participationStatus = participation.status;
      }
    }
    
    res.status(200).json({
      event,
      participants,
      comments,
      isBookmarked,
      participationStatus
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error fetching event' });
  }
};

// Update an event
export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if user is the creator
    const event = await getAsync(
      'SELECT creator_id FROM events WHERE id = ?',
      [id]
    );
    
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    
    if (event.creator_id !== userId) {
      res.status(403).json({ message: 'Not authorized to update this event' });
      return;
    }
    
    const {
      title,
      description,
      sport_type,
      location,
      start_date,
      end_date,
      max_players,
      image_url
    } = req.body;
    
    // Update event
    await runAsync(
      `UPDATE events SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        sport_type = COALESCE(?, sport_type),
        location = COALESCE(?, location),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        max_players = COALESCE(?, max_players),
        image_url = COALESCE(?, image_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        title, description, sport_type, location,
        start_date, end_date, max_players, image_url, id
      ]
    );
    
    // Get updated event
    const updatedEvent = await getAsync(
      `SELECT e.*, u.username as creator_name
       FROM events e
       JOIN users u ON e.creator_id = u.id
       WHERE e.id = ?`,
      [id]
    );
    
    res.status(200).json({
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error updating event' });
  }
};

// Delete an event
export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if user is the creator
    const event = await getAsync(
      'SELECT creator_id FROM events WHERE id = ?',
      [id]
    );
    
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    
    if (event.creator_id !== userId) {
      res.status(403).json({ message: 'Not authorized to delete this event' });
      return;
    }
    
    db.run('BEGIN TRANSACTION');
    
    // Delete related records
    await runAsync('DELETE FROM comments WHERE event_id = ?', [id]);
    await runAsync('DELETE FROM participants WHERE event_id = ?', [id]);
    await runAsync('DELETE FROM bookmarks WHERE event_id = ?', [id]);
    
    // Delete event
    await runAsync('DELETE FROM events WHERE id = ?', [id]);
    
    db.run('COMMIT');
    
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    db.run('ROLLBACK');
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error deleting event' });
  }
};

// Join an event
export const joinEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if event exists
    const event = await getAsync(
      `SELECT id, max_players, current_players FROM events WHERE id = ?`,
      [id]
    );
    
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    
    // Check if user is already a participant
    const existingParticipant = await getAsync(
      'SELECT id, status FROM participants WHERE event_id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (existingParticipant) {
      res.status(400).json({
        message: `You are already ${existingParticipant.status === 'confirmed' ? 'a participant' : 'on the waiting list'} for this event`
      });
      return;
    }
    
    // Determine status (confirmed or waiting)
    const status = event.current_players < event.max_players ? 'confirmed' : 'waiting';
    
    // Add participant
    await runAsync(
      `INSERT INTO participants (event_id, user_id, status) VALUES (?, ?, ?)`,
      [id, userId, status]
    );
    
    // Update current_players count if confirmed
    if (status === 'confirmed') {
      await runAsync(
        `UPDATE events SET current_players = current_players + 1 WHERE id = ?`,
        [id]
      );
    }
    
    res.status(200).json({
      message: status === 'confirmed' ? 'You have joined the event!' : 'You have been added to the waiting list'
    });
  } catch (error) {
    console.error('Join event error:', error);
    res.status(500).json({ message: 'Server error joining event' });
  }
};

// Leave an event
export const leaveEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if user is a participant
    const participant = await getAsync(
      'SELECT id, status FROM participants WHERE event_id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (!participant) {
      res.status(400).json({ message: 'You are not a participant in this event' });
      return;
    }
    
    const wasConfirmed = participant.status === 'confirmed';
    
    // Delete participant
    await runAsync(
      'DELETE FROM participants WHERE event_id = ? AND user_id = ?',
      [id, userId]
    );
    
    // Update current_players count if was confirmed
    if (wasConfirmed) {
      await runAsync(
        `UPDATE events SET current_players = current_players - 1 WHERE id = ?`,
        [id]
      );
      
      // Move someone from waiting list to confirmed if there was one
      const waitingParticipant = await getAsync(
        `SELECT id, user_id FROM participants 
         WHERE event_id = ? AND status = 'waiting'
         ORDER BY joined_at ASC LIMIT 1`,
        [id]
      );
      
      if (waitingParticipant) {
        await runAsync(
          `UPDATE participants SET status = 'confirmed' WHERE id = ?`,
          [waitingParticipant.id]
        );
        
        await runAsync(
          `UPDATE events SET current_players = current_players + 1 WHERE id = ?`,
          [id]
        );
      }
    }
    
    res.status(200).json({ message: 'You have left the event' });
  } catch (error) {
    console.error('Leave event error:', error);
    res.status(500).json({ message: 'Server error leaving event' });
  }
};

// Bookmark an event
export const bookmarkEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if event exists
    const event = await getAsync('SELECT id FROM events WHERE id = ?', [id]);
    
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    
    // Check if already bookmarked
    const existingBookmark = await getAsync(
      'SELECT id FROM bookmarks WHERE event_id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (existingBookmark) {
      // Remove bookmark
      await runAsync(
        'DELETE FROM bookmarks WHERE event_id = ? AND user_id = ?',
        [id, userId]
      );
      
      res.status(200).json({
        message: 'Event removed from bookmarks',
        bookmarked: false
      });
      return;
    }
    
    // Add bookmark
    await runAsync(
      'INSERT INTO bookmarks (event_id, user_id) VALUES (?, ?)',
      [id, userId]
    );
    
    res.status(200).json({
      message: 'Event bookmarked',
      bookmarked: true
    });
  } catch (error) {
    console.error('Bookmark event error:', error);
    res.status(500).json({ message: 'Server error bookmarking event' });
  }
};

// Add a comment to an event
export const addComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { content } = req.body;
    
    if (!content || !content.trim()) {
      res.status(400).json({ message: 'Comment content is required' });
      return;
    }
    
    // Check if event exists
    const event = await getAsync('SELECT id FROM events WHERE id = ?', [id]);
    
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    
    // Add comment
    const result = await runAsync(
      'INSERT INTO comments (event_id, user_id, content) VALUES (?, ?, ?)',
      [id, userId, content]
    );
    
    // Get comment with user details
    const comment = await getAsync(
      `SELECT c.id, c.content, c.created_at, u.id as user_id, u.username, u.profile_image
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [result.lastID]
    );
    
    res.status(201).json({
      message: 'Comment added',
      comment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error adding comment' });
  }
};

// Delete a comment
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, commentId } = req.params;
    const userId = req.user.id;
    
    // Check if comment exists and belongs to user or is event creator
    const comment = await getAsync(
      `SELECT c.id, c.user_id, e.creator_id
       FROM comments c
       JOIN events e ON c.event_id = e.id
       WHERE c.id = ? AND c.event_id = ?`,
      [commentId, id]
    );
    
    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }
    
    // Check if user is comment owner or event creator
    if (comment.user_id !== userId && comment.creator_id !== userId) {
      res.status(403).json({ message: 'Not authorized to delete this comment' });
      return;
    }
    
    // Delete comment
    await runAsync('DELETE FROM comments WHERE id = ?', [commentId]);
    
    res.status(200).json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error deleting comment' });
  }
}; 