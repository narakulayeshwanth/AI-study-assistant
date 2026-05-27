import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, BookOpen, Zap, MessageSquare, BarChart3,
  Plus, Clock, Trash2, Eye, Upload, ArrowRight, Trophy
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import FileUpload from '../components/FileUpload';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { getDocuments, deleteDocument } from '../services/documentService';
import { getStats, getActivity } from '../services/progressService';
import toast from 'react-hot-toast';

const fileTypeIcon = { pdf: '📄', docx: '📝', txt: '📃' };
const activityIcon = { upload: FileText, quiz: Zap, chat: MessageSquare };
const activityColor = { upload: 'text-indigo-400 bg-indigo-500/20', quiz: 'text-violet-400 bg-violet-500/20', chat: 'text-emerald-400 bg-emerald-500/20' };

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  const fetchData = async () => {
    try {
      const [docsRes, statsRes, activityRes] = await Promise.all([
        getDocuments({ limit: 8, sort: '-lastAccessed' }),
        getStats(),
        getActivity(8),
      ]);
      setDocuments(docsRes.data.documents);
      setStats(statsRes.data.stats);
      setActivity(activityRes.data.activity);
    } catch { toast.error('Failed to load dashboard data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this document and all its AI content?')) return;
    try {
      await deleteDocument(id);
      toast.success('Document deleted');
      fetchData();
    } catch { toast.error('Failed to delete'); }
  };

  const handleUploadSuccess = () => { setShowUpload(false); fetchData(); };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const formatBytes = (b) => b > 1e6 ? `${(b/1e6).toFixed(1)}MB` : `${(b/1e3).toFixed(0)}KB`;

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-white">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
              </h1>
              <p className="text-slate-400 mt-1">Here's your learning overview</p>
            </div>
            <button onClick={() => setShowUpload(s => !s)}
              className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Upload Document
            </button>
          </div>

          {/* Upload Panel */}
          {showUpload && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="card border-primary-500/20">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary-400" /> Upload Study Material
              </h3>
              <FileUpload onSuccess={handleUploadSuccess} />
            </motion.div>
          )}

          {/* Stats */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={FileText} label="Documents" value={stats?.totalDocuments} subtitle="Uploaded" color="indigo" delay={0} />
              <StatCard icon={Zap} label="Flashcards" value={stats?.totalFlashcards} subtitle="Generated" color="violet" delay={0.05} />
              <StatCard icon={BookOpen} label="Quizzes" value={stats?.totalQuizzes} subtitle={`Avg score: ${stats?.avgQuizScore}%`} color="emerald" delay={0.1} />
              <StatCard icon={MessageSquare} label="Chat Sessions" value={stats?.totalChatSessions} subtitle="With AI" color="cyan" delay={0.15} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Documents */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-semibold text-lg">Recent Documents</h2>
                <Link to="/search" className="text-primary-400 text-sm hover:text-primary-300 flex items-center gap-1">
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
              ) : documents.length === 0 ? (
                <div className="card text-center py-16">
                  <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">No documents yet</p>
                  <p className="text-slate-600 text-sm mb-6">Upload your first study material to get started</p>
                  <button onClick={() => setShowUpload(true)} className="btn-primary">
                    <Plus className="w-4 h-4 inline mr-1.5" /> Upload Now
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc, i) => (
                    <motion.div key={doc._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                      <Link to={`/document/${doc._id}`}
                        className="card-hover flex items-center gap-4 p-4 group cursor-pointer">
                        <span className="text-3xl">{fileTypeIcon[doc.fileType] || '📄'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate group-hover:text-primary-400 transition-colors">{doc.title}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                            <span>{doc.pageCount}p</span>
                            <span>·</span>
                            <span>{formatBytes(doc.fileSize)}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(doc.lastAccessed)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="badge-primary text-xs">{doc.fileType.toUpperCase()}</span>
                          <button onClick={(e) => handleDelete(doc._id, e)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Activity Feed */}
            <div className="space-y-4">
              <h2 className="text-white font-semibold text-lg">Recent Activity</h2>
              <div className="card space-y-4">
                {loading ? (
                  [...Array(5)].map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)
                ) : activity.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-8">No activity yet</p>
                ) : (
                  activity.map((item, i) => {
                    const Icon = activityIcon[item.type] || FileText;
                    const color = activityColor[item.type] || activityColor.upload;
                    return (
                      <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{item.title}</p>
                          <p className="text-slate-500 text-xs">
                            {item.type === 'quiz' && item.score != null ? `Score: ${item.score}% · ` : ''}
                            {new Date(item.date).toLocaleDateString()}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Quick Stats */}
              {stats && (
                <div className="card bg-gradient-to-br from-primary-500/10 to-accent-500/10 border-primary-500/20 text-center">
                  <Trophy className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{stats.avgQuizScore}%</p>
                  <p className="text-slate-400 text-sm">Average Quiz Score</p>
                  <p className="text-slate-500 text-xs mt-1">{stats.completedQuizzes} quizzes completed</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
