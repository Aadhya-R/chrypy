import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({ name: '', username: '', email: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/');
                return;
            }
            try {
                const response = await axios.get(`${API_URL}/users/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setUser(response.data);
                setFormData(response.data);
            } catch (err) {
                setError('Failed to fetch profile data.');
            }
        };
        fetchUser();
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        const token = localStorage.getItem('access_token');

        try {
            const response = await axios.put(
                `${API_URL}/users/${user.id}`,
                { name: formData.name, username: formData.username, email: formData.email },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
            setMessage('Profile updated successfully!');
            setIsEditing(false);

        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to update profile.');
        }
    };

    if (!user) {
        return <div className="loading-message">Loading profile...</div>;
    }

    return (
        <div className="create-post-container">
            <h2 className="form-title">Your Profile</h2>

            {error && <div className="api-message error">{error}</div>}
            {message && <div className="api-message success">{message}</div>}

            <form onSubmit={handleSubmit} className="create-post-form">
                <div className="input-wrapper">
                    <label>Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} disabled={!isEditing} className="input-field-expanded" />
                </div>
                <div className="input-wrapper">
                    <label>Username</label>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} disabled={!isEditing} className="input-field-expanded" />
                </div>
                <div className="input-wrapper">
                    <label>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={!isEditing} className="input-field-expanded" />
                </div>

                {isEditing ? (
                    <div className="form-actions" style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" className="login-button">Save Changes</button>
                        <button type="button" className="back-button" onClick={() => { setIsEditing(false); setFormData(user); }}>Cancel</button>
                    </div>
                ) : (
                    <button type="button" className="login-button" onClick={() => setIsEditing(true)}>Edit Profile</button>
                )}
            </form>
             <Link to="/homepage" className="back-button" style={{marginTop: '15px'}}>← Back to Homepage</Link>
        </div>
    );
};

export default ProfilePage;