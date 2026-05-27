import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, LineChart, TrendingUp, Trophy, BookOpen,
  Zap, MessageSquare, FileText
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart as ReLineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Cell, Legend
} from 'recharts';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getStats, getQuizPerformance } from '../services/progressService';
import toast from 'react-hot-toast';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass border border-white/10 rounded-xl p-3 text-sm">
      <p className="text-white font-medium mb-1">{label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}{p.unit || ''}</p>)}
    </div>
  );
};

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, q] = await Promise.all([getStats(), getQuizPerformance()]);
        setStats(s.data.stats);
        setQuizData(q.data.quizzes.map((quiz, i) => ({
          name: `Quiz ${i + 1}`,
          score: quiz.score || 0,
          correct: quiz.correctAnswers || 0,
          total: quiz.totalQuestions || 0,
          title: quiz.title,
        })));
      } catch { toast.error('Failed to load analytics'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const radarData = stats ? [
    { subject: 'Documents', A: Math.min(stats.totalDocuments * 20, 100), fullMark: 100 },
    { subject: 'Quizzes', A: Math.min(stats.completedQuizzes * 10, 100), fullMark: 100 },
    { subject: 'Score', A: stats.avgQuizScore, fullMark: 100 },
    { subject: 'Flashcards', A: Math.min(stats.totalFlashcards * 5, 100), fullMark: 100 },
    { subject: 'Chat', A: Math.min(stats.totalChatSessions * 15, 100), fullMark: 100 },
  ] : [];

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Analytics</h1>
            <p className="text-slate-400 mt-1">Track your learning progress</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-40"><LoadingSpinner size="xl" /></div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={FileText} label="Documents" value={stats?.totalDocuments} color="indigo" delay={0} />
                <StatCard icon={Zap} label="Flashcards" value={stats?.totalFlashcards} color="violet" delay={0.05} />
                <StatCard icon={BookOpen} label="Quizzes Completed" value={stats?.completedQuizzes} color="emerald" delay={0.1} />
                <StatCard icon={Trophy} label="Avg Quiz Score" value={`${stats?.avgQuizScore}%`} color="amber" delay={0.15} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quiz Score Chart */}
                <div className="lg:col-span-2 card">
                  <h2 className="text-white font-semibold mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary-400" /> Quiz Score History
                  </h2>
                  {quizData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <ReLineChart data={quizData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} domain={[0, 100]} unit="%" />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5}
                          dot={{ fill: '#6366f1', r: 5 }} activeDot={{ r: 7, fill: '#a78bfa' }} name="Score" unit="%" />
                      </ReLineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-slate-500">
                      <p>Complete quizzes to see your progress chart</p>
                    </div>
                  )}
                </div>

                {/* Radar Chart */}
                <div className="card">
                  <h2 className="text-white font-semibold mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-accent-400" /> Learning Profile
                  </h2>
                  <ResponsiveContainer width="100%" height={260}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.08)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                      <Radar name="You" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quiz Bar Chart */}
              {quizData.length > 0 && (
                <div className="card">
                  <h2 className="text-white font-semibold mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-400" /> Correct vs Total Questions
                  </h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={quizData} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                      <Bar dataKey="correct" name="Correct" fill="#10b981" radius={[4,4,0,0]} />
                      <Bar dataKey="total" name="Total" fill="#6366f1" radius={[4,4,0,0]} opacity={0.4} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
