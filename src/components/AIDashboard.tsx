import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, Tooltip, Legend 
} from 'recharts';
import { DeepLearningAnalytics, PlayerEmbeddingVector, TimelineDataPoint, DeepLearningPredictions } from '../lib/DeepLearningAnalytics';
import { Brain, Activity, TrendingUp, ShieldCheck, Moon, Flame, Heart, Sparkles, Trophy, Award, Zap, RefreshCw } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function AIDashboard({ onClose }: Props) {
  const analyticsEngine = DeepLearningAnalytics.getInstance();
  const [vector, setVector] = useState<PlayerEmbeddingVector>(analyticsEngine.getEmbedding());
  const [timeline, setTimeline] = useState<TimelineDataPoint[]>(analyticsEngine.getTimeline());
  const [predictions, setPredictions] = useState<DeepLearningPredictions>(analyticsEngine.getPredictiveAnalytics());

  const refreshData = () => {
    setVector(analyticsEngine.getEmbedding());
    setTimeline(analyticsEngine.getTimeline());
    setPredictions(analyticsEngine.getPredictiveAnalytics());
  };

  const radarData = [
    { trait: 'Hope', score: vector.hope },
    { trait: 'Confidence', score: vector.confidence },
    { trait: 'Energy', score: vector.energy },
    { trait: 'Recovery', score: vector.recovery },
    { trait: 'Calmness', score: Math.max(10, 100 - vector.anxiety) },
    { trait: 'Balance', score: Math.max(10, 100 - vector.stress) }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl overflow-y-auto p-4 sm:p-8 text-slate-100 flex flex-col items-center">
      <div className="max-w-6xl w-full space-y-8 pb-12">
        {/* Top Control Navigation */}
        <div className="flex justify-between items-center bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-indigo-400">MindQuest AI Analytics</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">Live Deep Learning Vector</span>
              </div>
              <h2 className="text-2xl font-black text-white">Clinical AI Dashboard</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={refreshData}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700 flex items-center gap-2 text-xs font-bold"
            >
              <RefreshCw className="w-4 h-4" /> Sync Analytics
            </button>
            <button 
              onClick={onClose}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/30 text-xs"
            >
              ✕ Exit Dashboard
            </button>
          </div>
        </div>

        {/* Top Key Performance Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold mb-2">
              <span>Predicted Tomorrow Mood</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-lg font-black text-white truncate">{predictions.tomorrowMood}</div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1">AI Confidence: {predictions.aiConfidencePercent}%</div>
          </div>

          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold mb-2">
              <span>Burnout Risk Index</span>
              <Flame className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400">{predictions.burnoutRiskPercent}%</div>
            <div className="text-[11px] text-slate-400 font-semibold mt-1">Target: &lt; 30% Risk</div>
          </div>

          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold mb-2">
              <span>Emotional Recovery Rate</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">{predictions.recoveryRatePercent}%</div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1">↑ +18% from Baseline</div>
          </div>

          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold mb-2">
              <span>Predicted Sleep Quality</span>
              <Moon className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-sm font-black text-indigo-300 truncate">{predictions.sleepQualityRating}</div>
            <div className="text-[11px] text-slate-400 font-semibold mt-1">Based on 4-7-8 Breathing</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart 1: Stress vs Anxiety Trend Line */}
          <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-black text-lg text-white">Stress & Anxiety Evolution Trend</h3>
                <p className="text-xs text-slate-400">7-Session NLP & Gameplay Historical Telemetry</p>
              </div>
              <Activity className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeline}>
                  <PolarGrid stroke="#334155" />
                  <XAxis dataKey="dayLabel" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem' }} />
                  <Legend />
                  <Line type="monotone" dataKey="stress" stroke="#f43f5e" strokeWidth={3} name="Stress Level" />
                  <Line type="monotone" dataKey="anxiety" stroke="#38bdf8" strokeWidth={3} name="Anxiety Index" />
                  <Line type="monotone" dataKey="recovery" stroke="#10b981" strokeWidth={3} name="Recovery Rate" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Player Embedding Radar Vector */}
          <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-black text-lg text-white">8D Player Embedding Radar</h3>
                <p className="text-xs text-slate-400">Deep Learning Multidimensional Personality & Psychological State</p>
              </div>
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="trait" stroke="#cbd5e1" />
                  <PolarRadiusAxis domain={[0, 100]} stroke="#475569" />
                  <Radar name="Player Vector" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Clinical Insights & Progress Rewards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Clinical Insights Box */}
          <div className="lg:col-span-2 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="font-black text-lg text-white">AI Clinical Insights & Neural Predictions</h3>
                <p className="text-xs text-slate-400">Generated from Cognitive Distortion Pipeline & Gemini Analysis</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {predictions.topClinicalInsights.map((insight, idx) => (
                <div key={idx} className="p-4 bg-slate-850 bg-slate-800/50 rounded-2xl border border-slate-700/50 text-sm text-slate-200 flex items-start gap-3">
                  <span className="text-indigo-400 font-black">0{idx + 1}.</span>
                  <p className="leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Rewards Panel */}
          <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg text-white">Therapeutic Rewards</h3>
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50">
                <span className="text-xs font-bold text-slate-300">Hope Points</span>
                <span className="font-black text-amber-400 text-lg">+{vector.hope * 10} HP</span>
              </div>
              <div className="flex justify-between items-center bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50">
                <span className="text-xs font-bold text-slate-300">Healing Points</span>
                <span className="font-black text-emerald-400 text-lg">+{vector.recovery * 12} pts</span>
              </div>
              <div className="flex justify-between items-center bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50">
                <span className="text-xs font-bold text-slate-300">Confidence Points</span>
                <span className="font-black text-purple-400 text-lg">+{vector.confidence * 8} CP</span>
              </div>
              <div className="flex justify-between items-center bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50">
                <span className="text-xs font-bold text-slate-300">Mind Coins</span>
                <span className="font-black text-sky-400 text-lg">350 🪙</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
