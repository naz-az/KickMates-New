import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../services/api';

const CreateEventPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sport_type: '',
    location: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    max_players: 10,
    image_url: ''
  });
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseInt(value) || 0
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    // Validate form
    if (!formData.title || !formData.sport_type || !formData.location || !formData.start_date || !formData.end_date) {
      setError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }
    
    if (formData.max_players < 2) {
      setError('Event must allow at least 2 players');
      setIsSubmitting(false);
      return;
    }
    
    // Combine date and time for start and end
    const start_datetime = `${formData.start_date}T${formData.start_time}:00`;
    const end_datetime = `${formData.end_date}T${formData.end_time}:00`;
    
    // Check if end date is after start date
    if (new Date(end_datetime) <= new Date(start_datetime)) {
      setError('End date and time must be after start date and time');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        sport_type: formData.sport_type,
        location: formData.location,
        start_date: start_datetime,
        end_date: end_datetime,
        max_players: formData.max_players,
        image_url: formData.image_url
      };
      
      const response = await createEvent(eventData);
      navigate(`/events/${response.data.event.id}`);
    } catch (err: any) {
      console.error('Error creating event:', err);
      setError(err.response?.data?.message || 'Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sportTypes = [
    'Football',
    'Basketball',
    'Tennis',
    'Volleyball',
    'Swimming',
    'Running',
    'Cycling',
    'Yoga',
    'Hiking',
    'Golf',
    'Badminton',
    'Table Tennis',
    'Cricket',
    'Rugby',
    'Other'
  ];

  return (
    <div className="create-event-page">
      <div className="page-header">
        <h1>Create a New Event</h1>
        <p>Host your own sports event and find players to join you</p>
      </div>
      
      <div className="create-event-container">
        {error && <div className="error-message">{error}</div>}
        
        <form className="create-event-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label htmlFor="title">Event Title*</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="E.g., Weekend Football Match"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="sport_type">Sport Type*</label>
              <select
                id="sport_type"
                name="sport_type"
                value={formData.sport_type}
                onChange={handleChange}
                required
              >
                <option value="">Select a sport</option>
                {sportTypes.map((sport) => (
                  <option key={sport} value={sport}>
                    {sport}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your event, rules, requirements, etc."
                rows={4}
              />
            </div>
          </div>
          
          <div className="form-section">
            <h3>Location & Time</h3>
            
            <div className="form-group">
              <label htmlFor="location">Location*</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="E.g., Central Park, New York"
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="start_date">Start Date*</label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="start_time">Start Time*</label>
                <input
                  type="time"
                  id="start_time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="end_date">End Date*</label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="end_time">End Time*</label>
                <input
                  type="time"
                  id="end_time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h3>Event Details</h3>
            
            <div className="form-group">
              <label htmlFor="max_players">Maximum Participants*</label>
              <input
                type="number"
                id="max_players"
                name="max_players"
                value={formData.max_players}
                onChange={handleNumberChange}
                min="2"
                max="100"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="image_url">Image URL</label>
              <input
                type="url"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
              <small>Provide a URL to an image for your event. Leave blank for default image.</small>
            </div>
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Event...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventPage; 