import React from 'react';

function MessageBubble({ message, isCurrentUser }) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (username) => {
    return username.charAt(0).toUpperCase();
  };

  return (
    <div className={`message-bubble ${isCurrentUser ? 'sent' : 'received'}`}>
      {!isCurrentUser && (
        <div className="message-avatar">
          {getInitials(message.username)}
        </div>
      )}
      <div className="message-wrapper">
        {!isCurrentUser && (
          <div className="message-sender">{message.username}</div>
        )}
        <div className="message-content">
          <div className="message-text">{message.text}</div>
          <div className="message-time">{formatTime(message.timestamp)}</div>
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;