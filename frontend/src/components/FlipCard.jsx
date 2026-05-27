import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ChevronLeft, ChevronRight, RotateCcw, Star } from 'lucide-react';
import { toggleFavorite } from '../services/aiService';
import toast from 'react-hot-toast';

export default function FlipCard({ cards, onUpdate }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState(0);

  if (!cards?.length) return (
    <div className="flex flex-col items-center justify-center h-64 text-slate-500">
      <p>No flashcards yet. Generate some above!</p>
    </div>
  );

  const card = cards[index];

  const go = (dir) => {
    setFlipped(false);
    setDirection(dir);
    setTimeout(() => setIndex(i => Math.max(0, Math.min(cards.length - 1, i + dir))), 150);
  };

  const handleFavorite = async () => {
    try {
      await toggleFavorite(card._id);
      onUpdate?.();
      toast.success(card.isFavorite ? 'Removed from favorites' : 'Added to favorites!');
    } catch { toast.error('Failed to update favorite'); }
  };

  const difficultyColor = {
    easy:   'bg-emerald-500/20 text-emerald-400',
    medium: 'bg-amber-500/20 text-amber-400',
    hard:   'bg-red-500/20 text-red-400',
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>{index + 1} / {cards.length} cards</span>
        <div className="flex gap-1">
          {cards.map((_, i) => (
            <button key={i} onClick={() => { setFlipped(false); setIndex(i); }}
              className={`w-2 h-2 rounded-full transition-all ${i === index ? 'bg-primary-400 w-6' : 'bg-white/20'}`} />
          ))}
        </div>
        <span className={`badge text-xs px-2 py-0.5 rounded-full ${difficultyColor[card.difficulty] || difficultyColor.medium}`}>
          {card.difficulty}
        </span>
      </div>

      {/* Flip Card */}
      <div className="flip-card h-64 cursor-pointer" onClick={() => setFlipped(f => !f)}>
        <div className={`flip-card-inner h-full ${flipped ? 'flipped' : ''}`}>
          {/* Front */}
          <div className="flip-card-front glass border border-white/10 flex flex-col items-center justify-center p-8 text-center">
            <p className="text-xs text-primary-400 font-semibold uppercase tracking-wider mb-4">Question</p>
            <p className="text-white text-xl font-medium leading-relaxed">{card.question}</p>
            <p className="text-slate-500 text-sm mt-6 flex items-center gap-1.5">
              <RotateCcw className="w-3 h-3" /> Click to reveal answer
            </p>
          </div>
          {/* Back */}
          <div className="flip-card-back bg-gradient-to-br from-primary-600/20 to-accent-600/20 border border-primary-500/30 flex flex-col items-center justify-center p-8 text-center">
            <p className="text-xs text-accent-400 font-semibold uppercase tracking-wider mb-4">Answer</p>
            <p className="text-white text-lg leading-relaxed">{card.answer}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button onClick={() => go(-1)} disabled={index === 0}
          className="flex items-center gap-2 btn-ghost disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronLeft className="w-5 h-5" /> Previous
        </button>
        <button onClick={handleFavorite}
          className={`p-2.5 rounded-xl transition-all ${card.isFavorite ? 'text-amber-400 bg-amber-500/20' : 'text-slate-500 hover:text-amber-400 hover:bg-amber-500/10'}`}>
          <Star className={`w-5 h-5 ${card.isFavorite ? 'fill-amber-400' : ''}`} />
        </button>
        <button onClick={() => go(1)} disabled={index === cards.length - 1}
          className="flex items-center gap-2 btn-ghost disabled:opacity-30 disabled:cursor-not-allowed">
          Next <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
