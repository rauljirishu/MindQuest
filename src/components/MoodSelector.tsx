import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send,
  Loader2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Mood } from '../types';

interface MoodOption {
  mood: Mood;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
  quickPrompts: string[];
}

const moods: MoodOption[] = [
  { mood: 'Happy', emoji: '🌈', color: 'text-amber-400', bgColor: 'bg-amber-400/10', description: 'Celebration Garden', quickPrompts: ['Feeling full of energy! ✨', 'Looking forward to great things 🌟', 'Just in a positive mood 🎉'] },
  { mood: 'Sad', emoji: '💧', color: 'text-blue-400', bgColor: 'bg-blue-400/10', description: 'Memory Lake', quickPrompts: ['Feeling a little down today 🌧️', 'Need a quiet space 💙', 'Processing some emotions 🌿'] },
  { mood: 'Lonely', emoji: '🐚', color: 'text-slate-400', bgColor: 'bg-slate-400/10', description: 'Rainy Village', quickPrompts: ['Looking for connection 🤝', 'Feeling isolated right now 🐚', 'Just want someone to listen 💬'] },
  { mood: 'Angry', emoji: '🌋', color: 'text-red-400', bgColor: 'bg-red-400/10', description: 'Volcano', quickPrompts: ['Need to blow off steam 🌋', 'Feeling frustrated 🔥', 'Looking for inner calm 🕊️'] },
  { mood: 'Fear', emoji: '👻', color: 'text-purple-400', bgColor: 'bg-purple-400/10', description: 'Haunted Cave', quickPrompts: ['Unsure about what comes next 🌫️', 'Feeling vulnerable 🛡️', 'Seeking courage 🦁'] },
  { mood: 'Stress', emoji: '🌀', color: 'text-emerald-400', bgColor: 'bg-emerald-400/10', description: 'Busy City', quickPrompts: ['Too many things on my mind 🌀', 'Need a breath of fresh air 🍃', 'Overwhelmed by work 💼'] },
  { mood: 'Anxiety', emoji: '⛈️', color: 'text-indigo-400', bgColor: 'bg-indigo-400/10', description: 'Dark Forest', quickPrompts: ['Heart racing a little bit ⛈️', 'Need to slow down 🧘', 'Seeking clarity and peace ✨'] },
];

interface Props {
  onSelect: (mood: Mood, message: string) => void;
  loading: boolean;
}

export default function MoodSelector({ onSelect, loading }: Props) {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [message, setMessage] = useState('');

  const currentOption = moods.find(m => m.mood === selectedMood);

  const inferMood = (text: string): Mood => {
    const normalized = text.toLowerCase();
    if (/exam|test|deadline|overwhelmed|stressed|pressure/.test(normalized)) return 'Stress';
    if (/anxious|worry|panic|nervous/.test(normalized)) return 'Anxiety';
    if (/angry|furious|frustrated/.test(normalized)) return 'Angry';
    if (/sad|down|heartbroken/.test(normalized)) return 'Sad';
    if (/alone|lonely|isolated/.test(normalized)) return 'Lonely';
    if (/scared|afraid|fear/.test(normalized)) return 'Fear';
    if (/happy|joy|excited|great/.test(normalized)) return 'Happy';
    return 'Stress';
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const detectedMood = selectedMood || inferMood(message);
    const finalMsg = message.trim() || `I'm feeling ${detectedMood.toLowerCase()} today and want to explore MindQuest.`;
    onSelect(detectedMood, finalMsg);
  };

  const handleQuickPrompt = (prompt: string) => {
    setMessage(prompt);
    if (selectedMood) {
      onSelect(selectedMood, prompt);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 px-2">
        {moods.map((option) => (
          <motion.button
            key={option.mood}
            whileHover={{ y: -8, scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              setSelectedMood(option.mood);
              setMessage('');
            }}
            disabled={loading}
            className={cn(
              "flex flex-col items-center gap-3 p-5 rounded-[2rem] transition-all duration-300 group relative overflow-hidden shadow-lg",
              selectedMood === option.mood 
                ? "bg-white border-4 border-indigo-400 ring-4 ring-indigo-100 shadow-indigo-200" 
                : "bg-white/90 border-4 border-white hover:border-indigo-100 hover:shadow-indigo-50"
            )}
          >
            <div className={cn(
              "w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-300 relative z-10 shadow-inner",
              option.bgColor,
              selectedMood === option.mood && "scale-110 rotate-6"
            )}>
              <span className="text-3xl filter drop-shadow-md">
                {option.emoji}
              </span>
            </div>
            
            <div className="text-center relative z-10">
              <span className={cn(
                "block text-xs font-black uppercase tracking-wider transition-colors duration-300",
                selectedMood === option.mood ? "text-indigo-600" : "text-slate-500"
              )}>
                {option.mood}
              </span>
            </div>

            {selectedMood === option.mood && (
              <motion.div 
                layoutId="mood-bg"
                className="absolute inset-0 bg-indigo-50/60 pointer-events-none"
              />
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {(selectedMood || message.trim()) && (
          <motion.form
            key={selectedMood || 'free-text'}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            className="max-w-3xl mx-auto space-y-6 bg-white/80 backdrop-blur-xl border-4 border-white p-8 rounded-[3rem] shadow-2xl"
            onSubmit={handleSubmit}
          >
            {/* Quick Prompt Chips */}
            {selectedMood && currentOption && <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-400">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Quick Prompts for {selectedMood}:</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {currentOption.quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    disabled={loading}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="px-4 py-2 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-900 font-semibold text-sm rounded-full transition-all border border-indigo-100 hover:scale-105 active:scale-95 shadow-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>}

            <div className="relative group">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={selectedMood ? `Or type anything about your ${selectedMood.toLowerCase()} state... 💭` : 'Tell Nova how you feel, for example: I am really stressed about tomorrow\'s exam...'}
                className="w-full bg-indigo-50/30 border-4 border-indigo-50 rounded-[2rem] p-6 pr-20 text-lg font-bold text-indigo-950 focus:bg-white focus:border-indigo-300 outline-none transition-all resize-none h-32 placeholder:text-slate-400 shadow-inner"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute bottom-5 right-5 px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl flex items-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-600/30"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Analyze with Nova</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

