import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

interface CommentProps {
  comment: {
    id: number;
    content: string;
    created_at: string;
    user_id: number;
    username: string;
    profile_image?: string;
  };
  onDelete: (commentId: number) => void;
  eventCreatorId?: number;
}

const Comment = ({ comment, onDelete, eventCreatorId }: CommentProps) => {
  const { user } = useContext(AuthContext);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) {
      // Less than 1 day, show "Today at HH:MM"
      return `Today at ${date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    } else if (diffDays < 2) {
      // Less than 2 days, show "Yesterday at HH:MM"
      return `Yesterday at ${date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    } else {
      // More than 2 days, show full date
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Determine if user can delete the comment
  const canDelete = user && (user.id === comment.user_id || user.id === eventCreatorId);

  // Default image if none provided
  const defaultImage = 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=100&q=80';

  return (
    <div className="comment">
      <div className="comment-avatar">
        <img 
          src={comment.profile_image || defaultImage} 
          alt={comment.username} 
        />
      </div>
      
      <div className="comment-content">
        <div className="comment-header">
          <h4 className="comment-username">{comment.username}</h4>
          <span className="comment-date">{formatDate(comment.created_at)}</span>
        </div>
        
        <p className="comment-text">{comment.content}</p>
      </div>
      
      {canDelete && (
        <button 
          className="delete-comment" 
          onClick={() => onDelete(comment.id)}
          aria-label="Delete comment"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Comment;
