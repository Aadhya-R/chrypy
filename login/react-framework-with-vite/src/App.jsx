import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Welcome from './Welcome';

const API_URL = 'http://localhost:8000';

// InputField component with ref forwarding for form handling
const InputField = React.forwardRef(({ type, placeholder, icon, name, onChange, value, error }, ref) => {
  const [isPasswordShown, setIsPasswordShown] = useState(false);

  return (
    <div className="input-wrapper">
      <input
        ref={ref}
        type={isPasswordShown ? 'text' : type}
        name={name}
        placeholder={placeholder}
        className={`input-field ${error ? 'error' : ''}`}
        onChange={onChange}
        value={value}
        required
      />
      <i className="material-symbols-rounded">{icon}</i>
      {type === 'password' && (
        <i 
          onClick={() => setIsPasswordShown(prevState => !prevState)} 
          className="material-symbols-rounded eye-icon"
          style={{ cursor: 'pointer' }}
        >
          {isPasswordShown ? 'visibility' : 'visibility_off'}
        </i>
      )}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
});

const SocialLogin1 = () => {
  return (
    <div className="social-login">
      <button type="button" className="social-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M12.24 10.285V14.45h6.874c-.292 1.344-1.636 4.148-6.721 4.148-4.148 0-7.5-3.351-7.5-7.5s3.351-7.5 7.5-7.5c2.257 0 3.633.954 4.542 1.815l3.221-3.221C18.675 1.54 15.658 0 12.24 0c-6.671 0-12.083 5.412-12.083 12.083s5.412 12.083 12.083 12.083c6.918 0 11.666-4.992 11.666-11.758 0-.82-.12-1.554-.282-2.323H12.24zm0 0" />
        </svg>
        Google
      </button>
      <button type="button" className="social-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M21.5 14.5c.5-.7 1.3-1.2 2.5-1.2 0-2.5-2.2-4.1-4.9-4.2-2.3 0-4.1 1.2-5.1 1.2s-2.7-1.2-5.1-1.2c-2.7 0-4.5 1.7-4.9 4.2-.7 0-1.2.7-1.2 1.2s.5 1.2 1.2 1.2h.1c.3 1.5 1.5 3.3 3.6 3.3 2.1 0 3.4-1.8 5.4-1.8s3.3 1.8 5.4 1.8c2.1 0 3.3-1.8 3.6-3.3h.1c.7 0 1.2-.5 1.2-1.2s-.5-1.2-1.2-1.2zm-10.8-6.1c.9-1.2 2.3-2 4-2s3.1.8 4 2c-.9 0-2.3.6-4 1.4s-3.1-1-4-1.4z" />
        </svg>
        Apple
      </button>
    </div>
  );
};

const AuthWrapper = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('access_token');
  });
  
  return (
    <Routes>
      <Route path="/welcome" element={isLoggedIn ? <Welcome user={JSON.parse(localStorage.getItem('user'))} /> : <Navigate to="/" />} />
      <Route path="/" element={!isLoggedIn ? <AuthForm /> : <Navigate to="/welcome" />} />
    </Routes>
  );
};

const AuthForm = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('access_token');
    if (token) {
      navigate('/welcome');
    }
  }, [navigate]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!isLogin) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.username.trim()) newErrors.username = 'Username is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setApiMessage({ type: '', text: '' });

    try {
      if (isLogin) {
        // Handle login
        const response = await axios.post(
          `${API_URL}/token`,
          new URLSearchParams({
            username: formData.username || formData.email, // Allow login with either username or email
            password: formData.password,
            grant_type: 'password',
            client_id: 'test',
            client_secret: 'test'
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );

        const { access_token, refresh_token } = response.data;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        
        // Get user data
        const userResponse = await axios.get(`${API_URL}/users/me`, {
          headers: { 'Authorization': `Bearer ${access_token}` }
        });
        
        localStorage.setItem('user', JSON.stringify(userResponse.data));
        window.location.href = '/welcome';
      } else {
        // Handle signup
        await axios.post(
          `${API_URL}/users/`,
          formData,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        
        // After successful signup, switch to login form and clear form
        setApiMessage({
          type: 'success',
          text: 'Account created successfully! Please log in.'
        });
        setIsLogin(true);
        setFormData({
          name: '',
          email: '',
          username: '',
          password: ''
        });
      }
    } catch (err) {
      console.error('API Error:', err.response?.data || err.message);
      setApiMessage({
        type: 'error',
        text: err.response?.data?.detail || 'An error occurred. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1 className="chyrp-title">Chyrp Lite</h1>
      <div className="login-container">
        <h2 className="form-title">{isLogin ? 'Log in with' : 'Create an account'}</h2>
        
        {apiMessage.text && (
          <div className={`api-message ${apiMessage.type}`}>
            {apiMessage.text}
          </div>
        )}
        
        <SocialLogin1 />
        <p className="separator"><span>or</span></p>

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <InputField
              type="text"
              name="name"
              placeholder="Full Name"
              icon="person"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
            />
          )}
          
          {!isLogin && (
            <InputField
              type="text"
              name="username"
              placeholder="Username"
              icon="person_outline"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
            />
          )}
          
          <InputField
            type="email"
            name="email"
            placeholder="Email address"
            icon="mail"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />
          
          <InputField
            type="password"
            name="password"
            placeholder="Password"
            icon="lock"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />

          {isLogin && (
            <a href="#" className="forgot-password-link">Forgot password?</a>
          )}
          
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        <p className="signup-prompt">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button 
            type="button" 
            className="signup-link" 
            onClick={() => {
              setIsLogin(!isLogin);
              setApiMessage({ type: '', text: '' });
              setErrors({});
            }}
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthWrapper />
    </Router>
  );
};

export default App;
