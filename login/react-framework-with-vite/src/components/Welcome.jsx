import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';

const Welcome = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const timer = setTimeout(() => {
      navigate('/homepage'); // FIX: Path is lowercase
    }, 5000);

    const interval = setInterval(() => setCountdown(p => p - 1), 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [user, navigate]);

  if (!user) return <div className="loading">Loading...</div>;

  return (
    
      <div className="welcome-card">
        <h1>Welcome, {user.name}!</h1>
        <p>Redirecting in {countdown}...</p>
        <div className="user-info">
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
        <button 
          onClick={() => navigate('/homepage')} 
          className="action-button"
        >
          Go to Homepage Now
        </button>

      </div>
    
  );
};

export default Welcome;