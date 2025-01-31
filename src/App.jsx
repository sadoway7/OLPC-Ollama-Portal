import React, { useState, useEffect, useRef } from 'react';
    import { FiSettings, FiCopy, FiTrash2 } from 'react-icons/fi';
    
    function App() {
      const [messages, setMessages] = useState([]);
      const [input, setInput] = useState('');
      const [showSettings, setShowSettings] = useState(false);
      const [ollamaUrl, setOllamaUrl] = useState(() => localStorage.getItem('ollamaUrl') || 'https://www.ollamaurl.com');
      const [models, setModels] = useState([]);
      const [selectedModel, setSelectedModel] = useState(null);
      const chatContainerRef = useRef(null);
      const [fetchError, setFetchError] = useState(null);
      const [isTyping, setIsTyping] = useState(false);
      const [showSettingsButton, setShowSettingsButton] = useState(false);
      const [showBanner, setShowBanner] = useState(() => localStorage.getItem('showBanner') === 'true');
      const [bannerMessage, setBannerMessage] = useState(() => localStorage.getItem('bannerMessage') || '');
    
      useEffect(() => {
        const storedModel = localStorage.getItem('selectedModel');
        if (storedModel) {
          setSelectedModel(storedModel);
        } else {
          setSelectedModel('deepseek-coder:instruct');
        }
        fetchModels();
      }, []);
    
      const fetchModels = async () => {
        try {
          const response = await fetch(`${ollamaUrl}/api/tags`);
          if (response.ok) {
            const data = await response.json();
            setModels(data.models.map(model => model.name));
            setFetchError(null);
          } else {
            const errorText = await response.text();
            console.error('Failed to fetch models:', response.status, response.statusText, errorText);
            setFetchError(`Failed to fetch models: ${response.status} ${response.statusText} - ${errorText}`);
          }
        } catch (error) {
          console.error('Error fetching models:', error);
          setFetchError(`Error fetching models: ${error.message}`);
        }
      };
    
      const handleSettingsSubmit = (e) => {
        e.preventDefault();
        localStorage.setItem('ollamaUrl', ollamaUrl);
        localStorage.setItem('selectedModel', selectedModel);
        localStorage.setItem('showBanner', showBanner);
        localStorage.setItem('bannerMessage', bannerMessage);
        fetchModels();
        setShowSettings(false);
      };
    
        const handleClearChat = () => {
            setMessages([]);
        };
    
      const handleSendMessage = async () => {
        if (!input.trim()) return;
    
        if (input === 'settings123!') {
            setShowSettingsButton(true);
            setInput('');
            return;
        }
    
        const userMessage = { role: 'user', content: input };
        setMessages(prevMessages => [...prevMessages, userMessage]);
        setInput('');
        setIsTyping(true);
    
        try {
          const response = await fetch(`${ollamaUrl}/api/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: selectedModel,
              messages: [...messages, userMessage],
              stream: false,
            }),
          });
    
          if (response.ok) {
            const data = await response.json();
            const assistantMessage = { role: 'assistant', content: data.message.content };
            setMessages(prevMessages => [...prevMessages, assistantMessage]);
          } else {
            console.error('Failed to send message:', response.statusText);
            const errorAssistantMessage = { role: 'assistant', content: 'Failed to get response from Ollama.' };
            setMessages(prevMessages => [...prevMessages, errorAssistantMessage]);
          }
        } catch (error) {
          console.error('Error sending message:', error);
          const errorAssistantMessage = { role: 'assistant', content: 'Failed to get response from Ollama.' };
          setMessages(prevMessages => [...prevMessages, errorAssistantMessage]);
        } finally {
            setIsTyping(false);
        }
      };
    
      const handleCopyMessage = (messageContent) => {
        const tempElement = document.createElement('div');
        tempElement.innerHTML = messageContent;
        const textToCopy = tempElement.textContent || tempElement.innerText || '';
      
        navigator.clipboard.writeText(textToCopy)
          .then(() => {
            console.log('Text copied to clipboard:', textToCopy);
          })
          .catch(err => {
            console.error('Failed to copy text:', err);
          });
      };
    
      useEffect(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, [messages]);
    
      return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <div className="chat-header">
            <div className="header-content">
                <h2>L2PC Ollama Portal</h2>
                <div className="header-buttons">
                    {showSettingsButton && (
                        <button className="settings-button" onClick={() => setShowSettings(true)}>
                            <FiSettings />
                        </button>
                    )}
                </div>
            </div>
          </div>
          {showBanner && bannerMessage && (
            <div className="banner" dangerouslySetInnerHTML={{ __html: bannerMessage }} />
          )}
          {fetchError && (
            <div className="error-message">
              {fetchError}
            </div>
          )}
          <div className="chat-container" ref={chatContainerRef}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
              >
                <div className="message-content" dangerouslySetInnerHTML={{ __html: message.content }} />
                  {message.role === 'assistant' && (
                      <button className="copy-button" onClick={() => handleCopyMessage(message.content)}>
                          <FiCopy />
                      </button>
                  )}
              </div>
            ))}
            {isTyping && <div className="typing-indicator">Thinking...</div>}
          </div>
          <div className="chat-input-area">
          {showSettingsButton && (
            <select
                className="model-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
            >
                {models.map((model) => (
                    <option key={model} value={model}>
                        {model}
                    </option>
                ))}
            </select>
          )}
            <div className="input-and-buttons">
                <input
                type="text"
                className="chat-input"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                    handleSendMessage();
                    }
                }}
                />
                <div className="action-buttons">
                    <button className="send-button" onClick={handleSendMessage}>
                        Send
                    </button>
                    <button className="clear-button" onClick={handleClearChat}>
                        <FiTrash2 />
                    </button>
                </div>
            </div>
          </div>
    
          {showSettings && (
            <div className="settings-modal">
              <div className="settings-content">
                <h3>Settings</h3>
                <form className="settings-form" onSubmit={handleSettingsSubmit}>
                  <label>
                    Ollama URL:
                    <input
                      type="text"
                      value={ollamaUrl}
                      onChange={(e) => setOllamaUrl(e.target.value)}
                    />
                  </label>
                  <label>
                    Select Model:
                    <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
                      {models.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Show Banner:
                    <input
                      type="checkbox"
                      checked={showBanner}
                      onChange={(e) => setShowBanner(e.target.checked)}
                    />
                  </label>
                  <label>
                    Banner Message (HTML):
                    <textarea
                      value={bannerMessage}
                      onChange={(e) => setBannerMessage(e.target.value)}
                    />
                  </label>
                  <button type="submit">Save</button>
                </form>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    export default App;
