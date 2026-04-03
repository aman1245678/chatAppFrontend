import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get user chats
export const getUserChats = async (userId) => {
  try {
    const response = await api.get(`/api/chats/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user chats:', error);
    throw error;
  }
};

// Clear user chats
export const clearUserChats = async (userId) => {
  try {
    const response = await api.delete(`/api/chats/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error clearing user chats:', error);
    throw error;
  }
};

// Get recent messages
export const getRecentMessages = async (userId, limit = 50) => {
  try {
    const response = await api.get(`/api/chats/${userId}/recent/${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent messages:', error);
    throw error;
  }
};

// Search messages
export const searchMessages = async (userId, query) => {
  try {
    const response = await api.get(`/api/chats/${userId}/search`, {
      params: { q: query },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching messages:', error);
    throw error;
  }
};

// Get message statistics
export const getMessageStats = async (userId) => {
  try {
    const response = await api.get(`/api/chats/${userId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching message stats:', error);
    throw error;
  }
};

// Delete specific message
export const deleteMessage = async (userId, messageId) => {
  try {
    const response = await api.delete(`/api/chats/${userId}/message/${messageId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

// Edit message
export const editMessage = async (userId, messageId, text) => {
  try {
    const response = await api.put(`/api/chats/${userId}/message/${messageId}`, { text });
    return response.data;
  } catch (error) {
    console.error('Error editing message:', error);
    throw error;
  }
};

// Export chat history
export const exportChatHistory = async (userId) => {
  try {
    const response = await api.get(`/api/chats/${userId}/export`);
    return response.data;
  } catch (error) {
    console.error('Error exporting chat history:', error);
    throw error;
  }
};

// Get online users
export const getOnlineUsers = async () => {
  try {
    const response = await api.get('/api/online-users');
    return response.data;
  } catch (error) {
    console.error('Error fetching online users:', error);
    throw error;
  }
};

export default api;