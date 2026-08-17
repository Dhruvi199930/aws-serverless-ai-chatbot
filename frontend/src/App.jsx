import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import ChatInput from './components/ChatInput';
import ArchitectureDiagram from './components/ArchitectureDiagram';
import AuthModal from './components/AuthModal';
import SettingsModal from './components/SettingsModal';
import { conversationsApi, streamChatResponse } from './utils/api';

function ChatApp() {
  const { user, token } = useAuth();
  const [activeView, setActiveView] = useState('chat');
  
  // Conversations & Messages
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);

  // Settings & Models
  const [apiKey, setApiKey] = useState(localStorage.getItem('chatbot_openai_key') || '');
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');

  // Streaming State
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [streamingMeta, setStreamingMeta] = useState(null);

  // Modals & Drawers
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // AbortController reference for stopping stream
  const abortControllerRef = useRef(null);

  // Load conversations when user auth token changes
  useEffect(() => {
    if (token) {
      loadConversations();
    } else {
      setConversations([]);
      setCurrentConversationId(null);
      setMessages([]);
    }
  }, [token]);

  const loadConversations = async () => {
    try {
      const list = await conversationsApi.list();
      setConversations(list);
    } catch (err) {
      console.warn('Failed to fetch conversations:', err.message);
    }
  };

  // Load messages when current conversation ID changes
  useEffect(() => {
    if (currentConversationId && token && !isStreaming) {
      loadMessages(currentConversationId);
    }
  }, [currentConversationId]);

  const loadMessages = async (convId) => {
    try {
      const data = await conversationsApi.getMessages(convId);
      setMessages(data.messages || []);
    } catch (err) {
      console.warn('Failed to load conversation messages:', err.message);
    }
  };

  // Select conversation session
  const handleSelectConversation = (convId) => {
    setCurrentConversationId(convId);
    setActiveView('chat');
  };

  // Start a fresh new conversation
  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setActiveView('chat');
  };

  // Delete conversation session
  const handleDeleteConversation = async (convId) => {
    try {
      await conversationsApi.delete(convId);
      setConversations(prev => prev.filter(c => c.conversationId !== convId));
      if (currentConversationId === convId) {
        handleNewConversation();
      }
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  // Save API Key to localStorage
  const handleSaveApiKey = (key) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem('chatbot_openai_key', key);
    } else {
      localStorage.removeItem('chatbot_openai_key');
    }
  };

  // Stop active token stream
  const handleStopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  // Send message and trigger SSE stream
  const handleSend = async (messageText, attachment = null) => {
    if (!token) {
      setAuthModalOpen(true);
      return;
    }

    const displayContent = attachment 
      ? `📎 **[Attachment: ${attachment.name}]**\n\n${messageText || 'Analyze attached document.'}`
      : messageText;

    // Append optimistic user message
    const tempUserMsg = {
      messageId: 'temp_user_' + Date.now(),
      role: 'user',
      content: displayContent,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempUserMsg]);
    setIsStreaming(true);
    setStreamingText('');
    setStreamingMeta(null);

    abortControllerRef.current = new AbortController();
    let currentConvId = currentConversationId;
    let accumulatedResponse = '';

    await streamChatResponse({
      conversationId: currentConvId,
      message: messageText || `Analyze document: ${attachment?.name}`,
      apiKey,
      model: selectedModel,
      attachment,
      signal: abortControllerRef.current.signal,

      onMeta: (meta) => {
        if (meta.conversationId) {
          currentConvId = meta.conversationId;
        }
      },

      onChunk: (chunk) => {
        accumulatedResponse += chunk;
        setStreamingText(accumulatedResponse);
      },

      onDone: async (fullContent) => {
        setIsStreaming(false);
        setStreamingText('');

        // Append assistant message permanently to state
        const finalContent = fullContent || accumulatedResponse;
        const assistantMsg = {
          messageId: 'assistant_' + Date.now(),
          role: 'assistant',
          content: finalContent,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMsg]);
        setCurrentConversationId(currentConvId);

        // Refresh sidebar conversation list
        loadConversations();
      },

      onError: (errMessage) => {
        setIsStreaming(false);
        setStreamingText('');
        alert(`AWS Serverless Error: ${errMessage}`);
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-gray-100">
      {/* Header Bar */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
        apiKey={apiKey}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversation Sidebar */}
        <Sidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          isOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* View Viewport */}
        <main className="flex-1 flex flex-col h-[calc(100vh-61px)] overflow-hidden relative">
          {activeView === 'chat' ? (
            <>
              <ChatArea
                messages={messages}
                isStreaming={isStreaming}
                streamingText={streamingText}
                streamingMeta={streamingMeta}
                onQuickPrompt={handleSend}
              />
              <ChatInput
                onSend={handleSend}
                isStreaming={isStreaming}
                onStop={handleStopStream}
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
              />
            </>
          ) : (
            <ArchitectureDiagram isStreaming={isStreaming} />
          )}
        </main>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ChatApp />
    </AuthProvider>
  );
}
