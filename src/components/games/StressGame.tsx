import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GamePerformance } from '../../types';
import confetti from 'canvas-confetti';
import { Heart, Sparkles, Trophy, CheckCircle, Smile } from 'lucide-react';

interface Props {
  initialMessage?: string;
  analysis?: any;
  onComplete: (performance: GamePerformance) => void;
}

interface JigsawPiece {
  id: number;
  label: string;
  icon: string;
  slotId: number;
  placed: boolean;
}

export default function StressGame({ onComplete }: Props) {
  const [pieces, setPieces] = useState<JigsawPiece[]>([
    { id: 1, label: 'Elephant Ear & Trunk', icon: '🐘', slotId: 1, placed: false },
    { id: 2, label: 'Rhino Horn & Face', icon: '🦏', slotId: 2, placed: false },
    { id: 3, label: 'Jungle Vines & Leaves', icon: '🌿', slotId: 3, placed: false },
    { id: 4, label: 'Ancient Tree Stump', icon: '🪵', slotId: 4, placed: false }
  ]);

  const [selectedPiece, setSelectedPiece] = useState<JigsawPiece | null>(null);
  const [novaCompliment, setNovaCompliment] = useState("Fit the missing jigsaw pieces on the right into the jungle picture! You're going to do great! ✨");
  const [placedCount, setPlacedCount] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'won'>('playing');

  const startTimeRef = useRef(Date.now());

  const compliments = [
    "Perfect fit! Your mind is so calm, focused, and brilliant! ✨",
    "You have such a warm, creative energy! Stress doesn't stand a chance! 💕",
    "Amazing precision! Every piece you place makes the picture so beautiful! 🌸",
    "You're truly wonderful! Seeing you relax and complete this puzzle brings so much joy! 💖"
  ];

  const handlePlacePieceInSlot = (slotId: number) => {
    if (!selectedPiece || gameState !== 'playing') return;

    if (selectedPiece.slotId === slotId) {
      // Correct placement!
      const updated = pieces.map(p => p.id === selectedPiece.id ? { ...p, placed: true } : p);
      setPieces(updated);
      setSelectedPiece(null);

      const nextCount = placedCount + 1;
      setPlacedCount(nextCount);
      setNovaCompliment(compliments[(nextCount - 1) % compliments.length]);

      if (nextCount >= 4) {
        setGameState('won');
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
        const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
        setTimeout(() => {
          onComplete({
            score: 1000,
            collectibles: 4,
            mistakes: 0,
            timeTaken
          });
        }, 1500);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto w-full">
      {/* Top Banner */}
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border-4 border-emerald-100 shadow-lg flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <Heart className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-black text-lg text-slate-800">STRESS RELIEF - JUNGLE JIGSAW & COMPLIMENTS</h3>
            <p className="text-xs text-slate-500 font-medium">Click a piece on the right, then click its matching slot in the jungle picture to complete it!</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
          <Sparkles className="w-5 h-5 text-emerald-500 fill-emerald-500" />
          <span className="font-black text-lg text-emerald-900">{placedCount} / 4 Pieces Fit</span>
        </div>
      </div>

      {/* Nova Compliment Dialogue Bar */}
      <div className="bg-emerald-950/80 border-2 border-emerald-700/60 p-4 rounded-2xl flex items-center gap-3 shadow-lg">
        <span className="text-3xl bg-emerald-900 p-2 rounded-xl">🤖</span>
        <div>
          <span className="text-[10px] font-black uppercase text-emerald-400">Nova's Compliment to You</span>
          <p className="text-xs text-emerald-100 font-bold italic">{novaCompliment}</p>
        </div>
      </div>

      {/* Main Jigsaw Puzzle Stage */}
      <div className="relative bg-slate-900 rounded-[2.5rem] p-6 border-8 border-white shadow-2xl overflow-hidden min-h-[460px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {gameState === 'playing' ? (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full items-center">
              {/* Left: Main Jigsaw Picture Frame (Matching Image 1) */}
              <div className="lg:col-span-2 relative bg-amber-950 p-4 rounded-3xl border-8 border-amber-800 shadow-2xl">
                <div className="relative aspect-[4/3] bg-emerald-900 rounded-2xl overflow-hidden border-4 border-amber-700 grid grid-cols-2 grid-rows-2 gap-2 p-2">
                  {/* Slot 1: Elephant Ear */}
                  <div
                    onClick={() => handlePlacePieceInSlot(1)}
                    className={`rounded-2xl border-4 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer ${
                      pieces.find(p => p.id === 1)?.placed
                        ? 'bg-emerald-600/90 border-emerald-400 text-white'
                        : 'bg-white/10 border-white/40 hover:bg-white/20 text-white/60'
                    }`}
                  >
                    {pieces.find(p => p.id === 1)?.placed ? (
                      <div className="text-center p-2">
                        <span className="text-5xl block mb-1">🐘</span>
                        <span className="text-xs font-black">Elephant Fit ✨</span>
                      </div>
                    ) : (
                      <span className="text-xs font-black uppercase">Slot 1: Click to Place Piece</span>
                    )}
                  </div>

                  {/* Slot 2: Rhino Horn */}
                  <div
                    onClick={() => handlePlacePieceInSlot(2)}
                    className={`rounded-2xl border-4 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer ${
                      pieces.find(p => p.id === 2)?.placed
                        ? 'bg-emerald-600/90 border-emerald-400 text-white'
                        : 'bg-white/10 border-white/40 hover:bg-white/20 text-white/60'
                    }`}
                  >
                    {pieces.find(p => p.id === 2)?.placed ? (
                      <div className="text-center p-2">
                        <span className="text-5xl block mb-1">🦏</span>
                        <span className="text-xs font-black">Rhino Fit ✨</span>
                      </div>
                    ) : (
                      <span className="text-xs font-black uppercase">Slot 2: Click to Place Piece</span>
                    )}
                  </div>

                  {/* Slot 3: Jungle Vines */}
                  <div
                    onClick={() => handlePlacePieceInSlot(3)}
                    className={`rounded-2xl border-4 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer ${
                      pieces.find(p => p.id === 3)?.placed
                        ? 'bg-emerald-600/90 border-emerald-400 text-white'
                        : 'bg-white/10 border-white/40 hover:bg-white/20 text-white/60'
                    }`}
                  >
                    {pieces.find(p => p.id === 3)?.placed ? (
                      <div className="text-center p-2">
                        <span className="text-5xl block mb-1">🌿</span>
                        <span className="text-xs font-black">Jungle Vines Fit ✨</span>
                      </div>
                    ) : (
                      <span className="text-xs font-black uppercase">Slot 3: Click to Place Piece</span>
                    )}
                  </div>

                  {/* Slot 4: Tree Stump */}
                  <div
                    onClick={() => handlePlacePieceInSlot(4)}
                    className={`rounded-2xl border-4 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer ${
                      pieces.find(p => p.id === 4)?.placed
                        ? 'bg-emerald-600/90 border-emerald-400 text-white'
                        : 'bg-white/10 border-white/40 hover:bg-white/20 text-white/60'
                    }`}
                  >
                    {pieces.find(p => p.id === 4)?.placed ? (
                      <div className="text-center p-2">
                        <span className="text-5xl block mb-1">🪵</span>
                        <span className="text-xs font-black">Tree Stump Fit ✨</span>
                      </div>
                    ) : (
                      <span className="text-xs font-black uppercase">Slot 4: Click to Place Piece</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Available Jigsaw Pieces Picker */}
              <div className="space-y-3">
                <span className="text-xs font-black uppercase text-emerald-400 tracking-wider block">Available Pieces</span>
                <div className="flex flex-col gap-3">
                  {pieces.map(piece => (
                    <button
                      key={piece.id}
                      disabled={piece.placed}
                      onClick={() => setSelectedPiece(piece)}
                      className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                        piece.placed
                          ? 'bg-slate-850 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
                          : selectedPiece?.id === piece.id
                          ? 'bg-emerald-500 border-white text-slate-950 ring-4 ring-emerald-400 font-black'
                          : 'bg-slate-800 border-slate-700 text-white hover:border-emerald-500'
                      }`}
                    >
                      <span className="text-3xl">{piece.icon}</span>
                      <div className="text-left">
                        <span className="text-xs font-black block">{piece.label}</span>
                        <span className="text-[10px] opacity-75">{piece.placed ? 'Placed' : 'Click to select'}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="won" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                <Trophy className="w-10 h-10 animate-bounce" />
              </div>
              <h2 className="text-4xl font-black text-white">JUNGLE JIGSAW COMPLETED!</h2>
              <p className="text-slate-300 text-sm max-w-md mx-auto">You completed the entire cute jungle picture! Focusing on spatial jigsaw puzzles paired with positive compliments lowers stress cortisol.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
