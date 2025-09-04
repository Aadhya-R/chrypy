import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// This component represents a single blog post tile
const BlogPost = ({ post }) => {
    // Function to create a short excerpt from the post content
    const createExcerpt = (text, maxLength) => {
        if (text.length <= maxLength) {
            return text;
        }
        return text.substr(0, text.lastIndexOf(' ', maxLength)) + '...';
    };

    return (
        <div className="blog-post">
            <h3 className="post-title">{post.title}</h3>
            <p className="post-meta">
                Published on: {new Date(post.createtime).toLocaleDateString()}
            </p>
            <p className="post-excerpt">{createExcerpt(post.content, 150)}</p>
            {/* This link will eventually lead to a detailed view of the post */}
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
            const token = localStorage.getItem('accessToken');
            if (!token) {
                navigate('/login'); // Redirect to login if no token
                return;
            }

            try {
                // 1. Fetch current user's data
                const userResponse = await fetch('http://127.0.0.1:8000/users/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!userResponse.ok) {
                    throw new Error('Failed to fetch user data. Please log in again.');
                }

                const currentUser = await userResponse.json();
                setUser(currentUser);

                // 2. Fetch posts for the current user
                const postsResponse = await fetch(`http://127.0.0.1:8000/${currentUser.username}/posts/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!postsResponse.ok) {
                    throw new Error('Failed to fetch posts.');
                }
                
                const postData = await postsResponse.json();
                setPosts(postData);

            } catch (err) {
                setError(err.message);
                // If there's an auth error, clear the token and redirect
                localStorage.removeItem('accessToken');
                navigate('/login');
            }
        };

        fetchData();
    }, [navigate]);

    const handleLogout = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            await fetch('http://127.0.0.1:8000/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            // Always clear local storage and redirect
            localStorage.removeItem('accessToken');
            navigate('/login');
        }
    };

    return (
        <>
            <header className="header">
                <h1 className="chyrp-title">Chyrp</h1>
                <div className="header-actions">
                    {/* Placeholder for search functionality */}
                    <input type="search" placeholder="Search blogs..." className="input-field" style={{width: '200px'}} />

                    <Link to="/create-post">
                        <button className="create-post-btn">Create Post</button>
                    </Link>
                    
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
                
                {error && <p className="message-box error">{error}</p>}

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