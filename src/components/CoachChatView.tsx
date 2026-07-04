import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, Smile, MessageSquare, ArrowRight, Brain } from 'lucide-react';
import { ChatMessage } from '../types';

interface CoachChatProps {
  chatHistory: ChatMessage[];
  isDarkMode?: boolean;
  onSendMessage: (text: string) => Promise<void>;
  isCoachTyping: boolean;
}

export default function CoachChatView({ chatHistory, isDarkMode = false, onSendMessage, isCoachTyping }: CoachChatProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isCoachTyping]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleChipClick = (chipText: string) => {
    onSendMessage(chipText);
  };

  const SUGGESTION_CHIPS = [
    'How do I maintain streaks?',
    'Watering Gardening plants timing?',
    'What should my daily reading target be?',
    'Suggest a mindfulness custom category'
  ];

  return (
    <div className={`space-y-6 max-w-5xl mx-auto py-2 flex flex-col h-[calc(100vh-170px)] ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      {/* Title Header */}
      <div className="text-center">
        <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 bg-clip-text text-transparent tracking-tight flex items-center justify-center gap-2">
          <Brain className="w-7 h-7 text-purple-400" /> AI Habit Coach Workspace
        </h1>
        <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
          Engage in custom chat sessions with Coach Gemini for personal commitment guidance and stats breakdowns.
        </p>
      </div>

      {/* Main Chat Container */}
      <div className={`flex-1 rounded-3xl border flex flex-col overflow-hidden relative ${
        isDarkMode ? 'glass-panel-dark border-purple-900/30' : 'glass-panel border-white/60 shadow-md'
      }`}>
        {/* Soft background aura inside the box */}
        <div className="absolute inset-0 bg-radial-gradient from-purple-500/5 via-transparent to-transparent pointer-events-none" />

        {/* Scrollable Messages Panel */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <AnimatePresence initial={false}>
            {chatHistory.map((msg) => {
              const isCoach = msg.sender === 'coach';
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${isCoach ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                      isCoach
                        ? isDarkMode 
                          ? 'bg-purple-950/45 border border-purple-900 text-purple-200 rounded-tl-none font-sans'
                          : 'bg-purple-100/80 border border-purple-200/50 text-purple-950 rounded-tl-none font-sans'
                        : isDarkMode
                          ? 'bg-slate-900 border border-purple-900/40 text-slate-100 rounded-tr-none'
                          : 'bg-white border border-purple-100 text-gray-800 rounded-tr-none shadow-xs font-sans'
                    }`}
                  >
                    {isCoach && (
                      <span className="font-mono text-[9px] font-bold text-purple-400 block uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" /> AI Coach
                      </span>
                    )}
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span className="text-[8px] text-gray-400 font-mono mt-1.5 block text-right">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Simulated Typing Indicator */}
          {isCoachTyping && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className={`rounded-2xl rounded-tl-none p-3 px-4 flex gap-1 items-center border ${
                isDarkMode ? 'bg-purple-950/20 border-purple-900/30 text-purple-300' : 'bg-purple-100/50 border-purple-100 text-purple-600'
              }`}>
                <span className="text-[10px] font-semibold font-mono animate-pulse mr-1">AI Coach is writing...</span>
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Quick Chips */}
        <div className={`px-5 py-2.5 flex flex-wrap gap-2 border-t ${
          isDarkMode ? 'bg-slate-950/50 border-purple-900/30' : 'bg-white/10 border-purple-100/40'
        }`}>
          {SUGGESTION_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => handleChipClick(chip)}
              className={`py-1.5 px-3 rounded-full text-[10px] font-medium transition-all cursor-pointer shadow-xs ${
                isDarkMode 
                  ? 'bg-slate-900 hover:bg-purple-950 text-slate-300 border border-purple-900/30 hover:text-purple-300' 
                  : 'bg-white/70 hover:bg-white border border-purple-100 hover:border-purple-300 hover:text-purple-700'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input send bar footer */}
        <form onSubmit={handleSend} className={`p-4 flex gap-3 items-center border-t ${
          isDarkMode ? 'bg-slate-950/75 border-purple-900/40' : 'bg-white/40 border-purple-100'
        }`}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Discuss streaks, schedule reminders, ask Gemini..."
            className={`flex-1 py-3 px-5 border text-xs rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-400 transition-all ${
              isDarkMode 
                ? 'bg-slate-900 border-purple-900/50 text-white placeholder-slate-500' 
                : 'bg-white border-purple-100 text-gray-800 placeholder-gray-400'
            }`}
          />
          <button
            type="submit"
            className="p-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white hover:scale-103 active:scale-97 transition-all shadow-md shadow-purple-500/10 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
