import { useEffect, useState } from 'react';
import { Check, Coins, Flame, Headphones, Languages, Mic, Pause, Play, ShieldAlert, Sparkles, Target, Trophy, Volume2 } from 'lucide-react';
import { AIQuest, Mood, PlayerProgress, SafetyCheck } from '../types';

interface Props {
  mood: Mood | null;
  progress: PlayerProgress;
  safety: SafetyCheck | null;
  onProgress: (progress: PlayerProgress) => void;
  onLanguageChange: (language: PlayerProgress['language']) => void;
  onVoiceMessage: (message: string) => void;
}

interface SpeechRecognitionResultEvent extends Event {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

interface SpeechRecognitionInstance {
  lang: string;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
}

const fallbackQuests: AIQuest[] = [
  { id: 'breath', title: 'Return to your breath', description: 'Follow a slow 4-count inhale and 6-count exhale for one minute.', activity: 'breathing', durationMinutes: 1, xp: 40, completed: false },
  { id: 'notice', title: 'Name one steady thing', description: 'Write down one thing you can see, hear, and feel right now.', activity: 'reflection', durationMinutes: 2, xp: 35, completed: false },
  { id: 'focus', title: 'One gentle focus', description: 'Choose one small task and give it five unrushed minutes.', activity: 'focus', durationMinutes: 5, xp: 50, completed: false }
];

export default function NovaHub({ mood, progress, safety, onProgress, onLanguageChange, onVoiceMessage }: Props) {
  const [quests, setQuests] = useState<AIQuest[]>(progress.quests.length ? progress.quests : fallbackQuests);
  const [breathing, setBreathing] = useState(false);
  const [breathCount, setBreathCount] = useState(0);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    if (!breathing) return;
    const timer = window.setInterval(() => setBreathCount(count => count + 1), 1000);
    return () => window.clearInterval(timer);
  }, [breathing]);

  useEffect(() => {
    if (progress.quests.length) setQuests(progress.quests);
  }, [progress.quests]);

  const completeQuest = async (quest: AIQuest) => {
    if (quest.completed) return;
    const nextQuests = quests.map(item => item.id === quest.id ? { ...item, completed: true } : item);
    const nextXp = progress.xp + quest.xp;
    const nextLevel = Math.floor(nextXp / 250) + 1;
    const nextBadges = nextLevel > progress.level && !progress.badges.includes('Level up') ? [...progress.badges, 'Level up'] : progress.badges;
    let recommendations = progress.recommendations;
    try {
      const response = await fetch('/api/recommendation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ activity: quest.activity, mood }) });
      if (response.ok) recommendations = [await response.text(), ...recommendations].slice(0, 3);
    } catch {
      recommendations = ['Try a short walk or a glass of water before your next task.', ...recommendations].slice(0, 3);
    }
    setQuests(nextQuests);
    onProgress({ ...progress, quests: nextQuests, xp: nextXp, level: nextLevel, coins: progress.coins + 10, badges: nextBadges, recommendations });
  };

  const startVoice = () => {
    const SpeechRecognition = (window as Window & { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = progress.language === 'English' ? 'en-IN' : progress.language === 'Hindi' ? 'hi-IN' : progress.language === 'Bengali' ? 'bn-IN' : progress.language === 'Tamil' ? 'ta-IN' : 'te-IN';
    recognition.onresult = event => onVoiceMessage(event.results[0][0].transcript);
    recognition.onend = () => setListening(false);
    setListening(true);
    recognition.start();
  };

  return (
    <section className="grid grid-cols-1 xl:grid-cols-[1.35fr_1fr] gap-6">
      {safety?.needsSupport && <div className="xl:col-span-2 flex gap-4 items-start rounded-3xl border-2 border-rose-200 bg-rose-50 p-5 text-rose-950 shadow-lg" role="alert"><ShieldAlert className="mt-1 h-6 w-6 shrink-0 text-rose-600" /><div><p className="font-black">Nova wants you supported</p><p className="text-sm leading-relaxed">{safety.message}</p></div></div>}
      <div className="rounded-[2rem] border-4 border-white bg-white/90 p-6 shadow-xl">
        <div className="flex items-center justify-between gap-4 mb-5"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">Nova's adaptive plan</p><h2 className="text-2xl font-black text-indigo-950">Today’s quests {mood ? `for ${mood}` : ''}</h2></div><Target className="h-8 w-8 text-indigo-500" /></div>
        <div className="space-y-3">{quests.map(quest => <div key={quest.id} className="flex items-center gap-4 rounded-2xl border-2 border-indigo-50 p-4"><button onClick={() => completeQuest(quest)} aria-label={`Complete ${quest.title}`} className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${quest.completed ? 'bg-emerald-500 text-white' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'}`}><Check className="h-5 w-5" /></button><div className="min-w-0 flex-1"><p className={`font-black ${quest.completed ? 'text-emerald-700 line-through' : 'text-indigo-950'}`}>{quest.title}</p><p className="text-sm text-slate-500">{quest.description}</p></div><span className="text-xs font-black text-amber-600">+{quest.xp} XP</span></div>)}</div>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-black text-slate-600"><span className="flex items-center gap-1"><Trophy className="h-4 w-4 text-amber-500" /> Level {progress.level}</span><span className="flex items-center gap-1"><Coins className="h-4 w-4 text-yellow-500" /> {progress.coins} coins</span><span className="flex items-center gap-1"><Flame className="h-4 w-4 text-orange-500" /> {progress.streak} day streak</span></div>
        {progress.recommendations[0] && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">Nova recommends: {progress.recommendations[0]}</p>}
      </div>
      <div className="space-y-6">
        <div className="rounded-[2rem] border-4 border-white bg-indigo-950 p-6 text-white shadow-xl"><div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-300">Mini-game lab</p><h3 className="text-xl font-black">One-minute reset</h3></div><Sparkles className="h-6 w-6 text-amber-300" /></div><p className="mt-3 text-sm text-indigo-100">{breathing ? `Breathe with Nova. ${breathCount % 10 < 4 ? 'Inhale' : 'Exhale'}...` : 'A tiny breathing game for a quick nervous-system reset.'}</p><button onClick={() => { setBreathing(value => !value); if (breathing) setBreathCount(0); }} className="mt-4 flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-black text-indigo-950">{breathing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} {breathing ? 'Pause reset' : 'Start reset'}</button></div>
        <div className="rounded-[2rem] border-4 border-white bg-white/90 p-6 shadow-xl"><div className="flex items-center justify-between"><h3 className="font-black text-indigo-950">Talk to Nova</h3><Headphones className="h-5 w-5 text-indigo-500" /></div><div className="mt-4 flex gap-2"><button onClick={startVoice} disabled={listening} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-3 text-sm font-black text-white disabled:opacity-50"><Mic className="h-4 w-4" /> {listening ? 'Listening...' : 'Speak'}</button><button onClick={() => window.speechSynthesis?.speak(new SpeechSynthesisUtterance('I am here with you. We can take this one step at a time.'))} className="rounded-xl bg-indigo-100 px-3 text-indigo-700" aria-label="Nova speaks"><Volume2 className="h-4 w-4" /></button></div><label className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-600"><Languages className="h-4 w-4" /><select value={progress.language} onChange={event => onLanguageChange(event.target.value as PlayerProgress['language'])} className="rounded-lg border border-indigo-100 bg-white p-2"><option>English</option><option>Hindi</option><option>Bengali</option><option>Tamil</option><option>Telugu</option></select></label></div>
      </div>
    </section>
  );
}