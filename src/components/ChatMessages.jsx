import React from 'react';
import { FiCopy, FiRefreshCw } from 'react-icons/fi';
import { getSafeMessageContent } from '../utils/message.jsx';

const ChatMessages = ({ messages, chatContainerRef, isTyping, handleRetry }) => {
  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content)
      .then(() => {
        console.log('Text copied to clipboard:', content);
      })
      .catch(err => {
        console.error('Failed to copy text:', err);
      });
  };

  return (
    <div className="chat-messages" ref={chatContainerRef}>
      {messages.map((message, index) => (
        <div key={index} className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}>
          <div className="message-content">{getSafeMessageContent(message.content)}</div>
          {message.role === 'assistant' && typeof message.content === 'string' && (
            <div className="message-actions">
              <button className="copy-button" onClick={() => handleCopyMessage(message.content)}>
                <FiCopy /> Copy
              </button>
              <button className="retry-button" onClick={() => handleRetry(index)}>
                <FiRefreshCw /> Retry
              </button>
            </div>
          )}
        </div>
      ))}
      {isTyping && <div className="typing-indicator">Thinking...</div>}
    </div>
  );
};

export default ChatMessages;
