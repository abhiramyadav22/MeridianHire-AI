import { motion } from 'framer-motion';
import { CheckCircle2, LoaderCircle } from 'lucide-react';
import { clsx } from './ui/cn';

const DEFAULT_STEPS = [
  'Resume & JD Ingestion',
  'Skill Extraction',
  'Gap Analysis',
  'Adaptive Interview',
  'Scoring & Verdict',
  'Learning Plan Generation',
  'Final Report',
];

export function PipelineFlow({ activeStep = 0, label, steps = DEFAULT_STEPS, compact = false }) {
  return (
    <div className={clsx('glass rounded-2xl p-3', compact ? 'mb-3' : 'mb-5')}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs uppercase tracking-wider text-zinc-400 light:text-slate-500">AI Pipeline</p>
        {label ? (
          <motion.p
            key={label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-cyan-300 light:text-cyan-700"
          >
            {label}
          </motion.p>
        ) : null}
      </div>
      <div className={clsx('grid gap-2', compact ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-4')}>
        {steps.map((step, idx) => {
          const done = idx < activeStep;
          const active = idx === activeStep;
          return (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={clsx(
                'rounded-xl border px-3 py-2 min-h-[68px] transition-all',
                done && 'border-emerald-500/30 bg-emerald-500/10',
                active && 'border-cyan-500/40 bg-cyan-500/10 shadow-glass',
                !done && !active && 'border-white/10 bg-white/[0.02] light:border-slate-200 light:bg-slate-50'
              )}
            >
              <div className="flex items-center gap-2 text-xs">
                {done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : active ? (
                  <LoaderCircle className="h-4 w-4 text-cyan-400 animate-spin" />
                ) : (
                  <span className="h-4 w-4 rounded-full border border-zinc-600 light:border-slate-300" />
                )}
                <span className="text-[10px] text-zinc-500 light:text-slate-500">Step {idx + 1}</span>
              </div>
              <p className="text-xs mt-1 text-zinc-200 light:text-slate-800">{step}</p>
              {active && (
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  className="h-0.5 mt-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

