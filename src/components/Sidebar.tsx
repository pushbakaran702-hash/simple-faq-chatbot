import React from 'react';
import { Plus, MessageSquare, Trash2, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { ChatSession } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  isOpen,
  setIsOpen,
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ 
          width: isOpen ? 260 : 0,
          x: isOpen ? 0 : -260
        }}
        className={cn(
          "fixed md:relative z-50 h-full bg-sidebar-bg flex flex-col border-r border-white/10 overflow-hidden transition-all duration-300",
          !isOpen && "md:w-0"
        )}
      >
        <div className="p-3 flex flex-col h-full w-[260px]">
          <button
            onClick={onNewChat}
            className="flex items-center gap-3 px-3 py-3 w-full rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium mb-4"
          >
            <Plus size={16} />
            New Chat
          </button>

          <div className="flex-1 overflow-y-auto space-y-1 -mx-1 px-1">
            <div className="text-[10px] font-bold text-gray-500 px-3 py-2 uppercase tracking-wider">
              Recent
            </div>
            {sessions.map((session) => (
              <div
                key={session.id}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all relative",
                  currentSessionId === session.id ? "bg-white/10" : "hover:bg-white/5"
                )}
                onClick={() => onSelectSession(session.id)}
              >
                <MessageSquare size={16} className="text-gray-400 shrink-0" />
                <span className="text-sm truncate pr-6">{session.title}</span>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4 border-t border-white/10">
            <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 cursor-pointer">
              <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold">
                P
              </div>
              <span className="text-sm font-medium">User Profile</span>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed top-4 z-50 p-2 text-gray-400 hover:text-white transition-all bg-chat-bg/80 backdrop-blur-sm rounded-lg border border-white/10 md:bg-transparent md:border-none",
          isOpen ? "left-[210px] md:left-[210px]" : "left-4"
        )}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
      </button>
    </>
  );
};
