import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { GameSettings, Mood, GamePerformance } from '../types';
import confetti from 'canvas-confetti';

interface Props {
  mood: Mood;
  settings: GameSettings;
  onComplete: (performance: GamePerformance) => void;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
}

export default function GameCanvas({ mood, settings, onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'won' | 'lost'>('playing');
  const [performance, setPerformance] = useState<GamePerformance>({
    score: 0,
    timeTaken: 0,
    mistakes: 0,
    collectibles: 0
  });

  const safeSettings = {
    difficulty: settings?.difficulty || 5,
    gameSpeed: settings?.gameSpeed || 1,
    weather: settings?.weather || 'clear',
    visualIntensity: settings?.visualIntensity || 5
  };

  // Game Refs to avoid stale closure issues
  const playerRef = useRef({ x: 400, y: 250, radius: 18, color: '#6366f1' });
  const targetPointerRef = useRef<{ x: number; y: number } | null>(null);
  const obstaclesRef = useRef<{ x: number; y: number; radius: number; speed: number; vx: number; vy: number }[]>([]);
  const collectiblesRef = useRef<{ id: number; x: number; y: number; radius: number; collected: boolean }[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  
  const scoreRef = useRef(0);
  const collectiblesCountRef = useRef(0);
  const mistakesRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const lastHitTimeRef = useRef(0);
  const requestRef = useRef<number>(0);
  const keysRef = useRef<{ [key: string]: boolean }>({});

  const TOTAL_COLLECTIBLES = 5;

  const initGame = () => {
    scoreRef.current = 0;
    collectiblesCountRef.current = 0;
    mistakesRef.current = 0;
    startTimeRef.current = Date.now();
    lastHitTimeRef.current = 0;
    targetPointerRef.current = null;
    playerRef.current = { x: 400, y: 250, radius: 18, color: '#6366f1' };
    floatingTextsRef.current = [];

    setPerformance({
      score: 0,
      timeTaken: 0,
      mistakes: 0,
      collectibles: 0
    });

    // Generate obstacles evenly distributed away from center
    const obsCount = Math.min(12, Math.max(4, Math.floor(safeSettings.difficulty * 1.5)));
    obstaclesRef.current = Array.from({ length: obsCount }, () => {
      let x = Math.random() * 700 + 50;
      let y = Math.random() * 400 + 50;
      // keep distance from start player position (400, 250)
      while (Math.hypot(x - 400, y - 250) < 120) {
        x = Math.random() * 700 + 50;
        y = Math.random() * 400 + 50;
      }
      return {
        x,
        y,
        radius: 12 + Math.random() * 14,
        speed: (1.2 + Math.random() * safeSettings.difficulty * 0.4) * safeSettings.gameSpeed,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2
      };
    });

    // Generate 5 collectibles away from center
    collectiblesRef.current = Array.from({ length: TOTAL_COLLECTIBLES }, (_, i) => {
      let x = Math.random() * 680 + 60;
      let y = Math.random() * 380 + 60;
      while (Math.hypot(x - 400, y - 250) < 80) {
        x = Math.random() * 680 + 60;
        y = Math.random() * 380 + 60;
      }
      return {
        id: i,
        x,
        y,
        radius: 12,
        collected: false
      };
    });
  };

  const addFloatingText = (x: number, y: number, text: string, color: string) => {
    floatingTextsRef.current.push({
      id: Date.now() + Math.random(),
      x,
      y,
      text,
      color,
      alpha: 1
    });
  };

  // Keyboard handlers
  useEffect(() => {
    initGame();

    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [mood, settings]);

  // Pointer / Mouse / Touch Handlers
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 500 / rect.height;
    
    targetPointerRef.current = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handlePointerLeave = () => {
    targetPointerRef.current = null;
  };

  // Main Game Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isFinished = false;

    const gameLoop = () => {
      if (gameState === 'playing' && !isFinished) {
        // --- 1. PLAYER MOVEMENT ---
        const moveSpeed = 5 * safeSettings.gameSpeed;
        
        // Key movement
        let moveX = 0;
        let moveY = 0;
        if (keysRef.current['ArrowUp'] || keysRef.current['KeyW']) moveY -= 1;
        if (keysRef.current['ArrowDown'] || keysRef.current['KeyS']) moveY += 1;
        if (keysRef.current['ArrowLeft'] || keysRef.current['KeyA']) moveX -= 1;
        if (keysRef.current['ArrowRight'] || keysRef.current['KeyD']) moveX += 1;

        if (moveX !== 0 || moveY !== 0) {
          const len = Math.hypot(moveX, moveY);
          playerRef.current.x += (moveX / len) * moveSpeed;
          playerRef.current.y += (moveY / len) * moveSpeed;
          // Clear pointer override if using keys
          targetPointerRef.current = null;
        } else if (targetPointerRef.current) {
          // Smooth interpolation towards pointer position
          const dx = targetPointerRef.current.x - playerRef.current.x;
          const dy = targetPointerRef.current.y - playerRef.current.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 3) {
            const step = Math.min(dist, moveSpeed * 1.5);
            playerRef.current.x += (dx / dist) * step;
            playerRef.current.y += (dy / dist) * step;
          }
        }

        // Clamp inside canvas
        playerRef.current.x = Math.max(playerRef.current.radius, Math.min(800 - playerRef.current.radius, playerRef.current.x));
        playerRef.current.y = Math.max(playerRef.current.radius, Math.min(500 - playerRef.current.radius, playerRef.current.y));

        // --- 2. UPDATE OBSTACLES ---
        const now = Date.now();
        obstaclesRef.current.forEach(obs => {
          obs.x += obs.vx * obs.speed;
          obs.y += obs.vy * obs.speed;

          // Bounce off boundaries
          if (obs.x < obs.radius || obs.x > 800 - obs.radius) obs.vx *= -1;
          if (obs.y < obs.radius || obs.y > 500 - obs.radius) obs.vy *= -1;

          // Collision detection with invulnerability cooldown (600ms)
          const dx = playerRef.current.x - obs.x;
          const dy = playerRef.current.y - obs.y;
          const dist = Math.hypot(dx, dy);
          if (dist < playerRef.current.radius + obs.radius) {
            if (now - lastHitTimeRef.current > 600) {
              lastHitTimeRef.current = now;
              mistakesRef.current += 1;
              scoreRef.current = Math.max(0, scoreRef.current - 20);
              addFloatingText(playerRef.current.x, playerRef.current.y - 20, '-20 💥', '#ef4444');
              
              setPerformance(p => ({
                ...p,
                score: scoreRef.current,
                mistakes: mistakesRef.current
              }));
            }
            // Bounce player away
            playerRef.current.x += (dx / (dist || 1)) * 12;
            playerRef.current.y += (dy / (dist || 1)) * 12;
          }
        });

        // --- 3. UPDATE COLLECTIBLES ---
        collectiblesRef.current.forEach(col => {
          if (!col.collected) {
            const dx = playerRef.current.x - col.x;
            const dy = playerRef.current.y - col.y;
            const dist = Math.hypot(dx, dy);
            if (dist < playerRef.current.radius + col.radius) {
              col.collected = true;
              scoreRef.current += 100;
              collectiblesCountRef.current += 1;
              addFloatingText(col.x, col.y - 15, '+100 💎', '#fbbf24');

              const currentScore = scoreRef.current;
              const currentCollectibles = collectiblesCountRef.current;

              setPerformance(p => ({
                ...p,
                score: currentScore,
                collectibles: currentCollectibles
              }));

              // --- 4. WIN CONDITION CHECK ---
              if (currentCollectibles >= TOTAL_COLLECTIBLES) {
                isFinished = true;
                const finalTime = Math.round((Date.now() - startTimeRef.current) / 1000);
                const finalScore = currentScore + 500;
                
                const finalPerf: GamePerformance = {
                  score: finalScore,
                  collectibles: currentCollectibles,
                  mistakes: mistakesRef.current,
                  timeTaken: finalTime
                };

                setPerformance(finalPerf);
                setGameState('won');

                confetti({
                  particleCount: 150,
                  spread: 80,
                  origin: { y: 0.6 }
                });

                setTimeout(() => {
                  onComplete(finalPerf);
                }, 800);
              }
            }
          }
        });

        // Update floating text animations
        floatingTextsRef.current.forEach(ft => {
          ft.y -= 1.2;
          ft.alpha -= 0.02;
        });
        floatingTextsRef.current = floatingTextsRef.current.filter(ft => ft.alpha > 0);
      }

      // --- 5. RENDER CANVAS ---
      ctx.clearRect(0, 0, 800, 500);

      // Background
      ctx.fillStyle = safeSettings.weather === 'rainy' ? '#1e293b' : '#0f172a';
      ctx.fillRect(0, 0, 800, 500);

      // Grid Pattern
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 800; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 500);
        ctx.stroke();
      }
      for (let y = 0; y < 500; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(800, y);
        ctx.stroke();
      }

      // Weather Particles
      if (safeSettings.weather === 'rainy' || safeSettings.weather === 'stormy') {
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
        for (let i = 0; i < 40; i++) {
          const rx = (Math.sin(i * 99 + Date.now() * 0.003) * 0.5 + 0.5) * 800;
          const ry = (Math.cos(i * 33 + Date.now() * 0.005) * 0.5 + 0.5) * 500;
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 2, ry + 12);
          ctx.stroke();
        }
      }

      // Collectibles (Glowing Orbs)
      collectiblesRef.current.forEach(col => {
        if (!col.collected) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(col.x, col.y, col.radius + Math.sin(Date.now() * 0.008) * 2, 0, Math.PI * 2);
          ctx.fillStyle = '#fbbf24';
          ctx.shadowBlur = 18;
          ctx.shadowColor = '#fbbf24';
          ctx.fill();
          ctx.restore();

          // Inner spark
          ctx.beginPath();
          ctx.arc(col.x - 3, col.y - 3, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }
      });

      // Obstacles
      obstaclesRef.current.forEach(obs => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
        ctx.fillStyle = mood === 'Anxiety' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(239, 68, 68, 0.25)';
        ctx.fill();
        ctx.strokeStyle = mood === 'Anxiety' ? '#818cf8' : '#f87171';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
      });

      // Player (Invulnerable flashing when recently hit)
      const isInvulnerable = Date.now() - lastHitTimeRef.current < 600;
      if (!isInvulnerable || Math.floor(Date.now() / 80) % 2 === 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(playerRef.current.x, playerRef.current.y, playerRef.current.radius, 0, Math.PI * 2);
        ctx.fillStyle = playerRef.current.color;
        ctx.shadowBlur = 24;
        ctx.shadowColor = playerRef.current.color;
        ctx.fill();

        // Core highlight
        ctx.beginPath();
        ctx.arc(playerRef.current.x - 4, playerRef.current.y - 4, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();
      }

      // Floating Score Texts
      floatingTextsRef.current.forEach(ft => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.font = 'black 16px sans-serif';
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.x - 20, ft.y);
        ctx.restore();
      });

      requestRef.current = requestAnimationFrame(gameLoop);
    };

    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, settings, mood]);

  return (
    <div className="relative w-full aspect-[8/5] bg-slate-900 rounded-[3rem] overflow-hidden border-8 border-indigo-50 shadow-2xl touch-none">
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={500}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="w-full h-full cursor-crosshair active:cursor-grabbing"
      />
      
      {/* Top Status Bar */}
      <div className="absolute top-6 left-6 flex gap-4 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl border-4 border-indigo-50 shadow-lg">
          <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Score</div>
          <div className="text-2xl font-black text-indigo-900">{performance.score}</div>
        </div>
        <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl border-4 border-yellow-50 shadow-lg">
          <div className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-0.5">Crystals</div>
          <div className="text-2xl font-black text-yellow-600">{performance.collectibles}/{TOTAL_COLLECTIBLES}</div>
        </div>
      </div>

      <div className="absolute top-6 right-6 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border-4 border-indigo-50 shadow-lg text-[10px] font-black text-indigo-500 uppercase tracking-widest">
          {safeSettings.weather} SKY
        </div>
      </div>

      {/* Control Help Bar */}
      <div className="absolute bottom-6 left-6 flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] font-black text-indigo-200 bg-slate-900/80 px-6 py-2.5 rounded-full border-2 border-indigo-500/20 backdrop-blur-md pointer-events-none">
        <span>🖱️ MOVE MOUSE / TOUCH / WASD</span>
        <span>•</span>
        <span>✨ COLLECT ALL 5 ORBS</span>
      </div>

      {/* Victory Overlay */}
      {gameState === 'won' && (
        <div className="absolute inset-0 bg-indigo-950/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-8 z-30">
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 14 }}
            className="space-y-6 max-w-md w-full"
          >
            <div className="text-7xl mb-2 animate-bounce">🏆</div>
            <h2 className="text-5xl font-black text-white tracking-tight">VICTORY!</h2>
            <p className="text-indigo-200 text-lg font-medium">You restored the emotional frequency!</p>
            
            <div className="bg-white p-6 rounded-[2.5rem] grid grid-cols-2 gap-4 shadow-2xl border-4 border-indigo-100">
              <div className="bg-indigo-50/60 p-4 rounded-2xl">
                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total Score</div>
                <div className="text-4xl font-black text-indigo-900">{performance.score}</div>
              </div>
              <div className="bg-orange-50/60 p-4 rounded-2xl">
                <div className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Mistakes</div>
                <div className="text-4xl font-black text-orange-950">{performance.mistakes}</div>
              </div>
            </div>

            <p className="text-xs text-indigo-300 font-bold tracking-wider uppercase animate-pulse">
              Generating your AI analysis...
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}

