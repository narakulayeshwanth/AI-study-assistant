import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText, Clock, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { getDocuments } from '../services/documentService';
import toast from 'react-hot-toast';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initial, setInitial] = useState(true);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const res = await getDocuments({ limit: 50, sort: '-createdAt' });
      setAll(res.data.documents);
      setResults(res.data.documents);
    } catch { toast.error('Failed to load documents'); }
    finally { setInitial(false); }
  };

  const handleSearch = (q) => {
    setQuery(q);
    clearTimeout(debounceRef.current);
    if (!q.trim()) { setResults(all); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await getDocuments({ search: q, limit: 50 });
        setResults(res.data.documents);
      } catch {} finally { setLoading(false); }
    }, 350);
  };

  const fileIcon = { pdf: '📄', docx: '📝', txt: '📃' };
  const formatDate = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatBytes = b => b > 1e6 ? `${(b/1e6).toFixed(1)} MB` : `${(b/1e3).toFixed(0)} KB`;

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Search</h1>
            <p className="text-slate-400 mt-1">Find your study documents</p>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input ref={inputRef} value={query} onChange={e => handleSearch(e.target.value)}
              placeholder="Search by title or tag..."
              className="input-field pl-12 pr-12 py-4 text-base w-full"
            />
            {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400 animate-spin" />}
            {query && !loading && (
              <button onClick={() => handleSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Results count */}
          <p className="text-slate-500 text-sm">
            {query ? `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"` : `${all.length} documents`}
          </p>

          {/* Results */}
          <AnimatePresence>
            {initial ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
            ) : results.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="card text-center py-20">
                <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">No documents found</p>
                <p className="text-slate-600 text-sm mt-1">Try a different search term</p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {results.map((doc, i) => (
                  <motion.div key={doc._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <Link to={`/document/${doc._id}`} className="card-hover flex items-center gap-4 p-4 group">
                      <span className="text-3xl">{fileIcon[doc.fileType] || '📄'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold group-hover:text-primary-400 transition-colors truncate">{doc.title}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
                          <span className="badge-primary text-xs">{doc.fileType?.toUpperCase()}</span>
                          <span>{doc.pageCount} pages</span>
                          <span>·</span>
                          <span>{formatBytes(doc.fileSize)}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(doc.createdAt)}</span>
                        </div>
                        {doc.tags?.length > 0 && (
                          <div className="flex gap-1 mt-1.5">
                            {doc.tags.map(t => <span key={t} className="text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">{t}</span>)}
                          </div>
                        )}
                      </div>
                      <div className="text-primary-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Open →
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
