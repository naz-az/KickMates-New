import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById, joinEvent, leaveEvent, bookmarkEvent, addComment, deleteComment } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Comment from '../components/Comment';

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [event, setEvent] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [participationStatus, setParticipationStatus] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentsSort, setCommentsSort] = useState<'newest' | 'oldest'>('newest');
  const [commentPage, setCommentPage] = useState(1);
  const commentsPerPage = 5;
  const [replyToComment, setReplyToComment] = useState<{id: number, username: string} | null>(null);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    setError(null);
    
    try {
      const response = await getEventById(id!);
      const { event, participants, comments, isBookmarked, participationStatus } = response.data;
      
      setEvent(event);
      setParticipants(participants);
      setComments(comments);
      setIsBookmarked(isBookmarked);
      setParticipationStatus(participationStatus);
    } catch (err) {
      console.error('Error fetching event details:', err);
      setError('Failed to load event details. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinEvent = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }
    
    try {
      await joinEvent(id!);
      fetchEventDetails(); // Refresh data
    } catch (err) {
      console.error('Error joining event:', err);
      setError('Failed to join event. Please try again.');
    }
  };

  const handleLeaveEvent = async () => {
    try {
      await leaveEvent(id!);
      fetchEventDetails(); // Refresh data
    } catch (err) {
      console.error('Error leaving event:', err);
      setError('Failed to leave event. Please try again.');
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }
    
    try {
      const response = await bookmarkEvent(id!);
      setIsBookmarked(response.data.bookmarked);
    } catch (err) {
      console.error('Error bookmarking event:', err);
      setError('Failed to bookmark event. Please try again.');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !commentText.trim() || isSubmittingComment) return;
    
    try {
      setIsSubmittingComment(true);
      const response = await addComment(id!, commentText);
      
      // Add the new comment to the state and reset form
      const newComment = response.data.comment;
      setComments(prevComments => [newComment, ...prevComments]);
      setCommentText('');
      setReplyToComment(null);
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('Failed to submit comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      try {
        await deleteComment(id!, commentId.toString());
      } catch (err: any) {
        console.error('Error deleting comment:', err);
        
        // If comment doesn't exist on server (404), we should still remove it from the UI
        if (err.response && err.response.status === 404) {
          console.log('Comment not found on server, but removing from UI');
        } else {
          // For other errors, alert the user and abort
          setError('Failed to delete comment. Please try again.');
          return;
        }
      }
      
      // Filter out the deleted comment and any replies to it
      const filteredComments = comments.filter(comment => {
        return comment.id !== commentId && comment.parent_comment_id !== commentId;
      });
      
      setComments(filteredComments);
      
      // If we're on a page that would now be empty, go back one page
      const maxPage = Math.ceil(filteredComments.length / commentsPerPage);
      if (commentPage > maxPage && maxPage > 0) {
        setCommentPage(maxPage);
      }
    } catch (err) {
      console.error('Unexpected error in handleDeleteComment:', err);
    }
  };

  const handleReplyToComment = (commentId: number, username: string) => {
    // We no longer need to set the replyToComment state since replies are handled inline
    // This is only kept for backwards compatibility but doesn't affect the UI
    setReplyToComment({ id: commentId, username });
  };

  const handleAddReply = async (parentCommentId: number, content: string, newComment: any = null) => {
    if (!user) return;
    
    try {
      // If we don't already have the new comment data from the reply component
      if (!newComment) {
        const response = await addComment(id!, content, parentCommentId);
        newComment = response.data.comment;
      }
      
      // Add new comment to the state
      setComments(prevComments => [newComment, ...prevComments]);
      
      // Fetch event details to properly update the nested comment structure
      fetchEventDetails();
    } catch (err) {
      console.error('Error adding reply:', err);
      setError('Failed to add reply. Please try again.');
    }
  };

  const handleVoteOnComment = (commentId: number, voteType: 'up' | 'down', newVotes: any) => {
    // Update the comments state with the new vote count
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          thumbs_up: newVotes.thumbs_up,
          thumbs_down: newVotes.thumbs_down,
          user_vote: newVotes.user_vote
        };
      }
      return comment;
    }));
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Organize comments into a hierarchical structure
  const organizeComments = (comments: any[]) => {
    const topLevelComments: any[] = [];
    const commentMap: Record<number, any> = {};
    
    // First pass: build map of comments by ID and initialize replies array
    comments.forEach(comment => {
      commentMap[comment.id] = {
        ...comment,
        replies: []
      };
    });
    
    // Second pass: organize into parent-child relationship
    comments.forEach(comment => {
      if (comment.parent_comment_id) {
        // This is a reply, add it to its parent's replies
        if (commentMap[comment.parent_comment_id]) {
          commentMap[comment.parent_comment_id].replies.push(commentMap[comment.id]);
        } else {
          // If parent doesn't exist (shouldn't happen), treat as top-level
          topLevelComments.push(commentMap[comment.id]);
        }
      } else {
        // This is a top-level comment
        topLevelComments.push(commentMap[comment.id]);
      }
    });
    
    // Sort replies by date
    Object.values(commentMap).forEach((comment: any) => {
      comment.replies.sort((a: any, b: any) => {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
    });
    
    return topLevelComments;
  };

  // Sort and paginate comments
  const sortedTopLevelComments = organizeComments([...comments].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return commentsSort === 'newest' ? dateB - dateA : dateA - dateB;
  }));

  const paginatedComments = sortedTopLevelComments.slice(
    (commentPage - 1) * commentsPerPage, 
    commentPage * commentsPerPage
  );

  const totalPages = Math.ceil(sortedTopLevelComments.length / commentsPerPage);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading event details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="error-container">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p className="mb-6 text-text-light">{error || 'Event not found'}</p>
        <button onClick={() => navigate('/events')} className="btn btn-primary">
          Back to Events
        </button>
      </div>
    );
  }

  // Default image if none provided
  const defaultImage = 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1600&q=80';

  // Calculate if event is full
  const isFull = event.current_players >= event.max_players;
  
  // Check if user is creator
  const isCreator = user && user.id === event.creator_id;
  
  // Get confirmed and waiting participants
  const confirmedParticipants = participants.filter(p => p.status === 'confirmed');
  const waitingParticipants = participants.filter(p => p.status === 'waiting');

  return (
    <div className="event-detail-page">
      <div className="event-detail-header">
        <div 
          className="event-cover-image"
          style={{ backgroundImage: `url(${event.image_url || defaultImage})` }}
        ></div>
        
        <div className="event-header-content">
          <h1 className="event-title">{event.title}</h1>
          
          <div className="event-meta">
            <div className="event-sport-type">
              <span className="label">Sport:</span>
              <span className="value sport-type">{event.sport_type}</span>
            </div>
            
            <div className="event-host">
              <span className="label">Hosted by:</span>
              <span className="value">{event.creator_name}</span>
            </div>
          </div>
          
          <div className="event-actions">
            {isCreator ? (
              <div className="creator-actions">
                <button 
                  onClick={() => navigate(`/events/${id}/edit`)}
                  className="btn btn-outline"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Event
                </button>
                <button 
                  onClick={() => navigate(`/events/${id}/delete`)}
                  className="btn-danger"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Cancel Event
                </button>
              </div>
            ) : participationStatus ? (
              <button 
                onClick={handleLeaveEvent}
                className="btn btn-outline leave-btn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {participationStatus === 'confirmed' ? 'Leave Event' : 'Leave Waiting List'}
              </button>
            ) : (
              <button 
                onClick={handleJoinEvent}
                className="btn btn-primary join-btn"
                disabled={isFull && user}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                {isFull ? 'Join Waiting List' : 'Join Event'}
              </button>
            )}
            
            <button 
              onClick={handleBookmark}
              className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
              aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
            >
              {isBookmarked ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                  </svg>
                  Bookmarked
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Bookmark
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <div className="event-detail-content">
        <div className="event-main-content">
          <div className="event-details-card">
            <h3>Event Details</h3>
            
            <div className="detail-item">
              <span className="detail-icon">📍</span>
              <div className="detail-content">
                <span className="detail-label">Location</span>
                <span className="detail-value">{event.location}</span>
              </div>
            </div>
            
            <div className="detail-item">
              <span className="detail-icon">📅</span>
              <div className="detail-content">
                <span className="detail-label">Date</span>
                <span className="detail-value">{formatDate(event.start_date)}</span>
              </div>
            </div>
            
            <div className="detail-item">
              <span className="detail-icon">🕒</span>
              <div className="detail-content">
                <span className="detail-label">Time</span>
                <span className="detail-value">
                  {formatTime(event.start_date)} - {formatTime(event.end_date)}
                </span>
              </div>
            </div>
            
            <div className="detail-item">
              <span className="detail-icon">👥</span>
              <div className="detail-content">
                <span className="detail-label">Participants</span>
                <span className="detail-value">
                  <span className={event.current_players >= event.max_players ? 'text-error' : 'text-success'}>
                    {event.current_players}/{event.max_players}
                  </span> participants
                </span>
              </div>
            </div>
            
            <div className="event-description">
              <h4>Description</h4>
              <p className="whitespace-pre-line">{event.description || 'No description provided.'}</p>
            </div>
          </div>
          
          <div className="event-comments-section">
            <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-3">
              <h3 className="flex items-center text-xl font-bold m-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 inline text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Comments {comments.length > 0 && `(${comments.length})`}
              </h3>
              
              {comments.length > 0 && (
                <div className="flex items-center gap-3">
                  <label htmlFor="comments-sort" className="text-sm text-text-light">
                    Sort by:
                  </label>
                  <select 
                    id="comments-sort" 
                    className="text-sm p-1 border border-gray-200 rounded"
                    value={commentsSort}
                    onChange={(e) => setCommentsSort(e.target.value as 'newest' | 'oldest')}
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                  </select>
                </div>
              )}
            </div>
            
            {user ? (
              <form className="comment-form" onSubmit={handleCommentSubmit}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="shrink-0">
                    <img 
                      src={user.profile_image || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=100&q=80'} 
                      alt={user.username} 
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  </div>
                  <div className="flex-grow">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      rows={3}
                      required
                      disabled={isSubmittingComment}
                      className="w-full"
                    />
                    <div className="flex justify-end mt-2">
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={isSubmittingComment || !commentText.trim()}
                      >
                        {isSubmittingComment ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Posting...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Post Comment
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="login-prompt">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto mb-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <p>Please <a onClick={() => navigate('/login', { state: { from: `/events/${id}` } })} className="font-medium">login</a> to leave a comment.</p>
              </div>
            )}
            
            {comments.length > 0 ? (
              <>
                <div className="comments-list">
                  {paginatedComments.map((comment) => (
                    <Comment 
                      key={comment.id} 
                      comment={comment} 
                      onDelete={handleDeleteComment}
                      onReply={handleReplyToComment}
                      onAddReply={handleAddReply}
                      onVote={handleVoteOnComment}
                      eventCreatorId={event.creator_id}
                      replies={comment.replies}
                      eventId={id!}
                    />
                  ))}
                </div>
                
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => setCommentPage(page => Math.max(page - 1, 1))}
                      disabled={commentPage === 1}
                      className="p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                      aria-label="Previous page"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <span className="text-sm text-text-light">
                      Page {commentPage} of {totalPages}
                    </span>
                    
                    <button 
                      onClick={() => setCommentPage(page => Math.min(page + 1, totalPages))}
                      disabled={commentPage === totalPages}
                      className="p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                      aria-label="Next page"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="no-comments">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="event-sidebar">
          <div className="participants-card">
            <h3>Participants ({confirmedParticipants.length}/{event.max_players})</h3>
            
            <div className="participants-list">
              {confirmedParticipants.length > 0 ? (
                confirmedParticipants.map((participant) => (
                  <div key={participant.id} className="participant">
                    <img 
                      src={participant.profile_image || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=100&q=80'} 
                      alt={participant.username} 
                      className="participant-avatar"
                    />
                    <span className="participant-name">{participant.username}</span>
                  </div>
                ))
              ) : (
                <p className="text-text-light text-center py-2">No participants yet</p>
              )}
            </div>
            
            {waitingParticipants.length > 0 && (
              <>
                <h4>Waiting List ({waitingParticipants.length})</h4>
                <div className="waiting-list">
                  {waitingParticipants.map((participant) => (
                    <div key={participant.id} className="participant waiting">
                      <img 
                        src={participant.profile_image || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=100&q=80'} 
                        alt={participant.username} 
                        className="participant-avatar"
                      />
                      <span className="participant-name">{participant.username}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage; 