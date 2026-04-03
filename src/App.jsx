import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Login from './components/Login';
import Chat from './components/Chat';
import './App.css';

// Get WebSocket URL with proper protocol
const getWebSocketUrl = () => {
  const wsUrl = import.meta.env.VITE_WS_URL;
  if (wsUrl) {
    // Ensure wss:// for production
    if (window.location.protocol === 'https:' && wsUrl.startsWith('ws://')) {
      return wsUrl.replace('ws://', 'wss://');
    }
    return wsUrl;
  }
  
  // Auto-detect based on current page
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  return `${protocol}//${host}`;
};

const getApiUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) return apiUrl;
  return window.location.origin;
};

const SOCKET_URL = getWebSocketUrl();
const API_URL = getApiUrl();

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      secure: true,
      rejectUnauthorized: false
    });

    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Socket connected successfully:', newSocket.id);
      setConnectionError(false);
      
      // Re-login if user exists
      const savedUser = localStorage.getItem('chatUser');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        newSocket.emit('user-login', userData);
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnectionError(true);
      
      // Fallback to polling only
      if (newSocket.io.opts.transports[0] === 'websocket') {
        newSocket.io.opts.transports = ['polling', 'websocket'];
        newSocket.connect();
      }
    });

    // Check for existing user in localStorage
    const savedUser = localStorage.getItem('chatUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      newSocket.emit('user-login', userData);
    }

    // Socket event listeners
    newSocket.on('login-success', (data) => {
      console.log('Login successful:', data);
      setLoading(false);
      setConnectionError(false);
    });

    newSocket.on('login-error', (error) => {
      console.error('Login error:', error);
      setLoading(false);
      alert(error.error);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleLogin = (username) => {
    setLoading(true);
    const userData = {
      username,
      userId: localStorage.getItem('chatUserId') || null,
    };
    socket.emit('user-login', userData);
    
    socket.once('login-success', (data) => {
      const newUser = {
        userId: data.userId,
        username: data.username,
        previousChats: data.previousChats,
      };
      setUser(newUser);
      localStorage.setItem('chatUser', JSON.stringify(newUser));
      localStorage.setItem('chatUserId', data.userId);
      setLoading(false);
    });
  };

  const handleLogout = () => {
    if (socket) {
      localStorage.removeItem('chatUser');
      localStorage.removeItem('chatUserId');
      setUser(null);
      socket.disconnect();
      socket.connect();
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} loading={loading} connectionError={connectionError} />;
  }

  return (
    <div className="app">
      <Chat socket={socket} user={user} onLogout={handleLogout} />
    </div>
  );
}

export default App;