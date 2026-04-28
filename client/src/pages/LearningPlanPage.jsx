import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Clock3, Target } from 'lucide-react';
import { api } from '../lib/api';
import { useSession } from '../context/SessionContext';
import { SectionHeader } from '../components/ui/SectionHeader';
import { SkillChip } from '../components/ui/SkillChip';
import { LearningPlanTimeline } from '../components/LearningPlanTimeline';
import { PipelineFlow } from '../components/PipelineFlow';

export default function LearningPlanPage() {
  const { sessionId, clear } = useSession();
  const navigate = useNavigate();
  const [s, setS] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      navigate('/', { replace: true });
      return;
    }
    (async () => {
      try {
        const d = await api.getSession(sessionId);
        if (!d.learningPlan) {
          navigate('/dashboard', { replace: true });
          return;
        }
        setS(d);
      } catch (e) {
        if (String(e?.message || '').includes('Session not found')) {
          clear();
          navigate('/', { replace: true });
          return;
        }
        setErr(e.message);
      }
    })();
  }, [clear, navigate, sessionId]);

  if (!sessionId) return null;
  if (err) {
    return (
      <div className="text-sm text-red-300 light:text-red-800 flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        {err}
      </div>
    );
  }
  if (!s) return <div className="h-32 rounded-xl bg-white/5 animate-pulse" />;

  const lp = s.learningPlan || {};
  const daily = lp.dailyPlanTemplate?.tasks || [];

  return (
    <div className="max-w-6xl space-y-6">
      <PipelineFlow activeStep={5} label="Personalized roadmap ready" />
      <SectionHeader
        eyebrow="Learning plan"
        title="Personalized growth roadmap"
        subtitle="Prioritized by hiring risks, confidence gaps, and role requirements."
      />

      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Critical gaps</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(lp.criticalGaps || []).map((g) => (
              <SkillChip key={g.skillName} skill={g.skillName} tone="missing" />
            ))}
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Adjacent skills</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(lp.adjacentSkills || []).map((g) => (
              <SkillChip key={g.skillName} skill={g.skillName} tone="weak" />
            ))}
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Optional improvements</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(lp.optionalImprovements || []).map((g) => (
              <SkillChip key={g.skillName} skill={g.skillName} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="glass rounded-xl p-4">
          <p className="text-sm font-semibold text-zinc-100 light:text-slate-900 mb-3">4-week roadmap</p>
          <LearningPlanTimeline roadmap={lp.weeklyRoadmap || []} resources={lp.resources || []} />
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-sm font-semibold text-zinc-100 light:text-slate-900 mb-2">Daily execution plan</p>
          <div className="space-y-2">
            {daily.map((t) => (
              <div
                key={`${t.title}-${t.dayPart}`}
                className="rounded-lg border border-white/10 bg-white/[0.03] p-3 light:border-slate-200 light:bg-slate-50"
              >
                <div className="flex items-center justify-between text-sm">
                  <p className="text-zinc-200 light:text-slate-800 font-medium">{t.title}</p>
                  <span className="text-xs text-zinc-400">{t.dayPart}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-1 inline-flex items-center gap-1">
                  <Clock3 className="h-3.5 w-3.5" />
                  {t.minutes} min
                </p>
              </div>
            ))}
            {!daily.length && <p className="text-sm text-zinc-500">No daily tasks generated yet.</p>}
          </div>

          <div className="mt-4 rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-3">
            <p className="text-xs uppercase tracking-wide text-cyan-300 inline-flex items-center gap-1">
              <Target className="h-3.5 w-3.5" />
              Time estimate
            </p>
            <p className="text-sm text-zinc-200 mt-1 light:text-slate-900">
              Target 60 to 90 minutes/day for 4 weeks to close critical gaps before re-assessment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

