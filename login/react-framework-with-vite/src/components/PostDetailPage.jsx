import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

const PostDetailPage = () => {
    const [post, setPost] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { postId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPost = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/');
                return;
            }

            try {
                const response = await axios.get(`${API_URL}/posts/${postId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setPost(response.data);
            } catch (err) {
                setError('Could not fetch post. It may have been deleted or does not exist.');
            } finally {
                setIsLoading(false);
            }
        };

        if (postId) {
            fetchPost();
        }
    }, [postId, navigate]);

    if (isLoading) {
        return <div className="loading-message">Loading post...</div>;
    }

    if (error) {
        return <div className="api-message error">{error} <Link to="/homepage" className="back-button" style={{marginTop: '15px'}}>Go Back</Link></div>;
    }

    if (!post) {
        return <div>Post not found.</div>;
    }

    return (
        <div className="post-detail-container">
            <h1 className="post-detail-title">{post.title}</h1>
            <p className="post-meta">
                Published on: {new Date(post.createtime).toLocaleDateString()}
            </p>
            <div className="post-detail-content">
                <p style={{ whiteSpace: 'pre-wrap' }}>{post.content}</p>
            </div>
            <Link to="/homepage" className="back-button">← Back to All Posts</Link>
        </div>
    );
};

export default PostDetailPage;