import React, { useState, useRef, useEffect } from 'react';

function MessageInput({ onSendMessage, onTyping, isConnected }) {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && isConnected) {
      onSendMessage(message);
      setMessage('');
      onTyping(false);
    }
  };

  const handleChange = (e) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    onTyping(newMessage.length > 0);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const maxLength = 500;

  return (
    <form className="message-input-form" onSubmit={handleSubmit}>
      <div className="input-container">
        <input
          ref={inputRef}
          type="text"
          placeholder={isConnected ? "Type a message..." : "Connecting..."}
          value={message}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          className="message-input"
          disabled={!isConnected}
          maxLength={maxLength}
        />
        <button 
          type="submit" 
          className={`send-button ${!message.trim() || !isConnected ? 'disabled' : ''}`}
          disabled={!message.trim() || !isConnected}
        >
          <span>YOOY</span>
          Send
        </button>
      </div>
      <div className="input-hint">
        {message.length > 0 && <span>{message.length}/{maxLength}</span>}
        <span>Press Enter to send</span>
      </div>
    </form>
  );
}

export default MessageInput;