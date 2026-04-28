import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import { clsx } from '../ui/cn';

export function MessageList({ items }) {
  const asLabel = (value) => {
    if (!value) return '';
    return `${value}`.charAt(0).toUpperCase() + `${value}`.slice(1);
  };

  return (
    <div className="space-y-4">
      {items.map((m, i) => (
        <motion.div
          key={i + m.role + m.content.slice(0, 8)}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={clsx('flex gap-3', m.role === 'user' ? 'flex-row-reverse' : '')}
        >
          <div
            className={clsx(
              'shrink-0 h-8 w-8 rounded-lg flex items-center justify-center border',
              m.role === 'user'
                ? 'bg-cyan-500/20 border-cyan-400/30'
                : 'bg-white/5 border-white/10 light:bg-slate-100 light:border-slate-200'
            )}
          >
            {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </div>
          <div
            className={clsx(
              'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
              m.role === 'user'
                ? 'bg-cyan-600/90 text-white light:bg-cyan-600'
                : 'glass text-zinc-100 light:text-slate-800'
            )}
          >
            {m.content}
            {m.meta && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 light:text-cyan-700">
                  Difficulty: {asLabel(m.meta.currentDifficulty)}
                </span>
                <span className="text-[10px] text-zinc-500 light:text-slate-500 font-medium uppercase tracking-wide">
                  {m.meta.interviewPhase}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
