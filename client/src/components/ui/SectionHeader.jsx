export function SectionHeader({ eyebrow, title, subtitle, right }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
      <div>
        {eyebrow ? (
          <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500 light:text-slate-500">{eyebrow}</p>
        ) : null}
        <h2 className="font-display text-xl md:text-2xl font-semibold text-zinc-100 light:text-slate-900">{title}</h2>
        {subtitle ? <p className="text-sm text-zinc-400 light:text-slate-600 mt-1">{subtitle}</p> : null}
      </div>
      {right ? <div>{right}</div> : null}
    </div>
  );
}

