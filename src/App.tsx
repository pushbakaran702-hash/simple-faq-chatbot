/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { ChatSession, Message } from './types';
import { streamChat } from './services/gemini';
import { Bot, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('chat-sessions');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('chat-sessions', JSON.stringify(sessions));
  }, [sessions]);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages, isTyping]);

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
    };
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newSession.id);
  };

  const handleSendMessage = async (content: string) => {
    let sessionId = currentSessionId;
    let updatedSessions = [...sessions];

    if (!sessionId) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
        messages: [],
        createdAt: Date.now(),
      };
      updatedSessions = [newSession, ...sessions];
      setSessions(updatedSessions);
      setCurrentSessionId(newSession.id);
      sessionId = newSession.id;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    const sessionIndex = updatedSessions.findIndex(s => s.id === sessionId);
    const session = updatedSessions[sessionIndex];
    
    // Update title if it's the first message
    if (session.messages.length === 0) {
      session.title = content.slice(0, 30) + (content.length > 30 ? '...' : '');
    }

    session.messages.push(userMessage);
    setSessions([...updatedSessions]);

    setIsTyping(true);
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };
    
    session.messages.push(assistantMessage);
    setSessions([...updatedSessions]);

    try {
      const stream = streamChat(session.messages.slice(0, -1));
      let fullContent = '';
      
      for await (const chunk of stream) {
        fullContent += chunk;
        const currentSessions = [...updatedSessions];
        const currentSession = currentSessions[sessionIndex];
        currentSession.messages[currentSession.messages.length - 1].content = fullContent;
        setSessions(currentSessions);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const currentSessions = [...updatedSessions];
      const currentSession = currentSessions[sessionIndex];
      currentSession.messages[currentSession.messages.length - 1].content = "Sorry, I encountered an error. Please check your API key and try again.";
      setSessions(currentSessions);
    } finally {
      setIsTyping(false);
    }
  };

  const handleDeleteSession = (id: string) => {
    setSessions(sessions.filter(s => s.id !== id));
    if (currentSessionId === id) {
      setCurrentSessionId(null);
    }
  };

  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isAtBottom);
  };

  return (
    <div className="flex h-screen w-full bg-chat-bg overflow-hidden">
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewChat={handleNewChat}
        onSelectSession={setCurrentSessionId}
        onDeleteSession={handleDeleteSession}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <main className="flex-1 flex flex-col relative h-full overflow-hidden">
        {/* Header (Mobile) */}
        <div className="md:hidden h-14 border-b border-white/10 flex items-center justify-center px-4 shrink-0">
          <span className="font-semibold truncate max-w-[200px]">
            {currentSession?.title || 'Moon Chat'}
          </span>
        </div>

        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto scroll-smooth"
        >
          {!currentSession || currentSession.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-4 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6"
              >
                <Bot size={32} className="text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold mb-8">How can I help you today?</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
                {[
                  "What is the capital of France?",
                  "Write a poem about a robot",
                  "Explain quantum physics simply",
                  "How do I make a chocolate cake?"
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    className="p-4 rounded-xl border border-white/10 hover:bg-white/5 text-left text-sm transition-colors group relative"
                  >
                    <span className="block pr-6">{prompt}</span>
                    <Sparkles size={14} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col pb-4">
              {currentSession.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isTyping && (
                <div className="w-full py-8 flex justify-center bg-chat-bg/50">
                  <div className="max-w-3xl w-full px-4 flex gap-6">
                    <div className="w-8 h-8 rounded-sm bg-emerald-600 flex items-center justify-center shrink-0">
                      <Bot size={18} />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Scroll to bottom button */}
        <AnimatePresence>
          {showScrollButton && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={scrollToBottom}
              className="absolute bottom-32 right-8 p-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all z-30"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
            </motion.button>
          )}
        </AnimatePresence>

        <div className="flex flex-col items-center w-full bg-gradient-to-t from-chat-bg via-chat-bg to-transparent pt-10 shrink-0">
          <ChatInput onSend={handleSendMessage} disabled={isTyping} />
        </div>
      </main>
    </div>
  );
}
