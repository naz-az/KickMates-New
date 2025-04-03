import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const login = (email: string, password: string) => {
  return api.post('/users/login', { email, password });
};

export const register = (userData: {
  username: string;
  email: string;
  password: string;
  full_name?: string;
  bio?: string;
}) => {
  return api.post('/users/register', userData);
};

export const getProfile = () => {
  return api.get('/users/profile');
};

export const updateProfile = (userData: {
  full_name?: string;
  bio?: string;
  profile_image?: string;
}) => {
  return api.put('/users/profile', userData);
};

// Events API
export const getEvents = (params?: any) => {
  return api.get('/events', { params });
};

export const getEventById = (id: string) => {
  return api.get(`/events/${id}`);
};

export const createEvent = (eventData: {
  title: string;
  description?: string;
  sport_type: string;
  location: string;
  start_date: string;
  end_date: string;
  max_players: number;
  image_url?: string;
}) => {
  return api.post('/events', eventData);
};

export const updateEvent = (id: string, eventData: any) => {
  return api.put(`/events/${id}`, eventData);
};

export const deleteEvent = (id: string) => {
  return api.delete(`/events/${id}`);
};

export const joinEvent = (id: string) => {
  return api.post(`/events/${id}/join`);
};

export const leaveEvent = (id: string) => {
  return api.delete(`/events/${id}/leave`);
};

export const bookmarkEvent = (id: string) => {
  return api.post(`/events/${id}/bookmark`);
};

export const addComment = (id: string, content: string) => {
  return api.post(`/events/${id}/comments`, { content });
};

export const deleteComment = (eventId: string, commentId: string) => {
  return api.delete(`/events/${eventId}/comments/${commentId}`);
};

export const getUserEvents = () => {
  return api.get('/users/events');
};

export const getUserBookmarks = () => {
  return api.get('/users/bookmarks');
};

export default api; 