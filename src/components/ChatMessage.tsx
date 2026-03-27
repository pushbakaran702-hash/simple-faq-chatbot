import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { cn } from '../lib/utils';
import { User, Bot, Copy, Check } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "group w-full py-8 flex justify-center transition-colors",
        isUser ? "bg-chat-bg" : "bg-chat-bg/50"
      )}
    >
      <div className="max-w-3xl w-full px-4 flex gap-4 md:gap-6 relative">
        <div className={cn(
          "w-8 h-8 rounded-sm flex items-center justify-center shrink-0 shadow-sm",
          isUser ? "bg-indigo-600" : "bg-emerald-600"
        )}>
          {isUser ? <User size={18} /> : <Bot size={18} />}
        </div>
        
        <div className="flex-1 space-y-2 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-xs text-gray-400 uppercase tracking-wider">
              {isUser ? 'You' : 'Moon'}
            </div>
            {!isUser && message.content && (
              <button
                onClick={copyToClipboard}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-white/10 transition-all text-gray-400 hover:text-white active:scale-95"
                title="Copy to clipboard"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            )}
          </div>
          <div className="prose prose-invert max-w-none break-words prose-p:leading-relaxed prose-pre:bg-[#0d0d0d] prose-pre:border prose-pre:border-white/10">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};
