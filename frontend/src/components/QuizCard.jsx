import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ChevronRight, Trophy, RotateCcw, Clock } from 'lucide-react';
import { submitQuiz } from '../services/aiService';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

export default function QuizCard({ quiz, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  if (!quiz?.questions?.length) return (
    <div className="flex flex-col items-center justify-center h-64 text-slate-500">
      <p>No quiz generated yet.</p>
    </div>
  );

  const q = quiz.questions[currentIndex];
  const isCorrect = selected === q.correctIndex;
  const progress = ((currentIndex + 1) / quiz.questions.length) * 100;

  const handleSelect = (i) => {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
  };

  const handleNext = () => {
    setAnswers(a => [...a, { questionIndex: currentIndex, selectedIndex: selected }]);
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      handleSubmit([...answers, { questionIndex: currentIndex, selectedIndex: selected }]);
    }
  };

  const handleSubmit = async (finalAnswers) => {
    clearInterval(timerRef.current);
    setLoading(true);
    try {
      const res = await submitQuiz(quiz._id, finalAnswers, elapsed);
      setResult(res.data);
      setFinished(true);
      onComplete?.();
    } catch {
      toast.error('Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const optionStyle = (i) => {
    if (!revealed) return 'border-white/10 hover:border-primary-400/60 hover:bg-primary-500/10 cursor-pointer';
    if (i === q.correctIndex) return 'border-emerald-400/60 bg-emerald-500/15 text-emerald-300';
    if (i === selected && i !== q.correctIndex) return 'border-red-400/60 bg-red-500/15 text-red-300';
    return 'border-white/5 opacity-50';
  };

  if (loading) return <div className="py-20"><LoadingSpinner size="lg" className="mx-auto" /></div>;

  if (finished && result) {
    const scoreColor = result.score >= 80 ? 'text-emerald-400' : result.score >= 60 ? 'text-amber-400' : 'text-red-400';
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 py-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 border-2 border-primary-500/40 flex items-center justify-center mx-auto">
          <Trophy className="w-10 h-10 text-primary-400" />
        </div>
        <div>
          <p className={`text-6xl font-bold font-display ${scoreColor}`}>{result.score}%</p>
          <p className="text-slate-400 mt-2">{result.correctAnswers} / {result.totalQuestions} correct</p>
          <p className="text-slate-500 text-sm mt-1 flex items-center justify-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> {formatTime(result.timeTaken || elapsed)}
          </p>
        </div>
        <div className={`badge mx-auto ${result.score >= 80 ? 'badge-success' : result.score >= 60 ? 'badge-warning' : 'badge-danger'}`}>
          {result.score >= 80 ? '🎉 Excellent!' : result.score >= 60 ? '👍 Good job!' : '📚 Keep studying!'}
        </div>
        <button onClick={() => { setCurrentIndex(0); setAnswers([]); setSelected(null); setRevealed(false); setFinished(false); setResult(null); setElapsed(0); }}
          className="btn-secondary flex items-center gap-2 mx-auto">
          <RotateCcw className="w-4 h-4" /> Retake Quiz
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>Question {currentIndex + 1} of {quiz.questions.length}</span>
        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{formatTime(elapsed)}</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
          animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div key={currentIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <p className="text-white text-lg font-medium leading-relaxed mb-6">{q.question}</p>

          {/* Options */}
          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <button key={i} onClick={() => handleSelect(i)}
                className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 flex items-center gap-3 text-sm ${optionStyle(i)}`}>
                <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{opt}</span>
                {revealed && i === q.correctIndex && <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
                {revealed && i === selected && i !== q.correctIndex && <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
              </button>
            ))}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {revealed && q.explanation && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20 text-sm text-slate-300">
                <span className="text-primary-400 font-semibold">💡 </span>{q.explanation}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next */}
          {revealed && (
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={handleNext}
              className="btn-primary flex items-center gap-2 mt-6 ml-auto">
              {currentIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
