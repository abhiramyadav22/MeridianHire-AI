import { clsx } from './cn';

const labelMap = {
  'Strong Hire': 'Strong Fit',
  'Moderate Hire': 'Moderate Fit',
  'Needs Improvement': 'Needs Improvement',
};

const styleMap = {
  'Strong Hire': 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200 light:text-emerald-800 light:bg-emerald-50 light:border-emerald-200',
  'Moderate Hire': 'bg-amber-500/15 border-amber-400/40 text-amber-200 light:text-amber-800 light:bg-amber-50 light:border-amber-200',
  'Needs Improvement': 'bg-rose-500/15 border-rose-400/40 text-rose-200 light:text-rose-800 light:bg-rose-50 light:border-rose-200',
};

export function VerdictBadge({ verdict }) {
  if (!verdict) return null;
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
        styleMap[verdict] || styleMap['Moderate Hire']
      )}
    >
      {labelMap[verdict] || verdict}
    </span>
  );
}

