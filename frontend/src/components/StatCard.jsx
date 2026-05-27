import { motion } from 'framer-motion';

const colorMap = {
  indigo:  { bg: 'from-indigo-500/20 to-indigo-600/10', icon: 'bg-indigo-500/20 text-indigo-400', border: 'border-indigo-500/20' },
  violet:  { bg: 'from-violet-500/20 to-violet-600/10', icon: 'bg-violet-500/20 text-violet-400',  border: 'border-violet-500/20' },
  emerald: { bg: 'from-emerald-500/20 to-emerald-600/10', icon: 'bg-emerald-500/20 text-emerald-400', border: 'border-emerald-500/20' },
  amber:   { bg: 'from-amber-500/20 to-amber-600/10', icon: 'bg-amber-500/20 text-amber-400',   border: 'border-amber-500/20' },
  cyan:    { bg: 'from-cyan-500/20 to-cyan-600/10', icon: 'bg-cyan-500/20 text-cyan-400',      border: 'border-cyan-500/20' },
  pink:    { bg: 'from-pink-500/20 to-pink-600/10', icon: 'bg-pink-500/20 text-pink-400',      border: 'border-pink-500/20' },
};

export default function StatCard({ icon: Icon, label, value, subtitle, color = 'indigo', delay = 0 }) {
  const c = colorMap[color] || colorMap.indigo;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`card-hover bg-gradient-to-br ${c.bg} border ${c.border} relative overflow-hidden`}
    >
      {/* Glow orb */}
      <div className="glow-orb w-24 h-24 -top-6 -right-6 bg-gradient-to-br from-primary-500 to-accent-500" />

      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${c.icon} mb-4`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      <p className="text-3xl font-bold font-display text-white mb-1">{value ?? '—'}</p>
      <p className="text-sm font-medium text-slate-300">{label}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </motion.div>
  );
}
