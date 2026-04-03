import React, { useState, useEffect, useRef } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import OnlineUsers from './OnlineUsers';
import '../styles/chat.css';

function Chat({ socket, user, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [showOnlineUsers, setShowOnlineUsers] = useState(true);
  const [groupInfo, setGroupInfo] = useState({
    name: "General Chat",
    description: "Welcome to the group! Be respectful and have fun!",
    memberCount: 0,
    totalMessages: 0
  });
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // Load previous messages
    if (user.previousChats) {
      setMessages(user.previousChats);
      setGroupInfo(prev => ({ ...prev, totalMessages: user.previousChats.length }));
    }

    // Socket event listeners
    socket.on('new-message', (message) => {
      setMessages(prev => {
        const newMessages = [...prev, message];
        setGroupInfo(prevInfo => ({ ...prevInfo, totalMessages: newMessages.length }));
        return newMessages;
      });
    });

    socket.on('online-users', (users) => {
      setOnlineUsers(users);
      setGroupInfo(prev => ({ ...prev, memberCount: users.length }));
    });

    socket.on('user-typing', ({ userId, username, isTyping }) => {
      if (userId !== user.userId) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          if (isTyping) {
            newSet.add(username);
          } else {
            newSet.delete(username);
          }
          return newSet;
        });
      }
    });

    socket.on('user-joined', ({ username }) => {
      // Show temporary notification
      showNotification(`${username} joined the chat`, 'join');
    });

    socket.on('user-left', ({ username }) => {
      showNotification(`${username} left the chat`, 'leave');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('user-login', user);
    });

    return () => {
      socket.off('new-message');
      socket.off('online-users');
      socket.off('user-typing');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('disconnect');
      socket.off('connect');
    };
  }, [socket, user]);

  const showNotification = (message, type) => {
    const notificationDiv = document.createElement('div');
    notificationDiv.className = `notification ${type}`;
    notificationDiv.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${type === 'join' ? '👋' : '👋'}</span>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(notificationDiv);
    setTimeout(() => notificationDiv.remove(), 3000);
  };

  const sendMessage = (text) => {
    if (text.trim() && isConnected) {
      const messageData = {
        userId: user.userId,
        username: user.username,
        text: text.trim(),
        timestamp: new Date().toISOString(),
      };
      socket.emit('send-message', messageData);
    }
  };

  const handleTyping = (isTypingNow) => {
    if (!isConnected) return;
    
    if (isTypingNow && !isTyping) {
      setIsTyping(true);
      socket.emit('typing-start', {
        userId: user.userId,
        username: user.username,
      });
    } else if (!isTypingNow && isTyping) {
      setIsTyping(false);
      socket.emit('typing-end', {
        userId: user.userId,
        username: user.username,
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (isTypingNow) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socket.emit('typing-end', {
          userId: user.userId,
          username: user.username,
        });
      }, 1000);
    }
  };

  const typingText = typingUsers.size > 0 
    ? `${Array.from(typingUsers).join(', ')} ${typingUsers.size === 1 ? 'is' : 'are'} typing...`
    : '';

  const clearChatHistory = async () => {
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      try {
        const response = await fetch(`/api/chats/${user.userId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setMessages([]);
          setGroupInfo(prev => ({ ...prev, totalMessages: 0 }));
        }
      } catch (error) {
        console.error('Error clearing chat history:', error);
      }
    }
  };

  const getActiveUsersCount = () => {
    return onlineUsers.length;
  };

  const getMessagesToday = () => {
    const today = new Date().toDateString();
    return messages.filter(msg => new Date(msg.timestamp).toDateString() === today).length;
  };

  return (
    <div className="chat-container">
      {/* Enhanced Group Chat Header */}
      <div className="chat-header">
        <div className="header-left">
          <div className="group-avatar">
            <div className="group-avatar-icon">👥</div>
            <div className="online-indicator-large"></div>
          </div>
          <div className="group-details">
            <h1 className="group-name">
              {groupInfo.name}
              <span className="group-badge">GROUP CHAT</span>
            </h1>
            <p className="group-description">{groupInfo.description}</p>
            <div className="group-stats">
              <div className="stat">
                <span className="stat-icon">👥</span>
                <span className="stat-value">{getActiveUsersCount()}</span>
                <span className="stat-label">Online</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-icon">💬</span>
                <span className="stat-value">{groupInfo.totalMessages}</span>
                <span className="stat-label">Messages</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-icon">📅</span>
                <span className="stat-value">{getMessagesToday()}</span>
                <span className="stat-label">Today</span>
              </div>
            </div>
          </div>
        </div>

        <div className="header-right">
          <div className="connection-status-header">
            <div className={`connection-dot ${isConnected ? 'connected' : 'disconnected'}`}></div>
            <span className="connection-text">{isConnected ? 'Live' : 'Reconnecting...'}</span>
          </div>
          
          <button 
            className="toggle-sidebar-btn"
            onClick={() => setShowOnlineUsers(!showOnlineUsers)}
            title="Toggle online users"
          >
            {showOnlineUsers ? '→' : '←'}
          </button>

          <div className="header-actions">
            <button onClick={clearChatHistory} className="action-btn clear-btn" title="Clear history">
              <span>🗑️</span>
              <span className="btn-text">Clear</span>
            </button>
            <button onClick={onLogout} className="action-btn logout-btn" title="Logout">
              <span>🚪</span>
              <span className="btn-text">Leave</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Speakers / Top Contributors Section */}
      <div className="active-speakers">
        <div className="speakers-header">
          <span className="speakers-icon">🎙️</span>
          <span className="speakers-title">Active Now</span>
        </div>
        <div className="speakers-list">
          {onlineUsers.slice(0, 5).map((user, index) => (
            <div key={user.userId} className="speaker-item">
              <div className="speaker-avatar">
                {user.username.charAt(0).toUpperCase()}
                <span className="speaker-active-dot"></span>
              </div>
              <span className="speaker-name">{user.username}</span>
            </div>
          ))}
          {onlineUsers.length > 5 && (
            <div className="speaker-more">
              +{onlineUsers.length - 5} more
            </div>
          )}
        </div>
      </div>
      
      <div className="chat-main">
        {showOnlineUsers && (
          <div className="sidebar">
            <OnlineUsers onlineUsers={onlineUsers} currentUser={user} />
          </div>
        )}
        
        <div className={`chat-area ${!showOnlineUsers ? 'full-width' : ''}`}>
          <MessageList messages={messages} currentUser={user} />
          {typingText && <div className="typing-indicator">{typingText}</div>}
          <MessageInput 
            onSendMessage={sendMessage} 
            onTyping={handleTyping}
            isConnected={isConnected}
            groupName={groupInfo.name}
          />
        </div>
      </div>
    </div>
  );
}

export default Chat;