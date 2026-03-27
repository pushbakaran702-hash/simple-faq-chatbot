import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  return (
    <div className="w-full max-w-3xl px-4 pb-4 md:pb-8">
      <form 
        onSubmit={handleSubmit}
        className="relative flex items-end w-full bg-[#2f2f2f] rounded-2xl border border-white/10 shadow-xl focus-within:border-white/20 transition-all"
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Moon..."
          disabled={disabled}
          className="w-full bg-transparent text-white py-3.5 pl-4 pr-12 resize-none outline-none max-h-[200px] leading-relaxed placeholder:text-gray-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className={cn(
            "absolute right-2 bottom-2 p-1.5 rounded-lg transition-all",
            input.trim() && !disabled 
              ? "bg-white text-black hover:bg-gray-200" 
              : "text-gray-600 cursor-not-allowed"
          )}
        >
          <SendHorizontal size={20} />
        </button>
      </form>
      <p className="text-[10px] text-center text-gray-500 mt-2">
        Moon can make mistakes. Check important info.
      </p>
    </div>
  );
};
