import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getConversations, getMessages, sendMessage } from '../services/api';

// Message types
interface Contact {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

interface ConversationParticipant {
  id: number;
  username: string;
  full_name: string;
  profile_image: string;
}

interface Conversation {
  id: number;
  participants: ConversationParticipant[];
  lastMessage: {
    id: number;
    senderId: number;
    senderUsername: string;
    content: string;
    isRead: boolean;
    createdAt: string;
    displayTime: string;
  } | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

interface MessageData {
  id: number;
  senderId: number;
  senderUsername: string;
  senderName: string;
  senderProfileImage: string;
  content: string;
  isRead: boolean;
  time: string;
  date: string;
}

const MessagesPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  
  const [activeConversation, setActiveConversation] = useState<number | null>(
    conversationId ? parseInt(conversationId) : null
  );
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Get user ID from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserId(user.id);
    }
  }, []);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await getConversations();
        setConversations(response.data.conversations);
        
        // If no active conversation is set but we have conversations, set the first one active
        if (!activeConversation && response.data.conversations.length > 0) {
          setActiveConversation(response.data.conversations[0].id);
          navigate(`/messages/${response.data.conversations[0].id}`);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setLoading(false);
      }
    };

    fetchConversations();
  }, [activeConversation, navigate]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeConversation) return;
      
      try {
        setLoadingMessages(true);
        const response = await getMessages(activeConversation);
        setMessages(response.data.messages);
        setLoadingMessages(false);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [activeConversation]);

  // Scroll to bottom of messages when they change
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conversation => {
    const participantNames = conversation.participants
      .map(p => p.full_name || p.username)
      .join(' ');
    
    return participantNames.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Get current active conversation data
  const activeConversationData = conversations.find(conversation => conversation.id === activeConversation);
  
  // Format conversations into contacts for display
  const contacts: Contact[] = filteredConversations.map(conversation => {
    // Get the first participant's name and image
    const participant = conversation.participants[0];
    
    return {
      id: conversation.id,
      name: participant.full_name || participant.username,
      avatar: participant.profile_image || 'https://i.pravatar.cc/150?u=user' + participant.id,
      lastMessage: conversation.lastMessage ? conversation.lastMessage.content : 'No messages yet',
      time: conversation.lastMessage ? conversation.lastMessage.displayTime : 'Never',
      unread: conversation.unreadCount,
      online: Math.random() > 0.5 // Random online status for demo
    };
  });

  // Mark messages as read when selecting a contact
  const handleSelectContact = (contactId: number) => {
    setActiveConversation(contactId);
    navigate(`/messages/${contactId}`);
    
    // Update conversations to mark messages as read locally
    setConversations(prevConversations => 
      prevConversations.map(conversation => 
        conversation.id === contactId ? { ...conversation, unreadCount: 0 } : conversation
      )
    );
  };

  // Send a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeConversation || !messageInput.trim()) return;
    
    try {
      // Optimistically add the message to UI
      const newMessage: MessageData = {
        id: Date.now(), // Temporary ID
        senderId: userId || 0,
        senderUsername: 'me',
        senderName: 'Me',
        senderProfileImage: '',
        content: messageInput.trim(),
        isRead: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: 'Today'
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Update last message in conversations for UI
      setConversations(prevConversations => 
        prevConversations.map(conversation => 
          conversation.id === activeConversation
            ? { 
                ...conversation, 
                lastMessage: conversation.lastMessage 
                  ? {
                      ...conversation.lastMessage,
                      content: messageInput.trim(),
                      displayTime: 'Just now'
                    }
                  : {
                      id: Date.now(),
                      senderId: userId || 0,
                      senderUsername: 'me',
                      content: messageInput.trim(),
                      isRead: false,
                      createdAt: new Date().toISOString(),
                      displayTime: 'Just now'
                    }
              } 
            : conversation
        )
      );
      
      // Clear input
      setMessageInput('');
      
      // Send to API
      const response = await sendMessage(activeConversation, messageInput.trim());
      
      // Update with actual message data from server
      setMessages(prev => prev.map(msg => 
        // Replace our optimistic message with real one from server
        msg.id === newMessage.id ? {
          id: response.data.message.id,
          senderId: response.data.message.senderId,
          senderUsername: response.data.message.senderUsername,
          senderName: response.data.message.senderName,
          senderProfileImage: response.data.message.senderProfileImage,
          content: response.data.message.content,
          isRead: response.data.message.isRead,
          time: response.data.message.time,
          date: response.data.message.date
        } : msg
      ));
      
    } catch (error) {
      console.error('Error sending message:', error);
      // Revert the optimistic update if there's an error
      setMessages(prev => prev.filter(msg => msg.id !== Date.now()));
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce<Record<string, MessageData[]>>((groups, message) => {
    const date = message.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  // Get total unread messages count
  const totalUnread = conversations.reduce((count, conversation) => count + conversation.unreadCount, 0);

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="chat-container shadow-lg rounded-lg">
        {/* Chat Sidebar */}
        <div className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h2 className="chat-sidebar-title">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Messages
            </h2>
            {totalUnread > 0 && (
              <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalUnread}
              </span>
            )}
          </div>
          
          <div className="chat-sidebar-search">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..." 
              className="chat-sidebar-search-input"
            />
          </div>
          
          <div className="chat-conversations">
            {contacts.length > 0 ? (
              contacts.map(contact => (
                <div 
                  key={contact.id}
                  className={`chat-conversation-item ${contact.id === activeConversation ? 'active' : ''}`}
                  onClick={() => handleSelectContact(contact.id)}
                >
                  <div className="relative">
                    <img 
                      src={contact.avatar} 
                      alt={contact.name} 
                      className={`chat-avatar ${contact.online ? 'online' : ''}`}
                    />
                  </div>
                  
                  <div className="chat-user-info">
                    <div className="chat-username">{contact.name}</div>
                    <div className="chat-preview">{contact.lastMessage}</div>
                  </div>
                  
                  <div className="chat-meta">
                    <div className="chat-time">{contact.time}</div>
                    {contact.unread > 0 && (
                      <div className="chat-badge">{contact.unread}</div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-4 text-gray-500">No conversations found</div>
            )}
          </div>
        </div>
        
        {/* Chat Main Content */}
        <div className="chat-content">
          {/* Chat Header */}
          {activeConversationData && contacts.length > 0 && (
            <div className="chat-header">
              <div className="chat-user">
                <img 
                  src={contacts.find(c => c.id === activeConversation)?.avatar} 
                  alt={contacts.find(c => c.id === activeConversation)?.name}
                  className="chat-avatar"
                />
                <div>
                  <div className="font-medium">
                    {contacts.find(c => c.id === activeConversation)?.name}
                  </div>
                  {contacts.find(c => c.id === activeConversation)?.online ? (
                    <div className="chat-user-status">Online</div>
                  ) : (
                    <div className="text-sm text-gray-500">Offline</div>
                  )}
                </div>
              </div>
              
              <div className="chat-actions">
                <button className="chat-action-button">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
                <button className="chat-action-button">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button className="chat-action-button">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          {/* Chat Messages */}
          <div className="chat-messages">
            {loadingMessages ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date} className="message-group">
                  <div className="text-center mb-4">
                    <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">
                      {date}
                    </span>
                  </div>
                  
                  {dateMessages.map(message => {
                    const isCurrentUser = message.senderId === userId;
                    
                    return (
                      <div 
                        key={message.id}
                        className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isCurrentUser && (
                          <img 
                            src={message.senderProfileImage || `https://i.pravatar.cc/150?u=user${message.senderId}`} 
                            alt={message.senderName}
                            className="w-8 h-8 rounded-full mr-2 self-end"
                          />
                        )}
                        
                        <div className={`message-bubble ${isCurrentUser ? 'message-outgoing' : 'message-incoming'}`}>
                          {message.content}
                          <div className="message-time">{message.time}</div>
                        </div>
                        
                        {isCurrentUser && (
                          <img 
                            src={localStorage.getItem('profile_image') || `https://i.pravatar.cc/150?u=me`} 
                            alt="Me"
                            className="w-8 h-8 rounded-full ml-2 self-end"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
            <div ref={messageEndRef} />
          </div>
          
          {/* Chat Input Form */}
          <div className="chat-footer">
            <form className="message-form" onSubmit={handleSendMessage}>
              <button 
                type="button" 
                className="p-2 text-gray-500 rounded-full hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                className="message-input"
                disabled={!activeConversation}
              />
              
              <button 
                type="submit" 
                className="message-send-button"
                disabled={!messageInput.trim() || !activeConversation}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage; 