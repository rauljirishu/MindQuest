import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { cn } from '../lib/utils';

interface Props {
  messages: Message[];
  onSendMessage: (content: string) => void;
  novaIntro?: string;
}

export default function ChatWindow({ messages, onSendMessage }: Props) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col bg-white border-8 border-indigo-50 rounded-[3rem] overflow-hidden h-full shadow-2xl relative group">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/white-diamond.png')] opacity-5 pointer-events-none" />
      
      <div className="p-6 border-b-4 border-indigo-50 bg-indigo-50/30 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <motion.div 
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center border-2 border-indigo-100"
          >
            <Sparkles className="w-7 h-7 text-indigo-500" />
          </motion.div>
          <div className="flex flex-col">
            <span className="font-black text-[10px] tracking-widest text-indigo-300 uppercase">Companion</span>
            <span className="font-black text-lg text-indigo-900">NOVA 🌈</span>
          </div>
        </div>
        <div className="w-4 h-4 rounded-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)] border-4 border-white" />
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-indigo-100 scrollbar-track-transparent relative z-10"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className={cn(
                "flex gap-4",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 shadow-md border-4 border-white",
                msg.role === 'user' ? "bg-indigo-100" : "bg-orange-100"
              )}>
                {msg.role === 'user' ? "👤" : "🤖"}
              </div>
              <div className={cn(
                "max-w-[85%] rounded-[2rem] px-6 py-4 text-sm leading-relaxed shadow-xl",
                msg.role === 'user' 
                  ? "bg-indigo-600 text-white rounded-tr-none" 
                  : "bg-white border-4 border-indigo-50 text-indigo-950 rounded-tl-none font-medium"
              )}>
                <div className="prose prose-sm max-w-none text-inherit">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <form onSubmit={handleSubmit} className="p-6 bg-white border-t-4 border-indigo-50 relative z-10">
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a happy thought..."
            className="w-full bg-indigo-50/50 border-4 border-indigo-50 rounded-[2rem] py-5 pl-8 pr-16 text-lg font-bold text-indigo-950 focus:ring-8 focus:ring-indigo-100 focus:border-indigo-200 outline-none transition-all placeholder:text-indigo-200"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center disabled:opacity-30 transition-all hover:scale-110 active:scale-90 shadow-xl shadow-indigo-200"
          >
            <Send className="w-6 h-6 text-white" />
          </button>
        </div>
      </form>
    </div>
  );
}
