import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';

function MessageList({ messages, currentUser }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = new Date(message.timestamp).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <div className="no-messages">
          <div className="no-messages-icon">💬</div>
          <p>WAIT</p>
          <p className="no-messages-subtitle">Be the first to start the conversation!</p>
        </div>
      ) : (
        <>
          {Object.entries(messageGroups).map(([date, dateMessages]) => (
            <div key={date}>
              <div className="date-divider">
                <span>{date}</span>
              </div>
              {dateMessages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isCurrentUser={message.userId === currentUser.userId}
                />
              ))}
            </div>
          ))}
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;