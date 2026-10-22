export type Mood = 'Happy' | 'Sad' | 'Lonely' | 'Angry' | 'Fear' | 'Stress' | 'Anxiety';

export interface MoodAnalysis {
  intensity: number;
  keywords: string[];
  detectedEmotion: string;
  recommendation: string;
  stressLevel: number;
  anxietyLevel: number;
  confidence: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  model?: string;
  provider?: 'local-demo' | 'gemini+local-classifier';
  probabilities?: Record<string, number>;
  disclaimer?: string;
}

export interface GameSettings {
  difficulty: number;
  weather: 'sunny' | 'rainy' | 'stormy' | 'foggy' | 'clear';
  musicTempo: number;
  npcBehavior: 'friendly' | 'calm' | 'anxious' | 'neutral';
  gameSpeed: number;
  visualIntensity: number;
}

export interface WorldContext {
  worldName: string;
  description: string;
  environmentDescription: string;
  introductionMessage: string;
  settings: GameSettings;
}

export interface Message {
  role: 'user' | 'nova';
  content: string;
}

export interface GamePerformance {
  score: number;
  timeTaken: number;
  mistakes: number;
  collectibles: number;
}

export interface GameState {
  step: 'mood-selection' | 'intro-message' | 'world-generation' | 'exploration' | 'mini-game' | 'completion';
  mood: Mood | null;
  initialMessage: string;
  analysis: MoodAnalysis | null;
  world: WorldContext | null;
  messages: Message[];
  crystals: string[];
  performance: GamePerformance;
}

export interface AIQuest {
  id: string;
  title: string;
  description: string;
  activity: 'breathing' | 'focus' | 'memory' | 'reflection' | 'connection';
  durationMinutes: number;
  xp: number;
  completed: boolean;
}

export interface PlayerProgress {
  xp: number;
  level: number;
  coins: number;
  streak: number;
  badges: string[];
  quests: AIQuest[];
  recommendations: string[];
  language: 'English' | 'Hindi' | 'Bengali' | 'Tamil' | 'Telugu';
}

export interface SafetyCheck {
  needsSupport: boolean;
  message: string;
}

// Game Specific Data Structures
export interface LonelyNPC {
  id: string;
  name: string;
  avatar: string;
  hobby: string;
  dialogue: string;
  matchedId?: string;
  x: number;
  y: number;
}

export interface StressTask {
  id: string;
  title: string;
  category: 'Study' | 'Sleep' | 'Exercise' | 'Relax' | 'Family' | 'Work';
  durationHours: number;
  stressImpact: number; // positive = adds stress, negative = reduces stress
  icon: string;
}

export interface AngerConflictScenario {
  id: string;
  npc1Name: string;
  npc2Name: string;
  situation: string;
  options: {
    text: string;
    isDeescalating: boolean;
    explanation: string;
  }[];
}

export interface SadnessMemory {
  id: string;
  quote: string;
  theme: string;
  unlocked: boolean;
}

export interface FearMazeHint {
  stepIndex: number;
  hintMessage: string;
  direction: 'North' | 'South' | 'East' | 'West';
}

export interface HappyFestivalQuest {
  id: string;
  title: string;
  reqType: 'flower' | 'light' | 'music' | 'snack';
  points: number;
  completed: boolean;
}
