
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Homepage.css'; // Make sure you have this CSS file

const API_URL = 'http://localhost:8000';

const BlogPost = ({ post }) => {
    // ... (Your BlogPost component is fine)
};

const Homepage = () => {
    const [posts, setPosts] = useState([]);
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true); // Add a loading state
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                // 1. Fetch user data
                const userResponse = await axios.get(`${API_URL}/users/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const currentUser = userResponse.data;
                setUser(currentUser);

                // 2. Fetch posts for that user
                const postsResponse = await axios.get(`${API_URL}/${currentUser.username}/posts/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setPosts(postsResponse.data);

            } catch (err) {
                console.error("Error fetching homepage data:", err.response || err.message);
                setError('Failed to load data. You may be logged out.');
                // We won't redirect immediately so you can see the error message.
            } finally {
                setIsLoading(false); // Always stop loading
            }
        };

        fetchData();
    }, [navigate]);

    const handleLogout = () => {
        // ... (Your logout function is fine)
    };
    
    // Render logic based on the current state
    if (isLoading) {
        return <div className="loading-message">Loading Homepage...</div>;
    }

    if (error) {
        return <div className="api-message error">{error}</div>;
    }

    return (
        <div className="homepage-container">
            <header className="header">
                {/* ... (Your header JSX is fine) */}
            </header>
            <main className="blog-container">
                {user && (
                    <div className="welcome-message">
                        <h2>Welcome back, {user.name}!</h2>
                    </div>
                )}
                
                {posts.length > 0 ? (
                    posts.map(post => <BlogPost key={post.id} post={post} />)
                ) : (
                    <div className="no-posts-message">
                        <h3>No posts yet.</h3>
                        <p>Why not create your first one?</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Homepage;