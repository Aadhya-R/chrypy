import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Welcome.css';

const Welcome = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:8000/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // If there's an error (e.g., token expired), redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    // Call logout API
    axios.post('http://localhost:8000/logout');
    
    // Redirect to login
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="welcome-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <h1>Welcome, {user?.name || 'User'}!</h1>
        <p>You have successfully logged in to Chrypy Lite.</p>
        <div className="user-info">
          <p><strong>Username:</strong> {user?.username}</p>
          <p><strong>Email:</strong> {user?.email}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="logout-button"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Welcome;
