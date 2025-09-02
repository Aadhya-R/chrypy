import { useState } from 'react';
import SocialLogin1 from "./components/SocialLogin1";
import InputField from "./components/InputField";

const API_URL = 'http://localhost:8000';

const App = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
      if (isSignUp) {
        // Sign up logic
        const response = await fetch(`${API_URL}/users/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.email.split('@')[0], // Using email prefix as name
            email: formData.email,
            username: formData.email.split('@')[0] // Using email prefix as username
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Signup failed');
        }
        
        const data = await response.json();
        setMessage('Signup successful! Please log in.');
        setIsSignUp(false);
      } else {
        // Login logic
        // For now, we'll just fetch user data as a simple auth check
        const response = await fetch(`${API_URL}/users/`);
        if (!response.ok) throw new Error('Login failed');
        
        const users = await response.json();
        const user = users.find(u => u.email === formData.email);
        
        if (user) {
          setUserData(user);
          setMessage(`Welcome back, ${user.name}!`);
        } else {
          setMessage('User not found. Please sign up first.');
        }
      }
    } catch (error) {
      setMessage(error.message || 'An error occurred');
    }
  };

  return (
    <>
      <h1 className="chyrp-title">Chyrp Lite</h1>
      <div className="login-container">
        {userData ? (
          <div className="welcome-message">
            <h2>Welcome, {userData.name}!</h2>
            <p>Email: {userData.email}</p>
            <button onClick={() => setUserData(null)}>Logout</button>
          </div>
        ) : (
          <>
            <h2 className="form-title">{isSignUp ? 'Sign Up' : 'Log in with'}</h2>
            <SocialLogin1 />

            <p className="separator"><span>or</span></p>

            <form onSubmit={handleSubmit} className="login-form">
              <InputField 
                type="email" 
                name="email"
                placeholder="Email address" 
                icon="mail" 
                value={formData.email}
                onChange={handleChange}
                required
              />
              <InputField 
                type="password" 
                name="password"
                placeholder="Password" 
                icon="lock" 
                value={formData.password}
                onChange={handleChange}
                required
              />

              {!isSignUp && (
                <a href="#" className="forgot-password-link">Forgot password?</a>
              )}
              
              <button type="submit" className="login-button">
                {isSignUp ? 'Sign Up' : 'Log In'}
              </button>
            </form>

            {message && <p className="message">{message}</p>}

            <p className="signup-prompt">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <a 
                href="#" 
                className="signup-link" 
                onClick={(e) => {
                  e.preventDefault();
                  setIsSignUp(!isSignUp);
                  setMessage('');
                }}
              >
                {isSignUp ? 'Log in' : 'Sign up'}
              </a>
            </p>
          </>
        )}
      </div>
    </>
  )
}

export default App;
