import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GamePerformance } from '../../types';
import confetti from 'canvas-confetti';
import { Music, Sparkles, Sun, Volume2, Trophy, Heart } from 'lucide-react';

interface Props {
  initialMessage?: string;
  analysis?: any;
  onComplete: (performance: GamePerformance) => void;
}

interface PianoKey {
  note: string;
  freq: number;
  label: string;
  keyBind: string;
  color: string;
}

export default function AnxietyGame({ onComplete }: Props) {
  const [playedNotes, setPlayedNotes] = useState<string[]>([]);
  const [notesPlayedCount, setNotesPlayedCount] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'won'>('playing');

  const audioCtxRef = useRef<AudioContext | null>(null);
  const startTimeRef = useRef(Date.now());

  const pianoKeys: PianoKey[] = [
    { note: 'C4', freq: 261.63, label: 'Do (C4)', keyBind: '1', color: 'bg-sky-500' },
    { note: 'D4', freq: 293.66, label: 'Re (D4)', keyBind: '2', color: 'bg-indigo-500' },
    { note: 'E4', freq: 329.63, label: 'Mi (E4)', keyBind: '3', color: 'bg-purple-500' },
    { note: 'F4', freq: 349.23, label: 'Fa (F4)', keyBind: '4', color: 'bg-pink-500' },
    { note: 'G4', freq: 392.00, label: 'Sol (G4)', keyBind: '5', color: 'bg-rose-500' },
    { note: 'A4', freq: 440.00, label: 'La (A4)', keyBind: '6', color: 'bg-amber-500' },
    { note: 'B4', freq: 493.88, label: 'Ti (B4)', keyBind: '7', color: 'bg-emerald-500' },
    { note: 'C5', freq: 523.25, label: 'Do (C5)', keyBind: '8', color: 'bg-teal-500' }
  ];

  // Initialize Web Audio API
  const playTone = (freq: number) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.error("Audio synth error:", e);
    }
  };

  const handleKeyPress = (key: PianoKey) => {
    if (gameState !== 'playing') return;

    playTone(key.freq);
    const updated = [...playedNotes.slice(-4), key.note];
    setPlayedNotes(updated);

    const newCount = notesPlayedCount + 1;
    setNotesPlayedCount(newCount);

    if (newCount >= 12) {
      setGameState('won');
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
      const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
      setTimeout(() => {
        onComplete({
          score: 1000,
          collectibles: 12,
          mistakes: 0,
          timeTaken
        });
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
      {/* Top Banner */}
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border-4 border-sky-100 shadow-lg flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-100 text-sky-600 rounded-xl">
            <Music className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h3 className="font-black text-lg text-slate-800">CALMING RELIEF PIANO - SOOTHING MELODIES</h3>
            <p className="text-xs text-slate-500 font-medium">Tap glowing piano keys (or press 1-8) to play therapeutic music notes that give instant relief!</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-sky-50 px-4 py-2 rounded-xl border border-sky-100">
          <Volume2 className="w-5 h-5 text-sky-500 fill-sky-500" />
          <span className="font-black text-lg text-sky-900">{notesPlayedCount} / 12 Notes Played</span>
        </div>
      </div>

      {/* Main Game Stage */}
      <div className="relative bg-slate-900 rounded-[2.5rem] p-8 border-8 border-white shadow-2xl overflow-hidden min-h-[460px] flex flex-col items-center justify-center space-y-6">
        <AnimatePresence mode="wait">
          {gameState === 'playing' ? (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-6 flex flex-col items-center">
              {/* Sound Wave Visualizer Bar */}
              <div className="flex items-center justify-center gap-2 bg-slate-800 p-4 rounded-2xl border border-slate-700 w-full max-w-lg shadow-inner">
                <Music className="w-5 h-5 text-sky-400 animate-pulse" />
                <span className="text-xs font-black text-sky-300 uppercase tracking-widest">
                  {playedNotes.length > 0 ? playedNotes.join('  ➔  ') : 'Play any key to start soothing melody'}
                </span>
              </div>

              {/* Interactive Piano Keyboard */}
              <div className="grid grid-cols-8 gap-2 w-full max-w-2xl h-64 p-4 bg-slate-800 rounded-3xl border-4 border-slate-700 shadow-2xl">
                {pianoKeys.map((key) => (
                  <motion.button
                    key={key.note}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handleKeyPress(key)}
                    className={`${key.color} hover:brightness-110 rounded-2xl flex flex-col items-center justify-between p-3 text-white font-black transition-all shadow-lg border-2 border-white/30 cursor-pointer`}
                  >
                    <span className="text-xs opacity-75">{key.keyBind}</span>
                    <span className="text-lg tracking-tight">{key.label}</span>
                    <Sparkles className="w-4 h-4 opacity-50" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="won" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
              <div className="w-20 h-20 bg-sky-500/20 text-sky-400 rounded-full flex items-center justify-center mx-auto border border-sky-500/40">
                <Trophy className="w-10 h-10 animate-bounce" />
              </div>
              <h2 className="text-4xl font-black text-white">SOOTHING RELIEF MELODY PLAYED!</h2>
              <p className="text-slate-300 text-sm max-w-md mx-auto">Playing harmonized acoustic notes triggers parasympathetic relaxation and lowers heart rate!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
