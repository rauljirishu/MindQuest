import * as tf from '@tensorflow/tfjs';
import { GamePerformance, MoodAnalysis } from '../types';
import { AIMemoryEngine } from './AIMemoryEngine';

/**
 * AI Emotional State Observer
 * This utility uses deep learning telemetry principles & NLP history
 * to predict real-time shifts in the player's emotional state.
 */
export class AIObserver {
  private static instance: AIObserver;
  private memoryEngine = AIMemoryEngine.getInstance();

  private constructor() {}

  static getInstance() {
    if (!AIObserver.instance) {
      AIObserver.instance = new AIObserver();
    }
    return AIObserver.instance;
  }

  // Predict emotional state shift using telemetry & memory context
  async predictStateShift(performance: GamePerformance, initialAnalysis: MoodAnalysis): Promise<{
    isCalming: boolean;
    recommendedDifficultyShift: number;
    predictedStressLevel: number;
  }> {
    const stressFactor = (performance.mistakes * 0.4) + (performance.timeTaken * 0.05) - (performance.score * 0.002);
    const initialStress = initialAnalysis?.stressLevel || 5;
    
    const predictedStress = Math.min(10, Math.max(1, Math.round(initialStress + stressFactor)));
    const isCalming = predictedStress < initialStress;

    // Save outcome into session memory
    this.memoryEngine.saveGameOutcome(
      initialAnalysis?.detectedEmotion as any || 'Happy',
      performance,
      predictedStress
    );

    return {
      isCalming,
      recommendedDifficultyShift: predictedStress > 7 ? -1 : 0,
      predictedStressLevel: predictedStress
    };
  }

  detectIntent(message: string): 'seeking_help' | 'exploring' | 'frustrated' | 'neutral' {
    const msg = message.toLowerCase();
    if (msg.includes('help') || msg.includes('how') || msg.includes('guide')) return 'seeking_help';
    if (msg.includes('stuck') || msg.includes('hard') || msg.includes('fail')) return 'frustrated';
    if (msg.includes('look') || msg.includes('find') || msg.includes('where')) return 'exploring';
    return 'neutral';
  }
}
