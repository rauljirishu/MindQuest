import { Mood, GameSettings, GamePerformance, MoodAnalysis } from '../types';
import LonelyGame from './games/LonelyGame';
import AnxietyGame from './games/AnxietyGame';
import StressGame from './games/StressGame';
import AngerGame from './games/AngerGame';
import SadnessGame from './games/SadnessGame';
import FearGame from './games/FearGame';
import HappyGame from './games/HappyGame';

interface Props {
  mood: Mood;
  settings: GameSettings;
  initialMessage?: string;
  analysis?: MoodAnalysis | null;
  onComplete: (performance: GamePerformance) => void;
}

export default function GameContainer({ mood, settings, initialMessage, analysis, onComplete }: Props) {
  switch (mood) {
    case 'Lonely':
      return <LonelyGame initialMessage={initialMessage} analysis={analysis} onComplete={onComplete} />;
    case 'Anxiety':
      return <AnxietyGame initialMessage={initialMessage} analysis={analysis} onComplete={onComplete} />;
    case 'Stress':
      return <StressGame initialMessage={initialMessage} analysis={analysis} onComplete={onComplete} />;
    case 'Angry':
      return <AngerGame initialMessage={initialMessage} analysis={analysis} onComplete={onComplete} />;
    case 'Sad':
      return <SadnessGame initialMessage={initialMessage} analysis={analysis} onComplete={onComplete} />;
    case 'Fear':
      return <FearGame initialMessage={initialMessage} analysis={analysis} onComplete={onComplete} />;
    case 'Happy':
    default:
      return <HappyGame initialMessage={initialMessage} analysis={analysis} onComplete={onComplete} />;
  }
}
