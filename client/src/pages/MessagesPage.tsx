import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

// Mock user and message data (would normally be loaded from API)
const mockContacts = [
  {
    id: 1,
    name: 'Sarah Williams',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    lastMessage: 'Are we still meeting today?',
    time: 'Just now',
    unread: 2,
    online: true
  },
  {
    id: 2,
    name: 'John Miller',
    avatar: 'https://i.pravatar.cc/150?u=john',
    lastMessage: 'The game was amazing!',
    time: '2 hours ago',
    unread: 0,
    online: false
  },
  {
    id: 3,
    name: 'Emma Davis',
    avatar: 'https://i.pravatar.cc/150?u=emma',
    lastMessage: 'Looking forward to our tennis match',
    time: 'Yesterday',
    unread: 0,
    online: true
  },
  {
    id: 4,
    name: 'Michael Chen',
    avatar: 'https://i.pravatar.cc/150?u=michael',
    lastMessage: 'Thanks for organizing the event',
    time: 'Monday',
    unread: 0,
    online: false
  },
  {
    id: 5,
    name: 'Lisa Rodriguez',
    avatar: 'https://i.pravatar.cc/150?u=lisa',
    lastMessage: 'Count me in for the basketball game on Saturday',
    time: 'Last week',
    unread: 0,
    online: true
  }
];

const mockMessages = {
  1: [
    {
      id: 101,
      senderId: 1,
      text: 'Hey there! How are you doing today?',
      time: '10:30 AM',
      date: 'Today'
    },
    {
      id: 102,
      senderId: 'me',
      text: 'Im good, thanks! Just finishing up some work.',
      time: '10:32 AM',
      date: 'Today'
    },
    {
      id: 103,
      senderId: 1,
      text: 'Are we still meeting today for the basketball practice?',
      time: '10:45 AM',
      date: 'Today'
    },
    {
      id: 104,
      senderId: 'me',
      text: 'Yes, definitely! I was thinking 5pm at the usual court, does that work for you?',
      time: '10:50 AM',
      date: 'Today'
    },
    {
      id: 105,
      senderId: 1,
      text: 'Perfect. I invited a couple more players to join us if that\'s okay.',
      time: '10:52 AM',
      date: 'Today'
    },
    {
      id: 106,
      senderId: 'me',
      text: 'That\'s great! The more the merrier. Should we get some drinks for after?',
      time: '10:55 AM',
      date: 'Today'
    }
  ],
  2: [
    {
      id: 201,
      senderId: 2,
      text: 'Did you see the game last night?',
      time: '7:30 PM',
      date: 'Yesterday'
    },
    {
      id: 202,
      senderId: 'me',
      text: 'Yes! It was incredible. Our team played really well.',
      time: '8:15 PM',
      date: 'Yesterday'
    },
    {
      id: 203,
      senderId: 2,
      text: 'That last-minute shot was unbelievable!',
      time: '8:17 PM',
      date: 'Yesterday'
    }
  ],
  3: [
    {
      id: 301,
      senderId: 3,
      text: 'Hey, do you want to play tennis this weekend?',
      time: '3:15 PM',
      date: 'Monday'
    },
    {
      id: 302,
      senderId: 'me',
      text: 'Id love to! How about Saturday morning?',
      time: '4:22 PM',
      date: 'Monday'
    },
    {
      id: 303,
      senderId: 3,
      text: 'Saturday works for me. 10am?',
      time: '4:30 PM',
      date: 'Monday'
    },
    {
      id: 304,
      senderId: 'me',
      text: 'Perfect, see you then!',
      time: '4:35 PM',
      date: 'Monday'
    }
  ],
  4: [
    {
      id: 401,
      senderId: 4,
      text: 'Thanks for organizing the soccer match last week!',
      time: '12:10 PM',
      date: 'Last week'
    },
    {
      id: 402,
      senderId: 'me',
      text: 'No problem! It was a lot of fun.',
      time: '1:45 PM',
      date: 'Last week'
    },
    {
      id: 403,
      senderId: 4,
      text: 'Let me know when you plan the next one. I want to join again!',
      time: '2:00 PM',
      date: 'Last week'
    }
  ],
  5: [
    {
      id: 501,
      senderId: 5,
      text: 'Are you organizing a basketball game this weekend?',
      time: '5:20 PM',
      date: 'Last week'
    },
    {
      id: 502,
      senderId: 'me',
      text: 'Yes, planning for Saturday at 3pm at Central Park courts.',
      time: '5:45 PM',
      date: 'Last week'
    },
    {
      id: 503,
      senderId: 5,
      text: 'Count me in! Should I bring anything?',
      time: '6:10 PM',
      date: 'Last week'
    },
    {
      id: 504,
      senderId: 'me',
      text: 'Just yourself and water! We have all the equipment.',
      time: '6:15 PM',
      date: 'Last week'
    }
  ]
};

const MessagesPage = () => {
  const { contactId } = useParams();
  const [activeContact, setActiveContact] = useState(contactId ? parseInt(contactId) : 1);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState(mockContacts);
  const [messages, setMessages] = useState(mockMessages);
  const messageEndRef = useRef(null);

  // Filter contacts based on search query
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get current active contact data
  const activeContactData = contacts.find(contact => contact.id === activeContact);
  
  // Get messages for active contact
  const activeMessages = messages[activeContact] || [];

  // Scroll to bottom of messages when they change
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeMessages]);

  // Mark messages as read when selecting a contact
  const handleSelectContact = (contactId) => {
    setActiveContact(contactId);
    
    // Update contacts to mark messages as read
    setContacts(prevContacts => 
      prevContacts.map(contact => 
        contact.id === contactId ? { ...contact, unread: 0 } : contact
      )
    );
  };

  // Send a new message
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (messageInput.trim()) {
      const newMessage = {
        id: Date.now(),
        senderId: 'me',
        text: messageInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: 'Today'
      };
      
      // Add message to state
      setMessages(prevMessages => ({
        ...prevMessages,
        [activeContact]: [...(prevMessages[activeContact] || []), newMessage]
      }));
      
      // Update last message in contacts
      setContacts(prevContacts => 
        prevContacts.map(contact => 
          contact.id === activeContact 
            ? { 
                ...contact, 
                lastMessage: messageInput.trim(),
                time: 'Just now'
              } 
            : contact
        )
      );
      
      // Clear input
      setMessageInput('');
    }
  };

  // Group messages by date
  const groupedMessages = activeMessages.reduce((groups, message) => {
    const date = message.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  // Get total unread messages count
  const totalUnread = contacts.reduce((count, contact) => count + contact.unread, 0);

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
            {filteredContacts.length > 0 ? (
              filteredContacts.map(contact => (
                <div 
                  key={contact.id}
                  className={`chat-conversation-item ${contact.id === activeContact ? 'active' : ''}`}
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
              <div className="text-center p-4 text-gray-500">No contacts found</div>
            )}
          </div>
        </div>
        
        {/* Chat Main Content */}
        <div className="chat-content">
          {/* Chat Header */}
          {activeContactData && (
            <div className="chat-header">
              <div className="chat-user">
                <img 
                  src={activeContactData.avatar} 
                  alt={activeContactData.name} 
                  className="chat-avatar"
                />
                <div>
                  <div className="font-medium">{activeContactData.name}</div>
                  {activeContactData.online ? (
                    <div className="chat-user-status">Online</div>
                  ) : (
                    <div className="text-sm text-gray-500">Last seen: {activeContactData.time}</div>
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
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date} className="message-group">
                <div className="text-center mb-4">
                  <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">
                    {date}
                  </span>
                </div>
                
                {dateMessages.map(message => (
                  <div 
                    key={message.id}
                    className={`flex mb-4 ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.senderId !== 'me' && (
                      <img 
                        src={activeContactData?.avatar} 
                        alt={activeContactData?.name}
                        className="w-8 h-8 rounded-full mr-2 self-end"
                      />
                    )}
                    
                    <div className={`message-bubble ${message.senderId === 'me' ? 'message-outgoing' : 'message-incoming'}`}>
                      {message.text}
                      <div className="message-time">{message.time}</div>
                    </div>
                    
                    {message.senderId === 'me' && (
                      <img 
                        src="https://i.pravatar.cc/150?img=68" 
                        alt="Me"
                        className="w-8 h-8 rounded-full ml-2 self-end"
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
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
              />
              
              <button 
                type="submit" 
                className="message-send-button"
                disabled={!messageInput.trim()}
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