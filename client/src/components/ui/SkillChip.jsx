import { clsx } from './cn';

export function SkillChip({ skill, tone = 'default' }) {
  const styleMap = {
    default: 'bg-white/5 border-white/10 text-zinc-200 light:bg-slate-100 light:border-slate-200 light:text-slate-800',
    missing: 'bg-rose-500/10 border-rose-400/30 text-rose-200 light:bg-rose-50 light:border-rose-200 light:text-rose-800',
    strong: 'bg-emerald-500/10 border-emerald-400/30 text-emerald-200 light:bg-emerald-50 light:border-emerald-200 light:text-emerald-800',
    weak: 'bg-amber-500/10 border-amber-400/30 text-amber-200 light:bg-amber-50 light:border-amber-200 light:text-amber-800',
  };
  return (
    <span className={clsx('inline-flex rounded-full border px-2 py-1 text-[11px]', styleMap[tone] || styleMap.default)}>
      {skill}
    </span>
  );
}

