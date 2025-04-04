import { Request, Response } from 'express';
import db, { getAsync, runAsync, allAsync } from '../db';

// Get conversations for the current user
export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    // Get all conversations the user is participating in
    const conversations = await allAsync(`
      SELECT 
        c.id, 
        c.created_at, 
        c.updated_at
      FROM conversations c
      JOIN conversation_participants cp ON c.id = cp.conversation_id
      WHERE cp.user_id = ?
      ORDER BY c.updated_at DESC
    `, [userId]);

    // For each conversation, get the other participants and latest message
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conversation: any) => {
        // Get participants
        const participants = await allAsync(`
          SELECT 
            u.id, 
            u.username, 
            u.full_name, 
            u.profile_image
          FROM users u
          JOIN conversation_participants cp ON u.id = cp.user_id
          WHERE cp.conversation_id = ? AND u.id != ?
        `, [conversation.id, userId]);

        // Get latest message
        const latestMessage = await getAsync(`
          SELECT 
            m.id, 
            m.sender_id, 
            m.content, 
            m.is_read, 
            m.created_at,
            u.username as sender_username
          FROM messages m
          JOIN users u ON m.sender_id = u.id
          WHERE m.conversation_id = ?
          ORDER BY m.created_at DESC
          LIMIT 1
        `, [conversation.id]);

        // Get unread count
        const unreadCount = await getAsync(`
          SELECT COUNT(*) as count
          FROM messages
          WHERE conversation_id = ? AND sender_id != ? AND is_read = 0
        `, [conversation.id, userId]);

        // Format the time for display
        let displayTime = '';
        let fullDate = '';
        
        if (latestMessage) {
          const messageDate = new Date(latestMessage.created_at);
          const now = new Date();
          const diffMs = now.getTime() - messageDate.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMins / 60);
          const diffDays = Math.floor(diffHours / 24);
          
          fullDate = messageDate.toISOString();
          
          if (diffMins < 1) {
            displayTime = 'Just now';
          } else if (diffMins < 60) {
            displayTime = `${diffMins} mins ago`;
          } else if (diffHours < 24) {
            displayTime = `${diffHours} hours ago`;
          } else if (diffDays === 1) {
            displayTime = 'Yesterday';
          } else if (diffDays < 7) {
            displayTime = `${diffDays} days ago`;
          } else {
            displayTime = messageDate.toLocaleDateString();
          }
        }

        return {
          id: conversation.id,
          participants,
          lastMessage: latestMessage ? {
            id: latestMessage.id,
            senderId: latestMessage.sender_id,
            senderUsername: latestMessage.sender_username,
            content: latestMessage.content,
            isRead: Boolean(latestMessage.is_read),
            createdAt: latestMessage.created_at,
            fullDate,
            displayTime
          } : null,
          unreadCount: unreadCount ? unreadCount.count : 0,
          createdAt: conversation.created_at,
          updatedAt: conversation.updated_at
        };
      })
    );

    res.json({ conversations: conversationsWithDetails });
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ message: 'Server error while fetching conversations' });
  }
};

// Get messages for a specific conversation
export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    // Check if user is a participant in this conversation
    const participant = await getAsync(`
      SELECT * FROM conversation_participants
      WHERE conversation_id = ? AND user_id = ?
    `, [conversationId, userId]);

    if (!participant) {
      return res.status(403).json({ message: 'You are not a participant in this conversation' });
    }

    // Get messages
    const messages = await allAsync(`
      SELECT 
        m.id, 
        m.sender_id, 
        m.content, 
        m.is_read, 
        m.created_at,
        u.username as sender_username,
        u.full_name as sender_name,
        u.profile_image as sender_profile_image
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC
    `, [conversationId]);

    // Mark messages as read
    await runAsync(`
      UPDATE messages
      SET is_read = 1
      WHERE conversation_id = ? AND sender_id != ? AND is_read = 0
    `, [conversationId, userId]);

    // Format messages with date grouping
    const formattedMessages = messages.map((message: any) => {
      const date = new Date(message.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let dateGroup;
      if (date.toDateString() === today.toDateString()) {
        dateGroup = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateGroup = 'Yesterday';
      } else {
        dateGroup = date.toLocaleDateString();
      }
      
      return {
        id: message.id,
        senderId: message.sender_id,
        senderUsername: message.sender_username,
        senderName: message.sender_name,
        senderProfileImage: message.sender_profile_image,
        content: message.content,
        isRead: Boolean(message.is_read),
        createdAt: message.created_at,
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: dateGroup
      };
    });

    res.json({ messages: formattedMessages });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ message: 'Server error while fetching messages' });
  }
};

// Send a new message
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Check if user is a participant in this conversation
    const participant = await getAsync(`
      SELECT * FROM conversation_participants
      WHERE conversation_id = ? AND user_id = ?
    `, [conversationId, userId]);

    if (!participant) {
      return res.status(403).json({ message: 'You are not a participant in this conversation' });
    }

    // Insert message
    const result = await runAsync(`
      INSERT INTO messages (conversation_id, sender_id, content)
      VALUES (?, ?, ?)
    `, [conversationId, userId, content.trim()]);

    // Update conversation updated_at timestamp
    await runAsync(`
      UPDATE conversations
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [conversationId]);

    // Get the inserted message with sender details
    const message = await getAsync(`
      SELECT 
        m.id, 
        m.sender_id, 
        m.content, 
        m.is_read, 
        m.created_at,
        u.username as sender_username,
        u.full_name as sender_name,
        u.profile_image as sender_profile_image
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?
    `, [result.lastID]);

    // Format the message
    const date = new Date(message.created_at);
    const today = new Date();
    
    const formattedMessage = {
      id: message.id,
      senderId: message.sender_id,
      senderUsername: message.sender_username,
      senderName: message.sender_name,
      senderProfileImage: message.sender_profile_image,
      content: message.content,
      isRead: Boolean(message.is_read),
      createdAt: message.created_at,
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today'
    };

    res.status(201).json({ message: formattedMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error while sending message' });
  }
};

// Create a new conversation
export const createConversation = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { participantIds } = req.body;

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({ message: 'At least one participant is required' });
    }

    // Add current user to participants if not already included
    if (!participantIds.includes(userId)) {
      participantIds.push(userId);
    }

    // Check if all participants exist
    for (const participantId of participantIds) {
      const user = await getAsync(`SELECT id FROM users WHERE id = ?`, [participantId]);
      if (!user) {
        return res.status(404).json({ message: `User with ID ${participantId} not found` });
      }
    }

    // Check if a conversation with exactly these participants already exists
    if (participantIds.length === 2) {
      const existingConversation = await getAsync(`
        SELECT c.id
        FROM conversations c
        WHERE (
          SELECT COUNT(*) FROM conversation_participants
          WHERE conversation_id = c.id
        ) = 2
        AND EXISTS (
          SELECT 1 FROM conversation_participants
          WHERE conversation_id = c.id AND user_id = ?
        )
        AND EXISTS (
          SELECT 1 FROM conversation_participants
          WHERE conversation_id = c.id AND user_id = ?
        )
      `, [participantIds[0], participantIds[1]]);

      if (existingConversation) {
        // Return existing conversation
        return res.json({ conversationId: existingConversation.id });
      }
    }

    // Create new conversation
    const conversationResult = await runAsync(`
      INSERT INTO conversations DEFAULT VALUES
    `);

    const conversationId = conversationResult.lastID;

    // Add participants
    for (const participantId of participantIds) {
      await runAsync(`
        INSERT INTO conversation_participants (conversation_id, user_id)
        VALUES (?, ?)
      `, [conversationId, participantId]);
    }

    res.status(201).json({ conversationId });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ message: 'Server error while creating conversation' });
  }
};

// Get conversation details
export const getConversation = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    // Check if user is a participant in this conversation
    const participant = await getAsync(`
      SELECT * FROM conversation_participants
      WHERE conversation_id = ? AND user_id = ?
    `, [conversationId, userId]);

    if (!participant) {
      return res.status(403).json({ message: 'You are not a participant in this conversation' });
    }

    // Get conversation details
    const conversation = await getAsync(`
      SELECT id, created_at, updated_at
      FROM conversations
      WHERE id = ?
    `, [conversationId]);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Get participants
    const participants = await allAsync(`
      SELECT 
        u.id, 
        u.username, 
        u.full_name, 
        u.profile_image
      FROM users u
      JOIN conversation_participants cp ON u.id = cp.user_id
      WHERE cp.conversation_id = ?
    `, [conversationId]);

    res.json({
      conversation: {
        id: conversation.id,
        participants,
        createdAt: conversation.created_at,
        updatedAt: conversation.updated_at
      }
    });
  } catch (error) {
    console.error('Error getting conversation details:', error);
    res.status(500).json({ message: 'Server error while fetching conversation details' });
  }
}; 