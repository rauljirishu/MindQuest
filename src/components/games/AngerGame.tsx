import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GamePerformance } from '../../types';
import confetti from 'canvas-confetti';
import { Flame, Heart, Sparkles, Droplet, Shield, Trophy } from 'lucide-react';

interface Props {
  initialMessage?: string;
  analysis?: any;
  onComplete: (performance: GamePerformance) => void;
}

interface Fireball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  text: string;
}

interface WaterShot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export default function AngerGame({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [transformedCount, setTransformedCount] = useState(0);
  const [heatMeter, setHeatMeter] = useState(80);
  const [gameState, setGameState] = useState<'playing' | 'won'>('playing');

  const mouseRef = useRef({ x: 400, y: 250 });
  const fireballsRef = useRef<Fireball[]>([]);
  const shotsRef = useRef<WaterShot[]>([]);
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef(Date.now());

  // Initialize falling fireballs
  useEffect(() => {
    const angerWords = ['RAGE', 'INSULT', 'BLAME', 'SPITE', 'HOSTILITY', 'OUTRAGE'];
    const initial: Fireball[] = [];
    for (let i = 0; i < 6; i++) {
      initial.push({
        id: i + 1,
        x: 100 + i * 110,
        y: 80 + (i % 2) * 50,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        radius: 26,
        text: angerWords[i % angerWords.length]
      });
    }
    fireballsRef.current = initial;
  }, []);

  // Click / Mouse Aim to shoot Water Droplet
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const targetX = e.clientX - rect.left;
    const targetY = e.clientY - rect.top;

    const startX = 400;
    const startY = 460;
    const angle = Math.atan2(targetY - startY, targetX - startX);

    shotsRef.current.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * 10,
      vy: Math.sin(angle) * 10,
      radius: 12
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  // Main Canvas Physics & Collision Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      if (gameState === 'playing') {
        // Move Fireballs
        fireballsRef.current.forEach(f => {
          f.x += f.vx;
          f.y += f.vy;

          if (f.x < 30 || f.x > 770) f.vx *= -1;
          if (f.y < 30 || f.y > 350) f.vy *= -1;
        });

        // Move Water Shots & Collision Check
        for (let i = shotsRef.current.length - 1; i >= 0; i--) {
          const s = shotsRef.current[i];
          s.x += s.vx;
          s.y += s.vy;

          // Check hit against fireballs
          for (let j = fireballsRef.current.length - 1; j >= 0; j--) {
            const f = fireballsRef.current[j];
            const dist = Math.hypot(s.x - f.x, s.y - f.y);
            if (dist < s.radius + f.radius) {
              // Hit! Transform fireball into calm bubble
              fireballsRef.current.splice(j, 1);
              shotsRef.current.splice(i, 1);

              setHeatMeter(h => Math.max(0, h - 15));
              setTransformedCount(c => {
                const next = c + 1;
                if (next >= 6) {
                  setGameState('won');
                  confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
                  const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
                  setTimeout(() => {
                    onComplete({
                      score: 1000,
                      collectibles: 6,
                      mistakes: 0,
                      timeTaken
                    });
                  }, 1500);
                }
                return next;
              });
              break;
            }
          }

          // Remove out of bounds shots
          if (s.y < 0 || s.x < 0 || s.x > 800) {
            shotsRef.current.splice(i, 1);
          }
        }
      }

      // Render Scene
      ctx.clearRect(0, 0, 800, 500);

      // Lava / Cool Water Background
      ctx.fillStyle = heatMeter > 30 ? '#450a0a' : '#0284c7';
      ctx.fillRect(0, 0, 800, 500);

      // Draw Falling Anger Fireballs
      fireballsRef.current.forEach(f => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#f87171';
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(f.text, f.x, f.y);
        ctx.restore();
      });

      // Draw Water Shots
      shotsRef.current.forEach(s => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#38bdf8';
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💧', s.x, s.y);
        ctx.restore();
      });

      // Draw Water Launcher Cannon at bottom
      ctx.save();
      ctx.beginPath();
      ctx.arc(400, 480, 24, 0, Math.PI * 2);
      ctx.fillStyle = '#0ea5e9';
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🌊', 400, 480);
      ctx.restore();

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, heatMeter]);

  return (
    <div className="flex flex-col gap-4">
      {/* Top Banner */}
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border-4 border-rose-100 shadow-lg flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
            <Flame className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h3 className="font-black text-lg text-slate-800">PEACE SHOOTER - TRANSFORM ANGER FIREBALLS</h3>
            <p className="text-xs text-slate-500 font-medium">Click on screen to launch 💧 water droplets & 💖 calming energy at falling anger fireballs!</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100">
          <Droplet className="w-5 h-5 text-sky-500 fill-sky-500" />
          <span className="font-black text-lg text-rose-900">{transformedCount} / 6 Transformed</span>
        </div>
      </div>

      {/* Main Game Canvas */}
      <div className="relative w-full aspect-[8/5] rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl">
        <canvas ref={canvasRef} width={800} height={500} onClick={handleCanvasClick} onMouseMove={handleMouseMove} className="w-full h-full cursor-crosshair" />

        {/* Victory Screen */}
        {gameState === 'won' && (
          <div className="absolute inset-0 bg-sky-500/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-8 z-30">
            <div className="text-7xl mb-4 animate-bounce">🌊</div>
            <h2 className="text-5xl font-black text-white mb-2">VOLCANO COOLED & CALMED!</h2>
            <p className="text-sky-100 text-lg font-medium max-w-md mb-6">
              You transformed all anger fireballs into peaceful bubbles! Channelling frustrated energy into active calm calms the mind.
            </p>
            <div className="bg-white/90 p-4 rounded-2xl font-black text-sky-900 flex items-center gap-2 text-xl shadow-lg">
              <Trophy className="text-amber-500" />
              <span>6 / 6 Fireballs Transformed (+1000 pts)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
