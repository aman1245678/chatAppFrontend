import React, { useState } from 'react';
import '../styles/chat.css';

function Login({ onLogin, loading }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      if (username.length < 3) {
        setError('Username must be at least 3 characters');
        return;
      }
      if (username.length > 20) {
        setError('Username must be less than 20 characters');
        return;
      }
      setError('');
      onLogin(username.trim());
    } else {
      setError('Please enter a username');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="chat-icon">💬</div>
          <h1>Chat Application</h1>
          <p>Connect with friends in real-time</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              autoFocus
              className="username-input"
            />
          </div>
          <button type="submit" disabled={loading} className="join-btn">
            {loading ? (
              <>
                <span className="spinner"></span>
                Connecting...
              </>
            ) : (
              'Join Chat'
            )}
          </button>
          {error && <div className="error-message">{error}</div>}
        </form>
        <div className="login-footer">
          <p>Join the conversation now!</p>
        </div>
      </div>
    </div>
  );
}

export default Login;