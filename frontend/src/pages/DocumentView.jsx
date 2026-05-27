import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  FileText, Zap, BookOpen, MessageSquare, Brain,
  RefreshCw, Loader2, ArrowLeft, Tag, ChevronDown, Sparkles,
  AlertTriangle
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import FlipCard from '../components/FlipCard';
import QuizCard from '../components/QuizCard';
import ChatBox from '../components/ChatBox';
import LoadingSpinner from '../components/LoadingSpinner';
import { getDocument } from '../services/documentService';
import { summarize, generateFlashcards, getFlashcards, generateQuiz, getQuizzes, generateInsights, getInsights } from '../services/aiService';
import toast from 'react-hot-toast';

// Generic AI error banner
function ErrorBanner({ message }) {
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl border border-red-500/30 bg-red-500/10 flex gap-4">
      <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-red-300 font-semibold">AI Generation Failed</p>
        <p className="text-slate-300 text-sm mt-1 leading-relaxed">{message || 'Something went wrong. Please try again in a moment.'}</p>
      </div>
    </motion.div>
  );
}

const TABS = [
  { id: 'summary',    label: 'Summary',    icon: FileText   },
  { id: 'flashcards', label: 'Flashcards', icon: Zap        },
  { id: 'quiz',       label: 'Quiz',       icon: BookOpen   },
  { id: 'chat',       label: 'AI Chat',    icon: MessageSquare },
  { id: 'insights',   label: 'Insights',   icon: Brain      },
];

export default function DocumentView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Tab data
  const [summary, setSummary]     = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [quiz, setQuiz]           = useState(null);
  const [insights, setInsights]   = useState(null);

  // Config
  const [quizCount, setQuizCount]         = useState(10);
  const [quizDiff, setQuizDiff]           = useState('mixed');
  const [flashCount, setFlashCount]       = useState(10);

  useEffect(() => {
    loadDoc();
  }, [id]);

  const loadDoc = async () => {
    try {
      const res = await getDocument(id);
      setDoc(res.data.document);
      if (res.data.document.summary) setSummary(res.data.document.summary);
    } catch { toast.error('Document not found'); navigate('/dashboard'); }
    finally { setLoading(false); }
  };

  // Load existing data when tab changes
  useEffect(() => {
    if (activeTab === 'flashcards' && flashcards.length === 0) loadFlashcards();
    if (activeTab === 'quiz' && !quiz) loadQuizzes();
    if (activeTab === 'insights' && !insights) loadInsights();
  }, [activeTab]);

  const loadFlashcards = async () => {
    try {
      const res = await getFlashcards(id);
      setFlashcards(res.data.flashcards);
    } catch {}
  };

  const loadQuizzes = async () => {
    try {
      const res = await getQuizzes(id);
      if (res.data.quizzes.length > 0) setQuiz(res.data.quizzes[0]);
    } catch {}
  };

  const loadInsights = async () => {
    try {
      const res = await getInsights(id);
      setInsights(res.data.insights);
    } catch {}
  };

  const handleAI = async (action) => {
    setAiLoading(true);
    setAiError('');
    try {
      if (action === 'summary') {
        const res = await summarize(id);
        setSummary(res.data.summary);
        toast.success('Summary generated!');
      } else if (action === 'flashcards') {
        const res = await generateFlashcards(id, flashCount);
        setFlashcards(res.data.flashcards);
        toast.success(`${res.data.count} flashcards generated!`);
      } else if (action === 'quiz') {
        const res = await generateQuiz(id, quizCount, quizDiff);
        setQuiz(res.data.quiz);
        toast.success('Quiz generated!');
      } else if (action === 'insights') {
        const res = await generateInsights(id);
        setInsights(res.data.insights);
        toast.success('Insights generated!');
      }
    } catch (err) {
      const msg = err.response?.data?.error || `Failed to generate ${action}. Please try again.`;
      setAiError(msg);
      toast.error(msg, { duration: 5000 });
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

          {/* Header */}
          <div className="flex items-start gap-4">
            <button onClick={() => navigate('/dashboard')}
              className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all mt-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold text-white">{doc?.title}</h1>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="badge-primary text-xs">{doc?.fileType?.toUpperCase()}</span>
                <span className="text-slate-500 text-sm">{doc?.pageCount} pages</span>
                <span className="text-slate-500 text-sm">·</span>
                <span className="text-slate-500 text-sm">{doc?.wordCount?.toLocaleString()} words</span>
                {doc?.tags?.length > 0 && (
                  <>
                    <span className="text-slate-500 text-sm">·</span>
                    <div className="flex gap-1">
                      {doc.tags.map(t => (
                        <span key={t} className="flex items-center gap-1 text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                          <Tag className="w-2.5 h-2.5" />{t}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1.5 rounded-2xl border border-white/10 bg-white/5 overflow-x-auto">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200
                  ${activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-glow-primary'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="card min-h-96">

              {/* Error Banner */}
              {aiError && <ErrorBanner message={aiError} />}

              {/* ── SUMMARY ── */}
              {activeTab === 'summary' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary-400" /> AI Summary
                    </h2>
                    <button onClick={() => handleAI('summary')} disabled={aiLoading}
                      className="btn-primary flex items-center gap-2 text-sm px-4 py-2 disabled:opacity-60">
                      {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      {summary ? 'Regenerate' : 'Generate Summary'}
                    </button>
                  </div>
                  {summary ? (
                    <div className="ai-content prose max-w-none">
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => <h1 className="text-white text-xl font-bold mt-5 mb-2">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-white text-lg font-semibold mt-4 mb-2">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-primary-300 font-semibold mt-3 mb-1">{children}</h3>,
                          p:  ({ children }) => <p className="text-slate-300 leading-relaxed mb-3">{children}</p>,
                          strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                          em: ({ children }) => <em className="text-slate-200 italic">{children}</em>,
                          ul: ({ children }) => <ul className="space-y-1.5 mb-3 pl-2">{children}</ul>,
                          ol: ({ children }) => <ol className="space-y-1.5 mb-3 pl-4 list-decimal">{children}</ol>,
                          li: ({ children }) => (
                            <li className="text-slate-300 text-sm flex items-start gap-2">
                              <span className="text-primary-400 mt-1 flex-shrink-0">•</span>
                              <span>{children}</span>
                            </li>
                          ),
                          hr: () => <hr className="border-white/10 my-4" />,
                          code: ({ children }) => <code className="bg-white/10 text-primary-300 text-xs px-1.5 py-0.5 rounded">{children}</code>,
                        }}
                      >
                        {summary}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <Sparkles className="w-12 h-12 text-primary-500/40 mb-4" />
                      <p className="text-slate-400 font-medium">No summary yet</p>
                      <p className="text-slate-600 text-sm">Click "Generate Summary" to extract key insights</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── FLASHCARDS ── */}
              {activeTab === 'flashcards' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                      <Zap className="w-5 h-5 text-violet-400" /> Flashcards
                    </h2>
                    <div className="flex items-center gap-3">
                      <select value={flashCount} onChange={e => setFlashCount(+e.target.value)}
                        className="input-field py-2 text-sm w-28">
                        {[5,10,15,20].map(n => <option key={n} value={n}>{n} cards</option>)}
                      </select>
                      <button onClick={() => handleAI('flashcards')} disabled={aiLoading}
                        className="btn-primary flex items-center gap-2 text-sm px-4 py-2 disabled:opacity-60">
                        {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Generate
                      </button>
                    </div>
                  </div>
                  <FlipCard cards={flashcards} onUpdate={loadFlashcards} />
                </div>
              )}

              {/* ── QUIZ ── */}
              {activeTab === 'quiz' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-emerald-400" /> Practice Quiz
                    </h2>
                    {!quiz && (
                      <div className="flex items-center gap-3 flex-wrap">
                        <select value={quizCount} onChange={e => setQuizCount(+e.target.value)}
                          className="input-field py-2 text-sm w-28">
                          {[5,10,15,20].map(n => <option key={n} value={n}>{n} Qs</option>)}
                        </select>
                        <select value={quizDiff} onChange={e => setQuizDiff(e.target.value)}
                          className="input-field py-2 text-sm w-28">
                          {['mixed','easy','medium','hard'].map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase()+d.slice(1)}</option>)}
                        </select>
                        <button onClick={() => handleAI('quiz')} disabled={aiLoading}
                          className="btn-primary flex items-center gap-2 text-sm px-4 py-2 disabled:opacity-60">
                          {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                          Generate Quiz
                        </button>
                      </div>
                    )}
                    {quiz && (
                      <button onClick={() => { setQuiz(null); }} className="btn-ghost text-sm">
                        <RefreshCw className="w-4 h-4 inline mr-1.5" /> New Quiz
                      </button>
                    )}
                  </div>
                  {quiz ? (
                    <QuizCard quiz={quiz} onComplete={loadQuizzes} />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <BookOpen className="w-12 h-12 text-emerald-500/40 mb-4" />
                      <p className="text-slate-400 font-medium">No quiz yet</p>
                      <p className="text-slate-600 text-sm">Configure and generate your quiz above</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── CHAT ── */}
              {activeTab === 'chat' && (
                <div className="space-y-5">
                  <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-cyan-400" /> AI Study Chat
                  </h2>
                  <ChatBox docId={id} />
                </div>
              )}

              {/* ── INSIGHTS ── */}
              {activeTab === 'insights' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                      <Brain className="w-5 h-5 text-pink-400" /> Personalized Insights
                    </h2>
                    <button onClick={() => handleAI('insights')} disabled={aiLoading}
                      className="btn-primary flex items-center gap-2 text-sm px-4 py-2 disabled:opacity-60">
                      {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      {insights ? 'Refresh' : 'Generate Insights'}
                    </button>
                  </div>

                  {insights ? (
                    <div className="space-y-5">
                      {/* Study Plan */}
                      <div className="p-5 rounded-2xl border border-primary-500/20 bg-primary-500/10">
                        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <Brain className="w-4 h-4 text-primary-400" /> Study Plan
                        </h3>
                        <p className="text-slate-300 text-sm leading-relaxed">{insights.studyPlan}</p>
                        {insights.estimatedStudyTime && (
                          <p className="text-primary-400 text-sm font-medium mt-3">
                            ⏱ Estimated time: {insights.estimatedStudyTime}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Strengths */}
                        <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
                          <h3 className="text-emerald-400 font-semibold mb-3">✅ Strengths</h3>
                          <ul className="space-y-1.5">
                            {insights.strengths?.map((s, i) => <li key={i} className="text-slate-300 text-sm flex items-start gap-2"><span className="text-emerald-400">•</span>{s}</li>)}
                          </ul>
                        </div>

                        {/* Weaknesses */}
                        <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/10">
                          <h3 className="text-amber-400 font-semibold mb-3">⚠️ Areas to Improve</h3>
                          <ul className="space-y-1.5">
                            {insights.weaknesses?.map((w, i) => <li key={i} className="text-slate-300 text-sm flex items-start gap-2"><span className="text-amber-400">•</span>{w}</li>)}
                          </ul>
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="p-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/10">
                        <h3 className="text-cyan-400 font-semibold mb-3">💡 Recommendations</h3>
                        <div className="space-y-2">
                          {insights.recommendations?.map((r, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm text-slate-300">
                              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</span>
                              {r}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Topics to Focus */}
                      {insights.topicsToFocus?.length > 0 && (
                        <div>
                          <h3 className="text-slate-300 font-semibold mb-3">🎯 Topics to Focus On</h3>
                          <div className="flex flex-wrap gap-2">
                            {insights.topicsToFocus.map((t, i) => (
                              <span key={i} className="badge-primary text-sm">{t}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <Brain className="w-12 h-12 text-pink-500/40 mb-4" />
                      <p className="text-slate-400 font-medium">No insights yet</p>
                      <p className="text-slate-600 text-sm">Generate personalized study recommendations</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
