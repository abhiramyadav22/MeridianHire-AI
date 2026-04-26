import { motion } from 'framer-motion';
import { clsx } from './cn';

export function StatCard({ label, value, hint, icon, tone = 'default' }) {
  const toneStyles = {
    default: 'border-white/10 bg-white/[0.03] light:border-slate-200 light:bg-slate-50',
    success: 'border-emerald-500/30 bg-emerald-500/10 light:border-emerald-200 light:bg-emerald-50',
    warn: 'border-amber-500/30 bg-amber-500/10 light:border-amber-200 light:bg-amber-50',
    danger: 'border-rose-500/30 bg-rose-500/10 light:border-rose-200 light:bg-rose-50',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx('rounded-xl border p-3', toneStyles[tone] || toneStyles.default)}
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-wide text-zinc-500 light:text-slate-500">{label}</p>
        {icon ? <div className="text-zinc-400 light:text-slate-500">{icon}</div> : null}
      </div>
      <p className="text-xl font-semibold text-zinc-100 light:text-slate-900 mt-1">{value}</p>
      {hint ? <p className="text-xs text-zinc-500 light:text-slate-500 mt-1">{hint}</p> : null}
    </motion.div>
  );
}

