import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [params] = useSearchParams();
  const [isRegister, setIsRegister] = useState(params.get('mode') === 'register');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate('/dashboard'); }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register(form.name, form.email, form.password);
        toast.success('Account created! Welcome aboard 🎉');
      } else {
        await login(form.email, form.password);
        toast.success('Welcome back! 👋');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || (isRegister ? 'Registration failed' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Left Panel — Brand */}
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center px-16 relative overflow-hidden">
        <div className="glow-orb w-96 h-96 top-0 left-0 bg-primary-600" />
        <div className="glow-orb w-64 h-64 bottom-10 right-10 bg-accent-600" />

        <div className="relative z-10 text-center space-y-8 max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto shadow-glow-primary">
            <Brain className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-4xl font-display font-bold gradient-text">StudyAI</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg leading-relaxed">
            Transform your study materials into AI-powered summaries, quizzes, and flashcards instantly.
          </motion.p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="grid grid-cols-2 gap-4 text-left">
            {['AI Summaries', 'MCQ Quizzes', 'Flashcards', 'Study Chat'].map(feat => (
              <div key={feat} className="flex items-center gap-2.5 text-slate-300 text-sm">
                <div className="w-5 h-5 rounded-full bg-primary-500/20 border border-primary-500/40 flex items-center justify-center text-primary-400 text-xs">✓</div>
                {feat}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-16">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md space-y-8">
          {/* Back link */}
          <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          {/* Toggle tabs */}
          <div className="flex gap-1 p-1 rounded-2xl border border-white/10 bg-white/5">
            {['Sign In', 'Sign Up'].map((label, i) => (
              <button key={label} onClick={() => setIsRegister(i === 1)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                  ${(i === 1) === isRegister
                    ? 'bg-primary-600 text-white shadow-glow-primary'
                    : 'text-slate-400 hover:text-white'}`}>
                {label}
              </button>
            ))}
          </div>

          <div>
            <h2 className="text-3xl font-display font-bold text-white">
              {isRegister ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-slate-400 mt-1">
              {isRegister ? 'Start your AI-powered study journey' : 'Sign in to continue learning'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.form key={isRegister ? 'register' : 'login'}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              onSubmit={handleSubmit} className="space-y-5">

              {isRegister && (
                <div>
                  <label className="label">Full Name</label>
                  <input type="text" value={form.name} onChange={e => updateForm('name', e.target.value)}
                    placeholder="John Smith" className="input-field" required minLength={2} />
                </div>
              )}

              <div>
                <label className="label">Email Address</label>
                <input type="email" value={form.email} onChange={e => updateForm('email', e.target.value)}
                  placeholder="you@example.com" className="input-field" required />
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={form.password}
                    onChange={e => updateForm('password', e.target.value)}
                    placeholder="Min. 6 characters" className="input-field pr-12" required minLength={6} />
                  <button type="button" onClick={() => setShowPw(s => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isRegister ? '🚀 Create Account' : '→ Sign In')}
              </button>
            </motion.form>
          </AnimatePresence>

          <p className="text-center text-sm text-slate-500">
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <button onClick={() => setIsRegister(r => !r)} className="text-primary-400 hover:text-primary-300 font-medium">
              {isRegister ? 'Sign In' : 'Sign Up Free'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
