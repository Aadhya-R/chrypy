import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

const BlogPost = ({ post }) => {
    const createExcerpt = (text, maxLength = 150) => {
        if (!text || text.length <= maxLength) return text;
        return text.substr(0, text.lastIndexOf(' ', maxLength)) + '...';
    };

    return (
        <div className="blog-post">
            <h3 className="post-title">{post.title}</h3>
            <p className="post-meta">
                Published on: {new Date(post.createtime).toLocaleDateString()}
            </p>
            <p className="post-excerpt">{createExcerpt(post.content)}</p>
            <Link to={`/posts/${post.id}`} className="read-more-link">Read More</Link>
        </div>
    );
};

const Homepage = () => {
    const [posts, setPosts] = useState([]);
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/');
                return;
            }

            try {
                const userResponse = await axios.get(`${API_URL}/users/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const currentUser = userResponse.data;
                setUser(currentUser);

                const postsResponse = await axios.get(`${API_URL}/${currentUser.username}/posts/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setPosts(postsResponse.data);

            } catch (err) {
                setError('Failed to load data. Please log in again.');
                localStorage.clear();
                navigate('/');
            }
        };

        fetchData();
    }, [navigate]);

    const handleLogout = async () => {
        const token = localStorage.getItem('access_token');
        try {
            await axios.post(`${API_URL}/logout`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Logout failed on the backend, but proceeding.", error);
        } finally {
            localStorage.clear();
            navigate('/');
        }
    };

    return (
        <>
            <header className="header">
                <h1 className="chyrp-title">Chyrp</h1>
                <div className="header-actions">
                    <input type="search" placeholder="Search..." className="input-field" style={{width: '200px', paddingLeft: '15px'}} />
                    <Link to="/create-post"><button className="create-post-btn">Create Post</button></Link>
                    <Link to="/profile">
                        <div className="profile-circle" title="View Profile">
                            <span className="material-symbols-rounded">person</span>
                        </div>
                    </Link>
                    <button onClick={handleLogout} className="logout-button">Logout</button>
                </div>
            </header>

            <main className="blog-container">
                {user && (
                    <div className="welcome-message">
                        <h2>Welcome back, {user.name}!</h2>
                    </div>
                )}
                
                {error && <p className="api-message error">{error}</p>}

                {posts.length > 0 ? (
                    posts.map(post => <BlogPost key={post.id} post={post} />)
                ) : (
                    <div className="no-posts-message">
                        <h3>No posts yet.</h3>
                        <p>Why not create your first one?</p>
                    </div>
                )}
            </main>
        </>
    );
};

export default Homepage;