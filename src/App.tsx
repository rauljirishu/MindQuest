/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  CloudRain, 
  Wind, 
  Zap, 
  Ghost, 
  Sun, 
  Smile, 
  Sparkles, 
  MessageCircle, 
  ChevronRight,
  RefreshCw,
  Trophy,
  Brain,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { cn } from './lib/utils';
import { Mood, GameState, Message, MoodAnalysis, WorldContext, GamePerformance, PlayerProgress, SafetyCheck } from './types';

// Components
import MoodSelector from './components/MoodSelector';
import ChatWindow from './components/ChatWindow';
import WorldView from './components/WorldView';
import GameContainer from './components/GameContainer';
import AIDashboard from './components/AIDashboard';
import { AIObserver } from './lib/AIObserver';
import { NLPPipeline } from './lib/NLPPipeline';
import { DeepLearningAnalytics } from './lib/DeepLearningAnalytics';
import { AIMemoryEngine } from './lib/AIMemoryEngine';
import NovaHub from './components/NovaHub';

const defaultProgress: PlayerProgress = { xp: 0, level: 1, coins: 100, streak: 1, badges: [], quests: [], recommendations: [], language: 'English' };

const getStoredProgress = (): PlayerProgress => {
  try {
    const stored = localStorage.getItem('mindquest-player-progress');
    return stored ? { ...defaultProgress, ...JSON.parse(stored) } : defaultProgress;
  } catch {
    return defaultProgress;
  }
};

const getSafetyCheck = (message: string): SafetyCheck | null => /suicide|kill myself|self[- ]harm|hurt myself|end my life|don't want to live/i.test(message)
  ? { needsSupport: true, message: 'If you may hurt yourself or are in immediate danger, contact local emergency services now. You can also reach a trusted person or a licensed crisis professional and stay with someone you trust.' }
  : null;

export default function App() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<{ isCalming: boolean, predictedStressLevel: number } | null>(null);
  const [aiEnding, setAiEnding] = useState<{ endingTitle: string; novaSpeech: string; emotionalShift: string; realWorldAction: string } | null>(null);
  const [gameState, setGameState] = useState<GameState>(() => {
    const savedCrystals = localStorage.getItem('mindquest-crystals');
    return {
      step: 'mood-selection',
      mood: null,
      initialMessage: '',
      analysis: null,
      world: null,
      messages: [],
      crystals: savedCrystals ? JSON.parse(savedCrystals) : [],
      performance: { score: 0, timeTaken: 0, mistakes: 0, collectibles: 0 }
    };
  });

  useEffect(() => {
    localStorage.setItem('mindquest-crystals', JSON.stringify(gameState.crystals));
  }, [gameState.crystals]);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<PlayerProgress>(getStoredProgress);
  const [safety, setSafety] = useState<SafetyCheck | null>(null);

  useEffect(() => {
    localStorage.setItem('mindquest-player-progress', JSON.stringify(progress));
  }, [progress]);

  const handleMoodSelect = async (mood: Mood, message: string) => {
    setLoading(true);
    setSafety(getSafetyCheck(message));
    try {
      // Run NLP Pipeline & Deep Learning Vector update
      const nlpRes = NLPPipeline.getInstance().processText(message || mood);
      DeepLearningAnalytics.getInstance().updateVectorFromNLP(nlpRes);
      AIMemoryEngine.getInstance().saveMoodEntry(mood, message, {
        intensity: Math.max(1, Math.min(10, Math.round(nlpRes.stressScore / 10))), keywords: nlpRes.keywords,
        detectedEmotion: mood, recommendation: 'Take one small, kind step.', stressLevel: Math.round(nlpRes.stressScore / 10),
        anxietyLevel: Math.round(nlpRes.anxietyScore / 10), confidence: Math.round(nlpRes.emotionConfidenceScore / 10),
        sentiment: nlpRes.sentiment.label.toLowerCase() as MoodAnalysis['sentiment']
      });

      // 1. Analyze Mood with AI
      const analysisRes = await fetch('/api/analyze-mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, message })
      });
      
      let analysis: MoodAnalysis;
      if (analysisRes.ok) {
        analysis = await analysisRes.json();
      } else {
        // Fallback for quota issues
        analysis = {
          intensity: 5,
          keywords: ['unknown'],
          detectedEmotion: mood,
          recommendation: "Focus on your breath and find your center.",
          stressLevel: 5,
          anxietyLevel: 5,
          confidence: 5,
          sentiment: 'neutral'
        };
      }

      // 2. Generate World & Adaptive Settings
      const worldRes = await fetch('/api/generate-world', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, analysis })
      });
      
      let world: WorldContext;
      if (worldRes.ok) {
        world = await worldRes.json();
      } else {
        // Fallback world
        world = {
          worldName: `The Realm of ${mood}`,
          description: "A mysterious space shaped by your thoughts.",
          environmentDescription: "Ethereal mists and shifting light.",
          introductionMessage: `Welcome. I am Nova. I sense your ${mood.toLowerCase()} energy. Let's find balance together.`,
          settings: {
            difficulty: 5,
            weather: 'clear',
            musicTempo: 80,
            npcBehavior: 'calm',
            gameSpeed: 1,
            visualIntensity: 5
          }
        };
      }

      const questRes = await fetch('/api/generate-quests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, analysis, memory: AIMemoryEngine.getInstance().getFormattedMemoryContext() })
      });
      if (questRes.ok) {
        const quests = await questRes.json();
        setProgress(prev => ({ ...prev, quests }));
      }

      setGameState(prev => ({
        ...prev,
        step: 'mini-game',
        mood,
        initialMessage: message,
        analysis,
        world,
        messages: [{ role: 'nova', content: world.introductionMessage }]
      }));
    } catch (error) {
      console.error("Setup failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGameComplete = async (performance: GamePerformance) => {
    const observer = AIObserver.getInstance();
    const feedback = await observer.predictStateShift(performance, gameState.analysis!);
    setAiFeedback(feedback);
    DeepLearningAnalytics.getInstance().updateVectorFromGameOutcome(gameState.mood || 'Balance', performance);
    AIMemoryEngine.getInstance().saveGameOutcome(gameState.mood || 'Happy', performance, feedback.predictedStressLevel);
    setProgress(prev => ({ ...prev, xp: prev.xp + Math.max(25, Math.round(performance.score / 10)), coins: prev.coins + 25 }));

    // Fetch dynamic AI ending story
    try {
      const res = await fetch('/api/generate-ending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: gameState.mood,
          message: gameState.initialMessage,
          performance,
          analysis: gameState.analysis
        })
      });
      if (res.ok) {
        const endingData = await res.json();
        setAiEnding(endingData);
      }
    } catch (e) {
      console.error("Ending generation error:", e);
    }

    setGameState(prev => ({
      ...prev,
      performance,
      step: 'completion',
      crystals: [...prev.crystals, prev.mood || 'Balance']
    }));
  };

  const addMessage = async (content: string) => {
    setSafety(getSafetyCheck(content));
    const newMessage: Message = { role: 'user', content };
    const updatedMessages = [...gameState.messages, newMessage];
    
    setGameState(prev => ({ ...prev, messages: updatedMessages }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: updatedMessages, 
          mood: gameState.mood,
          worldContext: gameState.world
        })
      });
      const data = await res.json();
      setGameState(prev => ({ 
        ...prev, 
        messages: [...prev.messages, { role: 'nova', content: data.content }] 
      }));
    } catch (error) {
      console.error("Chat failed:", error);
    }
  };

  const handleVoiceMessage = (content: string) => {
    addMessage(content);
  };

  const nextStep = () => {
    if (gameState.step === 'world-generation') setGameState(prev => ({ ...prev, step: 'exploration' }));
    else if (gameState.step === 'exploration') setGameState(prev => ({ ...prev, step: 'mini-game' }));
    else if (gameState.step === 'mini-game') {
      const newCrystal = gameState.mood || 'Balance';
      setGameState(prev => ({ 
        ...prev, 
        step: 'completion', 
        crystals: [...prev.crystals, newCrystal] 
      }));
    }
  };

  const resetGame = () => {
    setAiFeedback(null);
    setGameState({
      step: 'mood-selection',
      mood: null,
      initialMessage: '',
      analysis: null,
      world: null,
      messages: [],
      crystals: gameState.crystals,
      performance: { score: 0, timeTaken: 0, mistakes: 0, collectibles: 0 }
    });
  };

  return (
    <div className="min-h-screen bg-[#F0F4FF] text-slate-900 font-sans selection:bg-indigo-200 relative overflow-x-hidden overflow-y-auto">
      {/* Playful Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-blue-200/50 blur-[80px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, -8, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-pink-200/50 blur-[100px] rounded-full" 
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-6 min-h-screen flex flex-col">
        <header className="flex justify-between items-center mb-6 bg-white/80 backdrop-blur-xl border-4 border-white p-4 rounded-[2rem] shadow-xl">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg cursor-pointer"
            >
              <Sparkles className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-indigo-900 flex items-center gap-2">
                MindQuest <span className="text-3xl">✨</span>
              </h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Nova is Awake!</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowDashboard(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-2xl transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <Brain className="w-4 h-4" /> AI Dashboard & Vector Graph
            </button>

            <div className="hidden md:flex gap-3">
              {[...Array(7)].map((_, i) => (
                <motion.div 
                  key={i}
                  initial={false}
                  animate={{ 
                    scale: i < gameState.crystals.length ? [1, 1.3, 1] : 1,
                    rotate: i < gameState.crystals.length ? 360 : 0
                  }}
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-700 shadow-md",
                    i < gameState.crystals.length 
                      ? "bg-yellow-400 text-white" 
                      : "bg-white border-2 border-dashed border-indigo-100"
                  )}
                >
                  {i < gameState.crystals.length ? "💎" : ""}
                </motion.div>
              ))}
            </div>
            <div className="h-8 w-1 bg-indigo-50" />
            <button 
              onClick={resetGame}
              className="p-3 hover:bg-indigo-50 rounded-2xl transition-all text-indigo-400 hover:text-indigo-600 active:scale-90"
            >
              <RefreshCw className="w-6 h-6" />
            </button>
          </div>
        </header>

        <div className="mb-6">
          <NovaHub
            mood={gameState.mood}
            progress={progress}
            safety={safety}
            onProgress={setProgress}
            onLanguageChange={language => setProgress(prev => ({ ...prev, language }))}
            onVoiceMessage={handleVoiceMessage}
          />
        </div>

        <AnimatePresence mode="wait">
          {gameState.step === 'mood-selection' && (
            <motion.div
              key="mood-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col justify-center py-6"
            >
              <div className="text-center mb-10">
                <h2 className="text-4xl font-extrabold mb-4">How are you feeling today?</h2>
                <p className="text-slate-400 text-lg max-w-xl mx-auto">
                  Every journey begins with a single step. Choose the emotion that resonates with you most right now.
                </p>
              </div>
              <MoodSelector onSelect={handleMoodSelect} loading={loading} />
            </motion.div>
          )}

          {gameState.step === 'world-generation' && (
            <motion.div
              key="world-gen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex-1 flex flex-col items-center justify-center text-center space-y-8 py-12"
            >
              <div className="w-24 h-24 rounded-full bg-indigo-500/20 flex items-center justify-center animate-pulse">
                <Compass className="w-12 h-12 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">Creating {gameState.world?.worldName}...</h2>
                <p className="text-slate-400">{gameState.world?.description}</p>
              </div>
              <button
                onClick={nextStep}
                className="px-8 py-3 bg-white text-slate-950 font-bold rounded-full hover:bg-slate-200 transition-colors flex items-center gap-2"
              >
                Enter the World <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {(gameState.step === 'exploration' || gameState.step === 'mini-game') && (
            <motion.div
              key="gameplay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col gap-6 py-4"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* Left Panel: Chat & Nova */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                  <WorldView world={gameState.world!} mood={gameState.mood!} analysis={gameState.analysis} />
                  <div className="flex-1 min-h-0">
                    <ChatWindow 
                      messages={gameState.messages} 
                      onSendMessage={addMessage} 
                      novaIntro={gameState.world?.introductionMessage}
                    />
                  </div>
                </div>

                {/* Right Panel: The Game */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  {gameState.step === 'exploration' ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', damping: 15 }}
                      className="bg-white border-8 border-indigo-100 rounded-[3rem] p-12 flex-1 flex flex-col justify-center items-center text-center relative overflow-hidden shadow-2xl shadow-indigo-200"
                    >
                      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-blue-50 to-transparent" />
                      
                      <motion.div 
                        animate={{ 
                          y: [0, -20, 0],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-32 h-32 rounded-full bg-white shadow-xl flex items-center justify-center mb-8 border-4 border-indigo-50 relative z-10"
                      >
                        <Brain className="w-16 h-16 text-indigo-500" />
                        <div className="absolute -top-2 -right-2 text-4xl">🎮</div>
                      </motion.div>

                      <h3 className="text-4xl font-black mb-4 text-indigo-950">MISSION: RESTORE JOY!</h3>
                      <p className="text-slate-500 mb-12 text-xl font-medium max-w-sm">
                        Nova has crafted a special game just for your mood! Are you ready to play?
                      </p>

                      <div className="grid grid-cols-2 gap-6 w-full max-w-md mb-12">
                        <div className="bg-indigo-50 p-6 rounded-3xl border-4 border-indigo-100 text-center">
                          <div className="text-3xl mb-1">⭐</div>
                          <div className="text-sm font-black text-indigo-300 uppercase tracking-widest">Level</div>
                          <div className="text-3xl font-black text-indigo-900">{gameState.world?.settings?.difficulty}</div>
                        </div>
                        <div className="bg-orange-50 p-6 rounded-3xl border-4 border-orange-100 text-center">
                          <div className="text-3xl mb-1">☁️</div>
                          <div className="text-sm font-black text-orange-300 uppercase tracking-widest">Sky</div>
                          <div className="text-3xl font-black text-orange-900 capitalize">{gameState.world?.settings?.weather}</div>
                        </div>
                      </div>

                      <button 
                        onClick={nextStep}
                        className="group relative px-16 py-6 bg-indigo-600 text-white font-black text-2xl rounded-[2rem] transition-all hover:scale-110 active:scale-95 shadow-xl shadow-indigo-200"
                      >
                        <div className="relative z-10 flex items-center gap-3">
                          LET'S GO! 🚀
                        </div>
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex-1 flex flex-col"
                    >
                      <GameContainer 
                        mood={gameState.mood!} 
                        settings={gameState.world!.settings} 
                        initialMessage={gameState.initialMessage}
                        analysis={gameState.analysis}
                        onComplete={handleGameComplete} 
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {gameState.step === 'completion' && (
            <motion.div
              key="completion"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500/30 blur-3xl rounded-full animate-pulse" />
                <Trophy className="w-24 h-24 text-amber-400 relative z-10" />
              </div>
              <div>
                <h2 className="text-4xl font-black mb-4">Crystal Collected!</h2>
                <p className="text-slate-400 text-lg max-w-md mx-auto mb-8">
                  You've restored a piece of the Tree of Balance. Your journey towards resilience continues.
                </p>
                
                {aiFeedback && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', damping: 12 }}
                    className="bg-white border-8 border-indigo-100 rounded-[3rem] p-8 mb-8 max-w-md mx-auto shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 text-4xl">🧠</div>
                    <div className="flex items-center gap-3 mb-6 justify-start">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
                        <Brain className="w-6 h-6 text-indigo-500" />
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 block">AI Lab Notes</span>
                        <span className="text-lg font-black text-indigo-950">Emotional Shift</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-indigo-50/50 p-4 rounded-2xl">
                        <span className="font-bold text-indigo-400">Pattern</span>
                        <span className={cn("text-xl font-black", aiFeedback.isCalming ? "text-green-500" : "text-blue-500")}>
                          {aiFeedback.isCalming ? "CALMING DOWN 🌿" : "STAYING FOCUSED 🔥"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-orange-50/50 p-4 rounded-2xl">
                        <span className="font-bold text-orange-400">Stress Gauge</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-4 bg-orange-200 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${aiFeedback.predictedStressLevel * 10}%` }}
                              className="h-full bg-orange-500"
                            />
                          </div>
                          <span className="font-black text-orange-950">{aiFeedback.predictedStressLevel}/10</span>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border-2 border-indigo-50 text-left relative">
                        <div className="absolute -top-3 left-4 px-2 bg-white text-[9px] font-black text-indigo-400 uppercase">
                          {aiEnding?.endingTitle || "Nova says"}
                        </div>
                        <p className="text-sm font-medium text-slate-600 leading-relaxed italic mb-2">
                          "{aiEnding?.novaSpeech || 'I saw how you handled those challenges. Your persistence is actually a superpower, did you know?'}"
                        </p>
                        {aiEnding?.realWorldAction && (
                          <div className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 mt-2">
                            🌿 Real-World Action: {aiEnding.realWorldAction}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={resetGame}
                  className="px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" /> Explore Another Mood
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {showDashboard && <AIDashboard onClose={() => setShowDashboard(false)} />}
      </main>
    </div>
  );
}

