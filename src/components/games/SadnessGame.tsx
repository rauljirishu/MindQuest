import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GamePerformance } from '../../types';
import confetti from 'canvas-confetti';
import { Sun, Sparkles, Heart, Flower2, Trophy, RotateCcw } from 'lucide-react';

interface Props {
  initialMessage?: string;
  analysis?: any;
  onComplete: (performance: GamePerformance) => void;
}

interface Card {
  id: number;
  pairId: number;
  title: string;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function SadnessGame({ onComplete }: Props) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairsCount, setMatchedPairsCount] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'won'>('playing');

  const startTimeRef = useRef(Date.now());

  const initialPairs = [
    { pairId: 1, title: 'Sunny Beach Memory', icon: '🏖️' },
    { pairId: 2, title: 'Warm Tea Morning', icon: '🍵' },
    { pairId: 3, title: 'Family Hug', icon: '🫂' },
    { pairId: 4, title: 'Achievement Star', icon: '🌟' }
  ];

  // Initialize and shuffle deck
  useEffect(() => {
    const deck: Card[] = [];
    let idCounter = 1;
    initialPairs.forEach(pair => {
      deck.push({ id: idCounter++, pairId: pair.pairId, title: pair.title, icon: pair.icon, isFlipped: false, isMatched: false });
      deck.push({ id: idCounter++, pairId: pair.pairId, title: pair.title, icon: pair.icon, isFlipped: false, isMatched: false });
    });
    // Shuffle
    deck.sort(() => Math.random() - 0.5);
    setCards(deck);
  }, []);

  const handleCardClick = (index: number) => {
    if (gameState !== 'playing') return;
    if (flippedCards.length >= 2) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;

    // Flip card
    const updated = [...cards];
    updated[index].isFlipped = true;
    setCards(updated);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const firstIdx = newFlipped[0];
      const secondIdx = newFlipped[1];

      if (updated[firstIdx].pairId === updated[secondIdx].pairId) {
        // Match found!
        updated[firstIdx].isMatched = true;
        updated[secondIdx].isMatched = true;
        setCards(updated);
        setFlippedCards([]);
        const newMatched = matchedPairsCount + 1;
        setMatchedPairsCount(newMatched);

        if (newMatched === 4) {
          setGameState('won');
          confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
          const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
          setTimeout(() => {
            onComplete({
              score: 1000,
              collectibles: 4,
              mistakes: moves,
              timeTaken
            });
          }, 1500);
        }
      } else {
        // Unflip after delay
        setTimeout(() => {
          const resetDeck = [...cards];
          resetDeck[firstIdx].isFlipped = false;
          resetDeck[secondIdx].isFlipped = false;
          setCards(resetDeck);
          setFlippedCards([]);
        }, 1000);
      }
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
            <h3 className="font-black text-lg text-slate-800">MEMORY MATCH - RECALL POSITIVE MEMORIES</h3>
            <p className="text-xs text-slate-500 font-medium">Flip cards to match identical positive memory pairs! Each match restores a blooming garden.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
          <Flower2 className="w-5 h-5 text-amber-500 fill-amber-500" />
          <span className="font-black text-lg text-amber-900">{matchedPairsCount} / 4 Matches</span>
        </div>
      </div>

      {/* Main Game Stage */}
      <div className="relative bg-slate-900 rounded-[2.5rem] p-8 border-8 border-white shadow-2xl overflow-hidden min-h-[460px] flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {gameState === 'playing' ? (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-6 flex flex-col items-center">
              {/* Card Grid */}
              <div className="grid grid-cols-4 gap-4 max-w-lg w-full">
                {cards.map((card, idx) => (
                  <motion.div
                    key={card.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCardClick(idx)}
                    className={`h-32 rounded-2xl border-4 cursor-pointer flex flex-col items-center justify-center transition-all duration-500 shadow-xl ${
                      card.isFlipped || card.isMatched 
                        ? 'bg-amber-400 border-amber-300 text-slate-900 rotate-y-180' 
                        : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-amber-400'
                    }`}
                  >
                    {card.isFlipped || card.isMatched ? (
                      <div className="text-center p-2">
                        <span className="text-3xl block mb-1">{card.icon}</span>
                        <span className="text-[10px] font-black leading-tight block">{card.title}</span>
                      </div>
                    ) : (
                      <Sparkles className="w-8 h-8 text-slate-600" />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="won" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
              <div className="w-20 h-20 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto border border-amber-500/40">
                <Trophy className="w-10 h-10 animate-bounce" />
              </div>
              <h2 className="text-4xl font-black text-white">GARDEN RESTORED & MOOD ELEVATED!</h2>
              <p className="text-slate-300 text-sm max-w-md mx-auto">You matched all positive memory cards in {moves} moves! Recalling joyful experiences activates serotonin pathways.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
