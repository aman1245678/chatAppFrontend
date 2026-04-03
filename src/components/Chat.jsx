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
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // Load previous messages
    if (user.previousChats) {
      setMessages(user.previousChats);
    }

    // Socket event listeners
    socket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('online-users', (users) => {
      setOnlineUsers(users);
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
      socket.off('disconnect');
      socket.off('connect');
    };
  }, [socket, user]);

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
        }
      } catch (error) {
        console.error('Error clearing chat history:', error);
      }
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="user-info">
          <div className="avatar">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2>Welcome, {user.username}!</h2>
            <div className="connection-status">
              <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
              <span>{isConnected ? 'Connected' : 'Reconnecting...'}</span>
            </div>
          </div>
        </div>
        <div className="header-buttons">
          <button onClick={clearChatHistory} className="clear-btn" title="Clear chat history">
             Clear History
          </button>
          <button onClick={onLogout} className="logout-btn" title="Logout">
             Logout
          </button>
        </div>
      </div>
      
      <div className="chat-main">
        <OnlineUsers onlineUsers={onlineUsers} currentUser={user} />
        
        <div className="chat-area">
          <MessageList messages={messages} currentUser={user} />
          {typingText && <div className="typing-indicator">{typingText}</div>}
          <MessageInput 
            onSendMessage={sendMessage} 
            onTyping={handleTyping}
            isConnected={isConnected}
          />
        </div>
      </div>
    </div>
  );
}

export default Chat;