import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, ArrowRight, FileText, Zap, MessageSquare, BarChart3, Star, Check, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: FileText, title: 'Smart Summaries', desc: 'AI instantly extracts key concepts from any PDF or DOCX into structured bullet points.', color: 'from-indigo-500 to-blue-500' },
  { icon: Zap, title: 'Quiz Generator', desc: 'Auto-generate MCQ quizzes with answers, scoring, and detailed explanations.', color: 'from-violet-500 to-purple-500' },
  { icon: Star, title: 'Flashcards', desc: 'Create interactive flip-card flashcards with spaced repetition for better retention.', color: 'from-pink-500 to-rose-500' },
  { icon: MessageSquare, title: 'AI Chat Assistant', desc: 'Ask any question about your document. Get instant, context-aware answers.', color: 'from-emerald-500 to-cyan-500' },
  { icon: BarChart3, title: 'Study Analytics', desc: 'Track your progress, quiz scores, and study time with beautiful charts.', color: 'from-amber-500 to-orange-500' },
  { icon: Brain, title: 'Personalized Insights', desc: 'Get AI-powered study recommendations tailored to your performance.', color: 'from-cyan-500 to-teal-500' },
];

const stats = [
  { value: '2x', label: 'Faster Learning' },
  { value: '85%', label: 'Better Retention' },
  { value: '10x', label: 'Less Time Summarizing' },
  { value: '∞', label: 'Documents Supported' },
];

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Brain className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-display font-bold text-xl gradient-text">StudyAI</span>
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <button onClick={() => navigate('/dashboard')} className="btn-primary">Go to Dashboard <ArrowRight className="w-4 h-4 inline ml-1" /></button>
          ) : (
            <>
              <Link to="/auth" className="btn-ghost text-sm">Sign In</Link>
              <Link to="/auth?mode=register" className="btn-primary text-sm">Get Started Free</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20 overflow-hidden">
        {/* Background orbs */}
        <div className="glow-orb w-96 h-96 top-20 left-1/4 bg-primary-500" style={{ opacity: 0.12 }} />
        <div className="glow-orb w-80 h-80 bottom-20 right-1/4 bg-accent-500" style={{ opacity: 0.12 }} />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          className="text-center max-w-4xl mx-auto relative z-10">

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-500/30 bg-primary-500/10 text-primary-400 text-sm font-medium mb-8">
            <Zap className="w-3.5 h-3.5" />
            AI-Powered Study Assistant
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight">
            Study Smarter with
            <br />
            <span className="gradient-text">Your AI Assistant</span>
          </h1>

          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Upload any PDF or DOCX. Get instant AI summaries, quizzes, flashcards, and a personal study chatbot — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth?mode=register" className="btn-primary text-base px-8 py-4 flex items-center gap-2">
              Start Learning Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/auth" className="btn-secondary text-base px-8 py-4">
              Sign In
            </Link>
          </div>

          <p className="text-slate-600 text-sm mt-6">No credit card required · Free forever plan</p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <p className="text-4xl font-display font-bold gradient-text mb-1">{s.value}</p>
              <p className="text-slate-400 text-sm">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-white mb-4">Everything you need to <span className="gradient-text">ace your exams</span></h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Six powerful AI tools built specifically for students who want to learn faster and retain more.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="card-hover group">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }}
          className="max-w-3xl mx-auto text-center glass rounded-3xl p-16 border border-primary-500/20 relative overflow-hidden">
          <div className="glow-orb w-48 h-48 -top-12 left-1/2 -translate-x-1/2 bg-primary-500" />
          <h2 className="text-4xl font-display font-bold text-white mb-4 relative z-10">Ready to transform how you study?</h2>
          <p className="text-slate-400 mb-8 relative z-10">Join thousands of students studying smarter with AI.</p>
          <Link to="/auth?mode=register" className="btn-primary text-base px-10 py-4 relative z-10 inline-flex items-center gap-2">
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5 text-center text-slate-600 text-sm">
        <p>© {new Date().getFullYear()} StudyAI · Built with ❤️ for students everywhere</p>
      </footer>
    </div>
  );
}
