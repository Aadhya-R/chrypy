import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

const CreatePost = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // Fetch the current user's data when the component loads
    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/'); // Redirect to login if not authenticated
                return;
            }
            try {
                const response = await axios.get(`${API_URL}/users/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setUser(response.data);
            } catch (err) {
                setError('Failed to fetch user data. Please log in again.');
                localStorage.clear();
                navigate('/');
            }
        };
        fetchUser();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        const token = localStorage.getItem('access_token');
        if (!title || !content || !user) {
            setError('Title and content are required.');
            return;
        }

        try {
            // Your backend endpoint to create a post is /{user_name}/posts/
            await axios.post(
                `${API_URL}/${user.username}/posts/`,
                { title, content },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            setMessage('Post created successfully! Redirecting...');

            // Redirect to homepage after a short delay
            setTimeout(() => {
                navigate('/homepage');
            }, 2000);

        } catch (err) {
            const errorDetail = err.response?.data?.detail || 'Failed to create post. Please try again.';
            setError(errorDetail);
        }
    };

    return (
        <div className="create-post-container">
            <h2 className="form-title">Create a New Post</h2>
            
            {error && <div className="api-message error">{error}</div>}
            {message && <div className="api-message success">{message}</div>}

            <form onSubmit={handleSubmit} className="create-post-form">
                <input
                    type="text"
                    placeholder="Post Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field-expanded"
                    required
                />
                <textarea
                    placeholder="What's on your mind?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="textarea-field"
                    rows="10"
                    required
                ></textarea>
                <div className="form-actions" style={{ display: 'flex', gap: '10px', width: '100%' }}>
                    <button type="submit" className="login-button" style={{ flex: 1 }}>Publish Post</button>
                    <Link to="/homepage" className="back-button" style={{ flex: 0.5, textDecoration: 'none', display: 'grid', placeItems: 'center' }}>
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default CreatePost;