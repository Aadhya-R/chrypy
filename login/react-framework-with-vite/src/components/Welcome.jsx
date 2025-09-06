import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Welcome.css';
import './Homepage.css';

const API_URL = 'http://localhost:8000';

// This is the component for the image-and-title tiles
const BlogPostTile = ({ post, onPostSelect }) => (
  <div onClick={() => onPostSelect(post)} className="blog-post-tile">
    <img src={`${API_URL}${post.cover_image_url}`} alt={post.title} className="tile-image" />
    <div className="tile-overlay">
      <h3 className="tile-title">{post.title}</h3>
    </div>
  </div>
);

// This is the component for the full post view modal
const PostDetailModal = ({ post, onClose }) => (
  <div className="modal-backdrop" onClick={onClose}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <button onClick={onClose} className="modal-close-button">&times;</button>
      <div className="modal-media-container">
        {post.media.map(mediaItem => {
          if (mediaItem.media_type === 'image') return <img key={mediaItem.id} src={`${API_URL}${mediaItem.file_url}`} alt="Post content" />;
          if (mediaItem.media_type === 'video') return <video key={mediaItem.id} src={`${API_URL}${mediaItem.file_url}`} controls />;
          if (mediaItem.media_type === 'audio') return <audio key={mediaItem.id} src={`${API_URL}${mediaItem.file_url}`} controls />;
          return null;
        })}
      </div>
      <h1 className="modal-title">{post.title}</h1>
      <p className="modal-meta">Published on: {new Date(post.createtime).toLocaleString()}</p>
      <p className="modal-text">{post.content}</p>
    </div>
  </div>
);


function Welcome() {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [view, setView] = useState('DASHBOARD');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);

  // State for the "Create Post" form
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostFiles, setNewPostFiles] = useState([]);

  const [editPostData, setEditPostData] = useState(null);

  // State for the "Profile" form
  const [profileData, setProfileData] = useState({ name: '', username: '', email: '' });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // --- DATA FETCHING & INITIALIZATION ---
  const fetchUserPosts = async (token) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/${user.username}/posts/?t=${new Date().getTime()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPosts(response.data);
    } catch (err) {
      setError('Failed to fetch posts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token || !user) {
      navigate('/login');
      return;
    }
    setProfileData(user);
    fetchUserPosts(token);
  }, []);

  // --- HANDLER FUNCTIONS ---
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleCreatePostSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    setError('');

    const hasImage = Array.from(newPostFiles).some(file => file.type.startsWith('image/'));
    if (!hasImage) {
      setError('You must upload at least one image.');
      return;
    }

    try {
      const uploadedMediaUrls = await Promise.all(
        Array.from(newPostFiles).map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          const res = await axios.post(`${API_URL}/upload/`, formData, { headers: { 'Authorization': `Bearer ${token}` }});
          let type = 'image';
          if (file.type.startsWith('video/')) type = 'video';
          if (file.type.startsWith('audio/')) type = 'audio';
          return { file_url: res.data.file_url, media_type: type };
        })
      );

      await axios.post(`${API_URL}/${user.username}/posts/`, {
        title: newPostTitle,
        content: newPostContent,
        media_urls: uploadedMediaUrls,
      }, { headers: { 'Authorization': `Bearer ${token}` } });

      setNewPostTitle('');
      setNewPostContent('');
      setNewPostFiles([]);
      await fetchUserPosts(token);
      setView('DASHBOARD');
    } catch (err) {
      setError('Failed to create post.');
    }
  };

  const handleProfileUpdateSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    setMessage('');
    setError('');
    try {
      const response = await axios.put(`${API_URL}/users/${user.id}`, profileData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      setMessage('Profile updated successfully!');
      setIsEditingProfile(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
    }
  };

  // --- RENDER LOGIC ---

  const renderDashboard = () => (
    <div className="homepage-container">
      <header className="header">
        <h1 className="chyrp-title">Your Dashboard</h1>
        <div className="header-actions">
          <button onClick={() => { setError(''); setView('CREATE_POST'); }} className="create-post-btn">Create Post</button>
          <button onClick={() => { setError(''); setMessage(''); setView('PROFILE'); }} className="profile-circle" title="View Profile">
            <span className="material-symbols-rounded">person</span>
          </button>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>
      <main className="blog-grid-container">
        {isLoading ? (
          <div className="loading-message">Loading posts...</div>
        ) : error ? (
          <p className="api-message error">{error}</p>
        ) : posts.length > 0 ? (
          posts.map((post) => <BlogPostTile key={post.id} post={post} onPostSelect={setSelectedPost} />)
        ) : (
          <div className="no-posts-message"><h3>No posts yet.</h3></div>
        )}
      </main>
      {selectedPost && <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
    </div>
  );

  const renderCreatePostForm = () => (
    <div className="create-post-container">
      <h2 className="form-title">Create a New Post</h2>
      {error && <div className="api-message error">{error}</div>}
      <form onSubmit={handleCreatePostSubmit} className="create-post-form">
        <input type="text" placeholder="Post Title" value={newPostTitle} onChange={(e) => setNewPostTitle(e.target.value)} className="input-field-expanded" required />
        <div className="input-wrapper">
          <label>Upload Media (1 image required)</label>
          <input type="file" multiple onChange={(e) => setNewPostFiles(e.target.files)} className="file-input" accept="image/*,video/*,audio/*"/>
        </div>
        <textarea placeholder="What's on your mind?" value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} className="textarea-field" rows="8" required></textarea>
        <div className="form-actions" style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="login-button">Publish</button>
          <button type="button" onClick={() => setView('DASHBOARD')} className="back-button">Cancel</button>
        </div>
      </form>
    </div>
  );
  
  const renderProfilePage = () => (
     <div className="create-post-container">
      <h2 className="form-title">Your Profile</h2>
      {message && <div className="api-message success">{message}</div>}
      {error && <div className="api-message error">{error}</div>}
      <form onSubmit={handleProfileUpdateSubmit} className="create-post-form">
        <div className="input-wrapper"><label>Full Name</label><input type="text" name="name" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} disabled={!isEditingProfile} className="input-field-expanded" /></div>
        <div className="input-wrapper"><label>Username</label><input type="text" name="username" value={profileData.username} onChange={(e) => setProfileData({...profileData, username: e.target.value})} disabled={!isEditingProfile} className="input-field-expanded" /></div>
        <div className="input-wrapper"><label>Email</label><input type="email" name="email" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} disabled={!isEditingProfile} className="input-field-expanded" /></div>
        {isEditingProfile ? (
          <div className="form-actions" style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="login-button">Save Changes</button>
            <button type="button" className="back-button" onClick={() => { setIsEditingProfile(false); setProfileData(user); }}>Cancel</button>
          </div>
        ) : <button type="button" className="login-button" onClick={() => setIsEditingProfile(true)}>Edit Profile</button>}
      </form>
      <button onClick={() => setView('DASHBOARD')} className="back-button" style={{marginTop: '15px'}}>← Back to Dashboard</button>
    </div>
  );

  if (view === 'CREATE_POST') return renderCreatePostForm();
  if (view === 'PROFILE') return renderProfilePage();
  return renderDashboard();
}

export default Welcome;