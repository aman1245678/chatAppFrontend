import React from 'react';

function OnlineUsers({ onlineUsers, currentUser }) {
  return (
    <div className="online-users-section">
      <div className="sidebar-header">
        <h3>Online Users</h3>
        <span className="online-count">{onlineUsers.length}</span>
      </div>
      <div className="online-users-list">
        {onlineUsers.length === 0 ? (
          <div className="no-users">
            <p>No other users online</p>
          </div>
        ) : (
          onlineUsers.map(user => (
            <div key={user.userId} className="online-user">
              <div className="user-avatar-small">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <span className="username">{user.username}</span>
                {user.userId === currentUser.userId && (
                  <span className="you-badge">You</span>
                )}
              </div>
              <span className="online-indicator"></span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default OnlineUsers;