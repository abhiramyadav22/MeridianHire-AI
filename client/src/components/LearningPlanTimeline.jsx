import { motion } from 'framer-motion';

export function LearningPlanTimeline({ roadmap = [], resources = [] }) {
  return (
    <div className="space-y-3">
      {(roadmap || []).map((w, idx) => (
        <motion.div
          key={`${w.week}-${w.goal || w.focus}`}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="rounded-xl border border-white/10 bg-white/[0.03] p-3 light:border-slate-200 light:bg-slate-50"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-wide text-zinc-500 light:text-slate-500">Week {w.week}</p>
            {w.timeEstimate ? (
              <span className="text-[11px] rounded-full bg-zinc-800/50 px-2 py-1 text-zinc-200 light:bg-slate-200 light:text-slate-800">
                {w.timeEstimate}
              </span>
            ) : null}
          </div>
          <p className="text-sm font-medium text-zinc-100 light:text-slate-900 mt-1">{w.goal || w.focus}</p>
          <ul className="mt-2 list-disc pl-5 text-xs text-zinc-400 light:text-slate-600 space-y-1">
            {(w.tasks || w.milestones || []).map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          {w.resources?.length ? (
            <div className="mt-3 text-xs text-zinc-300 light:text-slate-700">
              <div className="font-medium text-zinc-400 light:text-slate-500">Resources</div>
              <ul className="mt-1 space-y-1">
                {w.resources.map((r) => (
                  <li key={r}>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </motion.div>
      ))}
      {resources?.length ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 light:border-slate-200 light:bg-slate-50">
          <p className="text-xs uppercase tracking-wide text-zinc-500 light:text-slate-500">Curated resources</p>
          <ul className="mt-1 space-y-1 text-xs text-zinc-300 light:text-slate-700">
            {resources.slice(0, 6).map((r) => (
              <li key={`${r.title}-${r.url}`}>
                <a className="underline decoration-dotted" href={r.url} target="_blank" rel="noreferrer">
                  {r.title}
                </a>{' '}
                <span className="text-zinc-500 light:text-slate-500">({r.type})</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

