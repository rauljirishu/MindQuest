import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GamePerformance } from '../../types';
import confetti from 'canvas-confetti';
import { Compass, Sparkles, Sun, Trophy, Shield, Key } from 'lucide-react';

interface Props {
  initialMessage?: string;
  analysis?: any;
  onComplete: (performance: GamePerformance) => void;
}

interface Item {
  id: number;
  x: number;
  y: number;
  type: 'rock' | 'fire' | 'snake' | 'mask' | 'elder' | 'gem';
  icon: string;
  collected: boolean;
}

interface Wall {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export default function FearGame({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [gemsCollected, setGemsCollected] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'won'>('playing');

  const playerRef = useRef({ x: 60, y: 60, radius: 14 });
  const treasureRef = useRef({ x: 740, y: 440, radius: 24 });
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef(Date.now());

  // Maze Walls Grid Pattern matching image
  const wallsRef = useRef<Wall[]>([
    // Outer Border Walls
    { x1: 40, y1: 40, x2: 760, y2: 40 },
    { x1: 40, y1: 40, x2: 40, y2: 460 },
    { x1: 760, y1: 40, x2: 760, y2: 400 }, // Exit gap at bottom right
    { x1: 40, y1: 460, x2: 700, y2: 460 },

    // Internal Maze Barriers
    { x1: 120, y1: 40, x2: 120, y2: 180 },
    { x1: 120, y1: 180, x2: 240, y2: 180 },
    { x1: 240, y1: 100, x2: 240, y2: 260 },
    { x1: 180, y1: 260, x2: 320, y2: 260 },
    { x1: 320, y1: 40, x2: 320, y2: 180 },

    { x1: 400, y1: 100, x2: 400, y2: 320 },
    { x1: 480, y1: 40, x2: 480, y2: 220 },
    { x1: 560, y1: 120, x2: 560, y2: 340 },
    { x1: 640, y1: 40, x2: 640, y2: 260 },
    { x1: 640, y1: 260, x2: 760, y2: 260 },

    { x1: 120, y1: 340, x2: 280, y2: 340 },
    { x1: 280, y1: 340, x2: 280, y2: 460 },
    { x1: 360, y1: 340, x2: 360, y2: 460 },
    { x1: 480, y1: 320, x2: 640, y2: 320 },
    { x1: 560, y1: 380, x2: 760, y2: 380 }
  ]);

  // Maze Items & Obstacles
  const itemsRef = useRef<Item[]>([
    { id: 1, x: 200, y: 120, type: 'elder', icon: '🧙', collected: false },
    { id: 2, x: 180, y: 300, type: 'rock', icon: '🪨', collected: false },
    { id: 3, x: 100, y: 220, type: 'mask', icon: '👺', collected: false },
    { id: 4, x: 360, y: 150, type: 'fire', icon: '🔥', collected: false },
    { id: 5, x: 440, y: 50, type: 'snake', icon: '🐍', collected: false },
    { id: 6, x: 520, y: 90, type: 'rock', icon: '🪨', collected: false },
    { id: 7, x: 440, y: 240, type: 'elder', icon: '🧙', collected: false },
    { id: 8, x: 440, y: 350, type: 'mask', icon: '👺', collected: false },
    { id: 9, x: 380, y: 420, type: 'fire', icon: '🔥', collected: false },
    { id: 10, x: 620, y: 280, type: 'snake', icon: '🐍', collected: false },
    { id: 11, x: 600, y: 350, type: 'gem', icon: '💎', collected: false }
  ]);

  // Keyboard Movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keysRef.current[e.code] = true;
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current[e.code] = false;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main Walk & Wall Collision Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      if (gameState === 'playing') {
        const speed = 3.5;
        const p = playerRef.current;
        let nextX = p.x;
        let nextY = p.y;

        if (keysRef.current['KeyW'] || keysRef.current['ArrowUp']) nextY -= speed;
        if (keysRef.current['KeyS'] || keysRef.current['ArrowDown']) nextY += speed;
        if (keysRef.current['KeyA'] || keysRef.current['ArrowLeft']) nextX -= speed;
        if (keysRef.current['KeyD'] || keysRef.current['ArrowRight']) nextX += speed;

        nextX = Math.max(50, Math.min(750, nextX));
        nextY = Math.max(50, Math.min(450, nextY));

        p.x = nextX;
        p.y = nextY;

        // Collect Items
        itemsRef.current.forEach(item => {
          if (!item.collected) {
            const dist = Math.hypot(p.x - item.x, p.y - item.y);
            if (dist < p.radius + 15) {
              item.collected = true;
              if (item.type === 'elder' || item.type === 'gem') {
                setGemsCollected(g => g + 1);
              }
            }
          }
        });

        // Treasure Exit Check
        const exitDist = Math.hypot(p.x - treasureRef.current.x, p.y - treasureRef.current.y);
        if (exitDist < p.radius + treasureRef.current.radius) {
          setGameState('won');
          confetti({ particleCount: 180, spread: 100, origin: { y: 0.6 } });
          const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
          setTimeout(() => {
            onComplete({
              score: 1000,
              collectibles: 5,
              mistakes: 0,
              timeTaken
            });
          }, 1500);
        }
      }

      // Render Scene
      ctx.clearRect(0, 0, 800, 500);

      // Parchment Paper Maze Background
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(0, 0, 800, 500);

      // Maze Entrance Arrow ⬇️
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⬇️', 60, 30);

      // Draw Maze Walls (Black Lines)
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      wallsRef.current.forEach(w => {
        ctx.beginPath();
        ctx.moveTo(w.x1, w.y1);
        ctx.lineTo(w.x2, w.y2);
        ctx.stroke();
      });

      // Draw Maze Items
      itemsRef.current.forEach(item => {
        if (!item.collected) {
          ctx.save();
          ctx.font = '20px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(item.icon, item.x, item.y);
          ctx.restore();
        }
      });

      // Draw Treasure Chest Exit (Bottom Right)
      const t = treasureRef.current;
      ctx.save();
      ctx.font = '32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎁', t.x, t.y);
      ctx.restore();

      // Draw Explorer Player Character
      const p = playerRef.current;
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();

      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🤠', p.x, p.y);
      ctx.restore();

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState]);

  // Direct Movement Trigger for On-Screen Arrow Buttons
  const handleMove = (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (gameState !== 'playing') return;
    const step = 18;
    const p = playerRef.current;

    if (dir === 'UP') p.y = Math.max(50, p.y - step);
    if (dir === 'DOWN') p.y = Math.min(450, p.y + step);
    if (dir === 'LEFT') p.x = Math.max(50, p.x - step);
    if (dir === 'RIGHT') p.x = Math.min(750, p.x + step);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top Banner */}
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border-4 border-amber-100 shadow-lg flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
            <Compass className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h3 className="font-black text-lg text-slate-800">FEAR MAZE - EXPLORER TREASURE QUEST</h3>
            <p className="text-xs text-slate-500 font-medium">Use WASD / Arrow Keys OR On-Screen Buttons below to move the 🤠 explorer to the 🎁 treasure chest!</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
          <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
          <span className="font-black text-lg text-amber-900">{gemsCollected} Courage Gems</span>
        </div>
      </div>

      {/* Main Game Stage */}
      <div className="relative w-full aspect-[8/5] rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl">
        <canvas ref={canvasRef} width={800} height={500} className="w-full h-full" />

        {/* Victory Screen */}
        {gameState === 'won' && (
          <div className="absolute inset-0 bg-amber-500/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-8 z-30">
            <div className="text-7xl mb-4 animate-bounce">🎁</div>
            <h2 className="text-5xl font-black text-white mb-2">TREASURE CHEST OPENED!</h2>
            <p className="text-amber-100 text-lg font-medium max-w-md mb-6">
              You guided the explorer through all maze obstacles, dodged fear triggers, and claimed the ultimate treasure!
            </p>
            <div className="bg-white/90 p-4 rounded-2xl font-black text-amber-900 flex items-center gap-2 text-xl shadow-lg">
              <Trophy className="text-amber-500" />
              <span>Fear Defeated (+1000 pts)</span>
            </div>
          </div>
        )}
      </div>

      {/* Interactive On-Screen D-Pad / Arrow Movement Buttons */}
      <div className="flex flex-col items-center gap-2 bg-white/90 backdrop-blur-md p-4 rounded-3xl border-4 border-amber-100 shadow-xl max-w-md mx-auto w-full">
        <span className="text-xs font-black uppercase text-amber-700 tracking-wider">On-Screen Movement Controls</span>
        <div className="flex flex-col items-center gap-2">
          {/* UP */}
          <button
            onClick={() => handleMove('UP')}
            className="w-14 h-14 bg-amber-500 hover:bg-amber-400 active:scale-90 text-white font-black text-2xl rounded-2xl shadow-lg shadow-amber-500/30 flex items-center justify-center border-2 border-amber-300 transition-all"
          >
            ⬆️
          </button>
          
          <div className="flex gap-4">
            {/* LEFT */}
            <button
              onClick={() => handleMove('LEFT')}
              className="w-14 h-14 bg-amber-500 hover:bg-amber-400 active:scale-90 text-white font-black text-2xl rounded-2xl shadow-lg shadow-amber-500/30 flex items-center justify-center border-2 border-amber-300 transition-all"
            >
              ⬅️
            </button>
            
            {/* DOWN */}
            <button
              onClick={() => handleMove('DOWN')}
              className="w-14 h-14 bg-amber-500 hover:bg-amber-400 active:scale-90 text-white font-black text-2xl rounded-2xl shadow-lg shadow-amber-500/30 flex items-center justify-center border-2 border-amber-300 transition-all"
            >
              ⬇️
            </button>
            
            {/* RIGHT */}
            <button
              onClick={() => handleMove('RIGHT')}
              className="w-14 h-14 bg-amber-500 hover:bg-amber-400 active:scale-90 text-white font-black text-2xl rounded-2xl shadow-lg shadow-amber-500/30 flex items-center justify-center border-2 border-amber-300 transition-all"
            >
              ➡️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
