import { Mood, MoodAnalysis, GamePerformance } from '../types';

export interface PlayerSessionMemory {
  pastMoods: Mood[];
  userMessages: string[];
  lastAnalysis: MoodAnalysis | null;
  completedGames: { mood: Mood; score: number; stressLevel: number }[];
  sessionCount: number;
}

export class AIMemoryEngine {
  private static instance: AIMemoryEngine;
  private memoryKey = 'mindquest-ai-session-memory';

  private constructor() {}

  static getInstance(): AIMemoryEngine {
    if (!AIMemoryEngine.instance) {
      AIMemoryEngine.instance = new AIMemoryEngine();
    }
    return AIMemoryEngine.instance;
  }

  getMemory(): PlayerSessionMemory {
    try {
      const stored = localStorage.getItem(this.memoryKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to parse AI memory:", e);
    }

    return {
      pastMoods: [],
      userMessages: [],
      lastAnalysis: null,
      completedGames: [],
      sessionCount: 1
    };
  }

  saveMoodEntry(mood: Mood, message: string, analysis: MoodAnalysis) {
    const mem = this.getMemory();
    mem.pastMoods.push(mood);
    mem.userMessages.push(message);
    mem.lastAnalysis = analysis;
    mem.sessionCount += 1;
    localStorage.setItem(this.memoryKey, JSON.stringify(mem));
  }

  saveGameOutcome(mood: Mood, performance: GamePerformance, predictedStress: number) {
    const mem = this.getMemory();
    mem.completedGames.push({
      mood,
      score: performance.score,
      stressLevel: predictedStress
    });
    localStorage.setItem(this.memoryKey, JSON.stringify(mem));
  }

  getFormattedMemoryContext(): string {
    const mem = this.getMemory();
    if (mem.pastMoods.length === 0) return "This is the player's first session with Nova.";

    const lastMoods = mem.pastMoods.slice(-3).join(', ');
    const lastMsg = mem.userMessages.slice(-1)[0] || '';
    const totalGames = mem.completedGames.length;

    return `Player Session Context: Has played ${totalGames} games. Recent moods: [${lastMoods}]. Last stated thought: "${lastMsg}".`;
  }
}
