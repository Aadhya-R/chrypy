import React from 'react';
import { useNavigate } from 'react-router-dom';

function Welcome({ user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user data from local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    // Redirect to login
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome, {user?.name || 'User'}!</h1>
        <div className="mb-6">
          <p className="text-gray-700 mb-2"><span className="font-semibold">Username:</span> {user?.username}</p>
          <p className="text-gray-700"><span className="font-semibold">Email:</span> {user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Welcome;
