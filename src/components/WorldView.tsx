import { motion } from 'motion/react';
import { WorldContext, Mood } from '../types';
import { cn } from '../lib/utils';

interface Props {
  world: WorldContext;
  mood: Mood;
}

const moodIcons: Record<Mood, string> = {
  Happy: '🌈',
  Sad: '💧',
  Lonely: '🐚',
  Angry: '🌋',
  Fear: '👻',
  Stress: '🌀',
  Anxiety: '⛈️'
};

export default function WorldView({ world, mood }: Props) {
  const emoji = moodIcons[mood];

  return (
    <div className={cn(
      "relative h-56 rounded-[2.5rem] overflow-hidden border-8 border-white bg-slate-950 shadow-2xl group transition-all duration-1000",
      world?.settings?.weather === 'rainy' && "brightness-75",
      world?.settings?.weather === 'stormy' && "brightness-50",
      world?.settings?.weather === 'foggy' && "opacity-80"
    )}>
      {/* Dynamic Background */}
      <div className={cn(
        "absolute inset-0 transition-all duration-1000 opacity-30",
        mood === 'Happy' && "bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-600",
        mood === 'Sad' && "bg-gradient-to-br from-blue-400 via-indigo-600 to-slate-900",
        mood === 'Lonely' && "bg-gradient-to-br from-slate-400 via-slate-600 to-slate-950",
        mood === 'Angry' && "bg-gradient-to-br from-red-600 via-orange-800 to-black",
        mood === 'Fear' && "bg-gradient-to-br from-purple-800 via-indigo-950 to-black",
        mood === 'Stress' && "bg-gradient-to-br from-emerald-600 via-teal-800 to-slate-950",
        mood === 'Anxiety' && "bg-gradient-to-br from-indigo-800 via-purple-900 to-black",
        (world?.settings?.weather === 'rainy' || world?.settings?.weather === 'stormy') && "grayscale-[0.5]"
      )} />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Decorative Particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30"
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              scale: Math.random()
            }}
            animate={{ 
              y: [null, "-40px", "0px"],
              opacity: [0.1, 0.6, 0.1],
              scale: [null, 1.5, 0.5]
            }}
            transition={{
              duration: 3 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-8 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">
              Adaptive Synthesis: <span className="text-emerald-400">Online</span>
            </span>
          </div>
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-white/20" />
            <div className="w-2 h-2 rounded-full bg-white/20" />
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-16 h-16 rounded-[1.5rem] bg-white shadow-2xl flex items-center justify-center border-4 border-indigo-50"
          >
            <span className="text-4xl">{emoji}</span>
          </motion.div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic drop-shadow-lg">{world.worldName}</h2>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] mt-1">{world.environmentDescription}</p>
          </div>
        </div>
      </div>

      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[size:100%_4px,3px_100%] z-20" />
    </div>
  );
}
