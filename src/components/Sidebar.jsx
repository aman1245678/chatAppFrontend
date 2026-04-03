import React from 'react';
import OnlineUsers from './OnlineUsers';

function Sidebar({ onlineUsers, currentUser }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Chat Room</h3>
      </div>
      <OnlineUsers onlineUsers={onlineUsers} currentUser={currentUser} />
    </div>
  );
}

export default Sidebar;