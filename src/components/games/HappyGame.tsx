import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GamePerformance } from '../../types';
import confetti from 'canvas-confetti';
import { Sun, Sparkles, Trophy, CheckCircle, HelpCircle } from 'lucide-react';

interface Props {
  initialMessage?: string;
  analysis?: any;
  onComplete: (performance: GamePerformance) => void;
}

export default function HappyGame({ onComplete }: Props) {
  // Correct answers: 🌐 = 4, 💖 = 9, 🌍 = 6, Target: 9 + (9 * 6) = 63
  const [inputGlobe, setInputGlobe] = useState('');
  const [inputHeart, setInputHeart] = useState('');
  const [inputEarth, setInputEarth] = useState('');
  const [inputFinal, setInputFinal] = useState('');

  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [gameState, setGameState] = useState<'playing' | 'won'>('playing');

  const startTimeRef = useRef(Date.now());

  const handleCheckAnswers = () => {
    const valGlobe = parseInt(inputGlobe.trim());
    const valHeart = parseInt(inputHeart.trim());
    const valEarth = parseInt(inputEarth.trim());
    const valFinal = parseInt(inputFinal.trim());

    if (valGlobe === 4 && valHeart === 9 && valEarth === 6 && valFinal === 63) {
      setGameState('won');
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
      const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
      setTimeout(() => {
        onComplete({
          score: 1000,
          collectibles: 4,
          mistakes: 0,
          timeTaken
        });
      }, 1500);
    } else {
      setFeedbackMsg('Check your math logic! Hint: 🌐 + 🌐 + 🌐 + 🌐 = 16, so 🌐 = 4!');
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
      {/* Top Banner */}
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border-4 border-amber-100 shadow-lg flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
            <Sun className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h3 className="font-black text-lg text-slate-800">FESTIVAL MATH PUZZLE - EMOJI LOGIC CHALLENGE</h3>
            <p className="text-xs text-slate-500 font-medium">Solve the emoji equations to find the values for 🌐, 💖, and 🌍, then calculate the final result!</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
          <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
          <span className="font-black text-lg text-amber-900">Happy Math Challenge</span>
        </div>
      </div>

      {/* Main Game Stage (Matching Image 2 Layout) */}
      <div className="relative bg-slate-900 rounded-[2.5rem] p-8 border-8 border-white shadow-2xl overflow-hidden min-h-[460px] flex flex-col items-center justify-center space-y-6">
        <AnimatePresence mode="wait">
          {gameState === 'playing' ? (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-xl space-y-6 flex flex-col items-center">
              {/* Equations Display Box */}
              <div className="bg-slate-800/90 border-4 border-pink-400/40 p-6 rounded-3xl w-full space-y-4 shadow-2xl text-white font-black text-lg sm:text-xl text-center">
                {/* Line 1 */}
                <div className="flex items-center justify-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-700">
                  <span>🌐</span> <span>+</span> <span>🌐</span> <span>+</span> <span>🌐</span> <span>+</span> <span>🌐</span> <span>=</span> <span className="text-amber-400">16</span>
                </div>

                {/* Line 2 */}
                <div className="flex items-center justify-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-700">
                  <span>🌐</span> <span>+</span> <span>🌐</span> <span>+</span> <span>💖</span> <span>=</span> <span className="text-amber-400">17</span>
                </div>

                {/* Line 3 */}
                <div className="flex items-center justify-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-700">
                  <span>💖</span> <span>+</span> <span>🌐</span> <span>+</span> <span>🌍</span> <span>=</span> <span className="text-amber-400">19</span>
                </div>

                {/* Final Target Equation */}
                <div className="flex items-center justify-center gap-3 bg-pink-500/20 p-4 rounded-2xl border-2 border-pink-400 text-pink-200">
                  <span>💖</span> <span>+</span> <span>💖</span> <span>×</span> <span>🌍</span> <span>=</span>
                  <input
                    type="number"
                    value={inputFinal}
                    onChange={(e) => setInputFinal(e.target.value)}
                    placeholder="?"
                    className="w-20 px-3 py-1 bg-slate-950 border-2 border-pink-400 rounded-xl text-center text-white font-black text-2xl"
                  />
                </div>
              </div>

              {/* Bottom Emoji Value Input Bar (Matching Image 2 Bottom Bar) */}
              <div className="bg-sky-500/20 border-2 border-sky-400 p-4 rounded-2xl w-full flex items-center justify-around flex-wrap gap-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🌐</span> <span>=</span>
                  <input
                    type="number"
                    value={inputGlobe}
                    onChange={(e) => setInputGlobe(e.target.value)}
                    placeholder="?"
                    className="w-14 px-2 py-1 bg-slate-950 border border-sky-400 rounded-xl text-center text-white font-black"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-2xl">💖</span> <span>=</span>
                  <input
                    type="number"
                    value={inputHeart}
                    onChange={(e) => setInputHeart(e.target.value)}
                    placeholder="?"
                    className="w-14 px-2 py-1 bg-slate-950 border border-pink-400 rounded-xl text-center text-white font-black"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-2xl">🌍</span> <span>=</span>
                  <input
                    type="number"
                    value={inputEarth}
                    onChange={(e) => setInputEarth(e.target.value)}
                    placeholder="?"
                    className="w-14 px-2 py-1 bg-slate-950 border border-emerald-400 rounded-xl text-center text-white font-black"
                  />
                </div>
              </div>

              {feedbackMsg && <p className="text-xs font-black text-rose-400">{feedbackMsg}</p>}

              <button
                onClick={handleCheckAnswers}
                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-lg rounded-2xl transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" /> Submit Math Solution 🎉
              </button>
            </motion.div>
          ) : (
            <motion.div key="won" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
              <div className="w-20 h-20 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto border border-amber-500/40">
                <Trophy className="w-10 h-10 animate-bounce" />
              </div>
              <h2 className="text-4xl font-black text-white">EMOJI MATH LOGIC SOLVED!</h2>
              <p className="text-slate-300 text-sm max-w-md mx-auto">You solved 🌐=4, 💖=9, 🌍=6, and calculated 9 + (9×6) = 63! Engaging in fun math logic boosts joy and cognitive vitality.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
