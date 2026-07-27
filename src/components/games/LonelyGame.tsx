import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GamePerformance } from '../../types';
import confetti from 'canvas-confetti';
import { Heart, Sparkles, UserPlus, MessageCircle, Trophy, Smile } from 'lucide-react';

interface Props {
  initialMessage?: string;
  analysis?: any;
  onComplete: (performance: GamePerformance) => void;
}

export default function LonelyGame({ onComplete }: Props) {
  const [board, setBoard] = useState<Array<string | null>>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [novaMessage, setNovaMessage] = useState("Hi there! I'm so happy to play Tic-Tac-Toe with you! You make your move first! 💖");
  const [movesCount, setMovesCount] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'won'>('playing');

  const startTimeRef = useRef(Date.now());

  const novaChatter = [
    "Great move! You're really thoughtful and strategic! 🌟",
    "I love spending this quiet time playing with you! ☕",
    "Did you know? Playing games together triggers oxytocin and feelings of warmth! 💖",
    "Whether we win or lose, what matters most to me is connecting with you! ✨",
    "You have such a kind spirit. I'm always right here whenever you need a friend! 🌿"
  ];

  // Nova AI Move Logic
  useEffect(() => {
    if (!isPlayerTurn && gameState === 'playing') {
      const emptyIndices = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null) as number[];
      if (emptyIndices.length > 0) {
        setTimeout(() => {
          const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
          const newBoard = [...board];
          newBoard[randomIndex] = 'O';
          setBoard(newBoard);
          setIsPlayerTurn(true);

          // Update Nova message
          const nextMsg = novaChatter[movesCount % novaChatter.length];
          setNovaMessage(nextMsg);

          checkWinner(newBoard);
        }, 800);
      }
    }
  }, [isPlayerTurn, board, gameState]);

  const handleCellClick = (index: number) => {
    if (!isPlayerTurn || board[index] !== null || gameState !== 'playing') return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setIsPlayerTurn(false);
    const newMoves = movesCount + 1;
    setMovesCount(newMoves);

    checkWinner(newBoard);
  };

  const checkWinner = (currentBoard: Array<string | null>) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    let hasWinner = false;
    for (const [a, b, c] of lines) {
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        hasWinner = true;
        break;
      }
    }

    const isFull = currentBoard.every(cell => cell !== null);

    if (hasWinner || isFull) {
      setGameState('won');
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
      const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
      setTimeout(() => {
        onComplete({
          score: 1000,
          collectibles: 9,
          mistakes: 0,
          timeTaken
        });
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
      {/* Top Banner */}
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border-4 border-indigo-100 shadow-lg flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <UserPlus className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h3 className="font-black text-lg text-slate-800">FRIEND CONNECT - TIC-TAC-TOE WITH NOVA</h3>
            <p className="text-xs text-slate-500 font-medium">Play a cozy game of Tic-Tac-Toe against Nova. Winning or losing isn't key—connecting is!</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
          <span className="font-black text-lg text-indigo-900">{movesCount} Turns Together</span>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="relative bg-slate-900 rounded-[2.5rem] p-8 border-8 border-white shadow-2xl overflow-hidden min-h-[460px] flex flex-col items-center justify-center space-y-6">
        {/* Nova Warm Dialogue Box */}
        <div className="bg-indigo-950/80 border-2 border-indigo-700/60 p-4 rounded-2xl max-w-md w-full flex items-start gap-3 shadow-lg">
          <span className="text-3xl bg-indigo-900 p-2 rounded-xl">🤖</span>
          <div className="text-left">
            <span className="text-[10px] font-black uppercase text-indigo-400">Nova Companion</span>
            <p className="text-xs text-indigo-100 font-medium leading-relaxed italic">{novaMessage}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {gameState === 'playing' ? (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center space-y-4">
              {/* Tic-Tac-Toe Board */}
              <div className="grid grid-cols-3 gap-3 w-72 h-72 p-3 bg-slate-800 rounded-3xl border-4 border-slate-700 shadow-2xl">
                {board.map((cell, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCellClick(idx)}
                    className="w-full h-full bg-slate-900 hover:bg-slate-850 rounded-2xl flex items-center justify-center text-4xl font-black transition-all border border-slate-700/50 shadow-inner"
                  >
                    {cell === 'X' && <span className="text-sky-400">❌</span>}
                    {cell === 'O' && <span className="text-rose-400">⭕</span>}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="won" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
              <div className="w-20 h-20 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto border border-indigo-500/40">
                <Trophy className="w-10 h-10 animate-bounce" />
              </div>
              <h2 className="text-4xl font-black text-white">FRIENDSHIP & CONNECTION RESTORED!</h2>
              <p className="text-slate-300 text-sm max-w-md mx-auto">Nova says: "Thank you for playing with me! You made my day so much brighter. I'm always right here for you!"</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
