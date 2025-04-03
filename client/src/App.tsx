import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import CreateEventPage from './pages/CreateEventPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthContext } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import MessagesPage from './pages/MessagesPage';

// Import CSS files removed - using Tailwind

const App = () => {
  // State for user authentication - initialize with mock user for testing
  const [user, setUser] = useState({
    id: 1,
    username: 'testuser',
    name: 'Test User',
    email: 'test@example.com',
    avatar: 'https://i.pravatar.cc/150?img=68'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for sidebar collapse
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Check if user is logged in on app load - commented out for testing
  /*
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        setIsLoading(true);
        
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        // If no token, user is not logged in
        if (!token) {
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        // Fetch user data from backend
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/user`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // If response is not ok, token is invalid
        if (!response.ok) {
          localStorage.removeItem('token');
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        // Parse user data from response
        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        console.error('Authentication check failed:', err);
        setError('Failed to check authentication status');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkLoginStatus();
  }, []);
  */
  
  // Handle user login
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock login for testing
      setUser({
        id: 1,
        username: 'testuser',
        name: 'Test User',
        email: email,
        avatar: 'https://i.pravatar.cc/150?img=68'
      });
      
      return { success: true };
      
      /* Real implementation
      // Send login request to backend
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      // Parse response data
      const data = await response.json();
      
      // If response is not ok, throw error with message
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Save token to localStorage
      localStorage.setItem('token', data.token);
      
      // Set user data from response
      setUser(data.user);
      
      return data;
      */
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle user registration
  const register = async (userData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock registration for testing
      setUser({
        id: 1,
        username: userData.username || 'testuser',
        name: userData.full_name || 'Test User',
        email: userData.email,
        avatar: 'https://i.pravatar.cc/150?img=68'
      });
      
      return { success: true };
      
      /* Real implementation
      // Send registration request to backend
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      // Parse response data
      const data = await response.json();
      
      // If response is not ok, throw error with message
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Save token to localStorage
      localStorage.setItem('token', data.token);
      
      // Set user data from response
      setUser(data.user);
      
      return data;
      */
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle user logout
  const logout = () => {
    // Clear token from localStorage
    localStorage.removeItem('token');
    // Set a mock user for testing instead of clearing
    // setUser(null);
  };
  
  // Create auth context value
  const authContextValue = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError: () => setError(null)
  };
  
  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <ErrorBoundary>
      <AuthContext.Provider value={authContextValue}>
        <Router>
          <div className="app-container">
            <Sidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
            <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
              <TopNavbar sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
              <div className="main-content-inner">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/events/:id" element={<EventDetailPage />} />
                  <Route 
                    path="/events/create" 
                    element={
                      <ProtectedRoute>
                        <CreateEventPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/messages" 
                    element={
                      <ProtectedRoute>
                        <MessagesPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/settings" 
                    element={
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                </Routes>
              </div>
            </div>
          </div>
        </Router>
      </AuthContext.Provider>
    </ErrorBoundary>
  );
};

export default App;