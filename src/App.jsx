import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ChatInput from './components/ChatInput';
import ChatMessages from './components/ChatMessages';
import SettingsModal from './components/SettingsModal';
import { fetchModels, sendChatMessage } from './api/openwebui';
import config from './config.json';
import { handleCommand } from './commands';
import { handleApiError } from './utils/error';
import './index.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(true);
  const [openWebUIUrl, setOpenWebUIUrl] = useState(localStorage.getItem('openWebUIUrl') || config.openWebUIUrl);
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || config.apiKey);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(localStorage.getItem('selectedModel') || config.selectedModel);
  const [fetchError, setFetchError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const storedOpenWebUIUrl = localStorage.getItem('openWebUIUrl');
    const storedApiKey = localStorage.getItem('apiKey');
    const storedSelectedModel = localStorage.getItem('selectedModel');

    if (storedOpenWebUIUrl) {
      setOpenWebUIUrl(storedOpenWebUIUrl);
    } else {
      localStorage.setItem('openWebUIUrl', config.openWebUIUrl);
    }

    if (storedApiKey) {
      setApiKey(storedApiKey);
    } else {
      localStorage.setItem('apiKey', config.apiKey);
    }

    if (storedSelectedModel) {
      setSelectedModel(storedSelectedModel);
    } else {
      localStorage.setItem('selectedModel', config.selectedModel);
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      if (openWebUIUrl && apiKey && selectedModel) {
        try {
          const fetchedModels = await fetchModels(openWebUIUrl, apiKey);
          setModels(fetchedModels.map(model => model.id));
        } catch (error) {
          handleApiError(error, 'Initialization');
          setFetchError(error.message);
        }
      }
    };

    initialize();
  }, [openWebUIUrl, apiKey, selectedModel]);

  const handleSend = async () => {
    if (!input.trim()) return;

    if (input.startsWith('>')) {
      const command = input.substring(1).trim();
      handleCommand(command, setInput, setShowSettings);
      return;
    }

    const userMessage = { role: 'user', content: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await sendChatMessage(openWebUIUrl, apiKey, selectedModel, [...messages, userMessage]);
      if (!response || !response.choices || !response.choices.length || !response.choices[0].message) {
        throw new Error('Invalid response format from OpenWebUI API.');
      }
      const assistantMessage = { role: 'assistant', content: response.choices[0].message.content };
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (error) {
      handleApiError(error, 'handleSendMessage');
      const errorAssistantMessage = { role: 'assistant', content: 'Failed to get response from OpenWebUI.' };
      setMessages(prevMessages => [...prevMessages, errorAssistantMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    if (name === 'openWebUIUrl') {
      setOpenWebUIUrl(value);
    } else if (name === 'apiKey') {
      setApiKey(value);
    } else if (name === 'selectedModel') {
      setSelectedModel(value);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    localStorage.setItem('openWebUIUrl', openWebUIUrl);
    localStorage.setItem('apiKey', apiKey);
    localStorage.setItem('selectedModel', selectedModel);
    setShowSettings(false);

    try {
      const fetchedModels = await fetchModels(openWebUIUrl, apiKey);
      setModels(fetchedModels.map(model => model.id));
      setFetchError(null);
    } catch (error) {
      handleApiError(error, 'handleSaveSettings');
      setFetchError(error.message);
    }
  };

  const handleLoadDefaultSettings = () => {
    setOpenWebUIUrl(config.openWebUIUrl);
    setApiKey(config.apiKey);
    setSelectedModel(config.selectedModel);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleRetry = (index) => {
    if (index > 0 && messages[index - 1].role === 'user') {
      const userMessage = messages[index - 1];
      const newMessages = messages.slice(0, index);
      setMessages(newMessages);
      handleSendMessage(userMessage.content + " please try again to give a better response", true);
    }
  };

  useEffect(() => {
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    
    const handleResize = () => {
      document.body.style.height = `${window.innerHeight}px`;
    };

    handleResize(); // Set initial height
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [messages]);

  return (
    <div className="container">
      <Header setShowSettings={setShowSettings} handleClearChat={handleClearChat} showSettings={showSettings} />
      {fetchError && <div className="error-message">{fetchError}</div>}
      <ChatMessages messages={messages} chatContainerRef={chatContainerRef} isTyping={isTyping} handleRetry={handleRetry} />
      <ChatInput input={input} setInput={setInput} handleSend={handleSend} models={models} selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
      {showSettings && (
        <div className="settings-modal">
          <SettingsModal
            showSettings={showSettings}
            setShowSettings={setShowSettings}
            openWebUIUrl={openWebUIUrl}
            setOpenWebUIUrl={setOpenWebUIUrl}
            apiKey={apiKey}
            setApiKey={setApiKey}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            models={models}
            handleSaveSettings={handleSaveSettings}
            handleLoadDefaultSettings={handleLoadDefaultSettings}
          />
        </div>
      )}
    </div>
  );
}

export default App;