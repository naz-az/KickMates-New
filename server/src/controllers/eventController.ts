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

// Get an event by ID with participants and comments
export const getEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    // Get the event
    const event = await getAsync(
      `SELECT e.*, u.username as creator_name, u.profile_image as creator_profile_image
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
      `SELECT p.id, p.user_id, p.status, p.joined_at, u.username, u.profile_image
       FROM participants p
       JOIN users u ON p.user_id = u.id
       WHERE p.event_id = ?
       ORDER BY p.joined_at`,
      [id]
    );
    
    // Get all comments with user details and votes
    const comments = await allAsync(
      `SELECT c.id, c.content, c.created_at, c.parent_comment_id, c.thumbs_up, c.thumbs_down, 
       u.id as user_id, u.username, u.profile_image,
       (SELECT vote_type FROM comment_votes WHERE comment_id = c.id AND user_id = ?) as user_vote
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.event_id = ?
       ORDER BY c.created_at DESC`,
      [userId || null, id]
    );
    
    // Check if user has bookmarked this event
    let isBookmarked = false;
    if (userId) {
      const bookmark = await getAsync(
        'SELECT id FROM bookmarks WHERE event_id = ? AND user_id = ?',
        [id, userId]
      );
      isBookmarked = !!bookmark;
    }
    
    // Check if user is a participant
    let participationStatus = null;
    if (userId) {
      const participant = await getAsync(
        'SELECT status FROM participants WHERE event_id = ? AND user_id = ?',
        [id, userId]
      );
      
      if (participant) {
        participationStatus = participant.status;
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
    res.status(500).json({ message: 'Server error getting event details' });
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
    const { content, parentCommentId } = req.body;
    
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
    
    // If parentCommentId is provided, check if it exists and belongs to this event
    if (parentCommentId) {
      const parentComment = await getAsync(
        'SELECT id FROM comments WHERE id = ? AND event_id = ?',
        [parentCommentId, id]
      );
      
      if (!parentComment) {
        res.status(404).json({ message: 'Parent comment not found' });
        return;
      }
    }
    
    // Add comment
    const result = await runAsync(
      'INSERT INTO comments (event_id, user_id, content, parent_comment_id) VALUES (?, ?, ?, ?)',
      [id, userId, content, parentCommentId || null]
    );
    
    // Get comment with user details
    const comment = await getAsync(
      `SELECT c.id, c.content, c.created_at, c.parent_comment_id, c.thumbs_up, c.thumbs_down,
        u.id as user_id, u.username, u.profile_image,
        NULL as user_vote
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
    
    // Start a transaction
    await runAsync('BEGIN TRANSACTION');
    
    try {
      // First, recursively delete all child comments (replies to this comment)
      // This helper function will find all child comments and delete them
      const deleteReplies = async (parentCommentId: string) => {
        // Find all replies to this comment
        const replies = await allAsync(
          'SELECT id FROM comments WHERE parent_comment_id = ?',
          [parentCommentId]
        );
        
        // For each reply, recursively delete its replies first
        for (const reply of replies) {
          await deleteReplies(reply.id.toString());
        }
        
        // Delete all votes for these comments
        await runAsync(
          'DELETE FROM comment_votes WHERE comment_id IN (SELECT id FROM comments WHERE parent_comment_id = ?)',
          [parentCommentId]
        );
        
        // Then delete all replies to this comment
        await runAsync(
          'DELETE FROM comments WHERE parent_comment_id = ?',
          [parentCommentId]
        );
      };
      
      // First delete all nested replies
      await deleteReplies(commentId);
      
      // Delete votes for this comment
      await runAsync(
        'DELETE FROM comment_votes WHERE comment_id = ?',
        [commentId]
      );
      
      // Finally delete the comment itself
      await runAsync(
        'DELETE FROM comments WHERE id = ?',
        [commentId]
      );
      
      // Commit the transaction
      await runAsync('COMMIT');
      
      res.status(200).json({ message: 'Comment deleted' });
    } catch (error) {
      // Rollback on error
      await runAsync('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error deleting comment' });
  }
};

// Vote on a comment (thumbs up/down)
export const voteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, commentId } = req.params;
    const userId = req.user.id;
    const { voteType } = req.body;
    
    if (!voteType || (voteType !== 'up' && voteType !== 'down')) {
      res.status(400).json({ message: 'Vote type must be "up" or "down"' });
      return;
    }
    
    // Check if comment exists and belongs to the event
    const comment = await getAsync(
      'SELECT id, thumbs_up, thumbs_down FROM comments WHERE id = ? AND event_id = ?',
      [commentId, id]
    );
    
    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }
    
    // Check if user has already voted on this comment
    const existingVote = await getAsync(
      'SELECT vote_type FROM comment_votes WHERE comment_id = ? AND user_id = ?',
      [commentId, userId]
    );
    
    // Start a transaction for the update
    await runAsync('BEGIN TRANSACTION');
    
    try {
      let newThumbsUp = comment.thumbs_up;
      let newThumbsDown = comment.thumbs_down;
      
      if (existingVote) {
        // User is changing their vote
        if (existingVote.vote_type !== voteType) {
          // Update the vote type
          await runAsync(
            'UPDATE comment_votes SET vote_type = ? WHERE comment_id = ? AND user_id = ?',
            [voteType, commentId, userId]
          );
          
          // Adjust the counters
          if (voteType === 'up') {
            newThumbsUp += 1;
            newThumbsDown -= 1;
          } else {
            newThumbsUp -= 1;
            newThumbsDown += 1;
          }
        } else {
          // User is removing their vote
          await runAsync(
            'DELETE FROM comment_votes WHERE comment_id = ? AND user_id = ?',
            [commentId, userId]
          );
          
          // Adjust the counters
          if (voteType === 'up') {
            newThumbsUp -= 1;
          } else {
            newThumbsDown -= 1;
          }
        }
      } else {
        // User is adding a new vote
        await runAsync(
          'INSERT INTO comment_votes (comment_id, user_id, vote_type) VALUES (?, ?, ?)',
          [commentId, userId, voteType]
        );
        
        // Adjust the counters
        if (voteType === 'up') {
          newThumbsUp += 1;
        } else {
          newThumbsDown += 1;
        }
      }
      
      // Update comment counter
      await runAsync(
        'UPDATE comments SET thumbs_up = ?, thumbs_down = ? WHERE id = ?',
        [newThumbsUp, newThumbsDown, commentId]
      );
      
      await runAsync('COMMIT');
      
      res.status(200).json({
        message: 'Vote recorded',
        comment: {
          id: comment.id,
          thumbs_up: newThumbsUp,
          thumbs_down: newThumbsDown,
          user_vote: existingVote && existingVote.vote_type === voteType ? null : voteType
        }
      });
    } catch (error) {
      await runAsync('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Vote comment error:', error);
    res.status(500).json({ message: 'Server error voting on comment' });
  }
};

// Upload event image
export const uploadEventImage = async (req: Request & { file?: any }, res: Response): Promise<void> => {
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
    
    // req.file is provided by multer middleware
    if (!(req as any).file) {
      res.status(400).json({ message: 'No file was uploaded' });
      return;
    }

    // Save the file path or URL to the database
    const fileUrl = `/uploads/${(req as any).file.filename}`;
    
    // Update event's image_url field
    await runAsync(
      `UPDATE events 
       SET image_url = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [fileUrl, id]
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
      message: 'Event image uploaded successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Upload event image error:', error);
    res.status(500).json({ message: 'Server error uploading event image' });
  }
}; 