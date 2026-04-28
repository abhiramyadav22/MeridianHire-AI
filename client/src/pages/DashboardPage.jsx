import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Award, BookOpen, ArrowRight, AlertCircle, Crosshair, Layers, Gauge, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';
import { useSession } from '../context/SessionContext';
import { clsx } from '../components/ui/cn';
import { PipelineFlow } from '../components/PipelineFlow';

const verdictStyles = {
  'Strong Hire': 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-200',
  'Moderate Hire': 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-200',
  'Needs Improvement': 'from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-200',
};

function SkillRow({ name, value, sub, color }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-zinc-400 light:text-slate-500 mb-1">
        <span className="text-zinc-200 light:text-slate-800 font-medium">{name}</span>
        {sub}
      </div>
      <div className="h-2 rounded-full bg-zinc-800/80 light:bg-slate-200 overflow-hidden">
        <motion.div
          className={clsx('h-full rounded-full', color || 'bg-cyan-500')}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, (value / 10) * 100)}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { sessionId, clear } = useSession();
  const navigate = useNavigate();
  const [s, setS] = useState(null);
  const [err, setErr] = useState(null);
  const [simulation, setSimulation] = useState(null);

  const scoreVerdict = (score) =>
    score >= 7.5 ? 'Strong Hire' : score >= 5.5 ? 'Moderate Hire' : 'Needs Improvement';

  const simulateImprovement = () => {
    if (!s?.evaluation?.skillEvaluations?.length) return;
    const improvedSkills = s.evaluation.skillEvaluations.map((sk) => {
      const boost = sk.score < 6.5 ? 2.2 : sk.score < 8.2 ? 1.1 : 0.5;
      const newScore = Math.min(10, Number((Number(sk.score || 0) + boost).toFixed(1)));
      const newConfidence = Math.min(1, Number((Number(sk.confidence || 0) + 0.16).toFixed(2)));
      return {
        ...sk,
        score: newScore,
        confidence: newConfidence,
        status: newScore >= 7.5 ? 'strong' : newScore >= 5.5 ? 'moderate' : 'weak',
      };
    });
    const overallAfter = improvedSkills.reduce((sum, item) => sum + item.score, 0) / improvedSkills.length;
    const confidenceAfter = improvedSkills.reduce((sum, item) => sum + item.confidence, 0) / improvedSkills.length;
    setSimulation({
      overallBefore: overallScore,
      overallAfter: Number(overallAfter.toFixed(1)),
      confidenceBefore: confidence,
      confidenceAfter: Number(confidenceAfter.toFixed(2)),
      verdictBefore: report?.hiringVerdict || fitLabel,
      verdictAfter: scoreVerdict(overallAfter),
      skills: improvedSkills,
    });
  };

  useEffect(() => {
    if (!sessionId) {
      navigate('/', { replace: true });
      return;
    }
    (async () => {
      try {
        const d = await api.getSession(sessionId);
        if (!d.evaluation) {
          navigate('/assessment', { replace: true });
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
      <div className="flex items-center gap-2 text-red-300 text-sm light:text-red-700">
        <AlertCircle className="h-4 w-4" />
        {err}
      </div>
    );
  }
  if (!s) {
    return (
      <div className="space-y-3 max-w-2xl">
        <div className="h-8 w-1/2 rounded-md bg-white/5 animate-pulse" />
        <div className="h-40 rounded-xl bg-white/5 animate-pulse" />
      </div>
    );
  }

  const ev = s.evaluation;
  const skills = ev?.skillEvaluations || [];
  const report = s.report;
  const learning = s.learningPlan;
  const structured = s.structuredOutput || {};
  const extract = s.skillExtraction;
  const claimed = extract?.claimedSkills || [];
  const testedNames = new Set(skills.map((k) => k.skillName));

  const radar = skills.slice(0, 8).map((k) => ({
    skill: k.skillName.length > 12 ? `${k.skillName.slice(0, 10)}...` : k.skillName,
    score: Math.min(10, Math.max(0, Number(k.score) || 0)),
  }));

  const barData = skills.map((k) => ({
    name: k.skillName.length > 10 ? `${k.skillName.slice(0, 8)}...` : k.skillName,
    s: Math.min(10, Math.max(0, Number(k.score) || 0)),
  }));

  const weak = skills
    .map((k) => ({ n: k.skillName, s: k.score, c: k.confidence }))
    .sort((a, b) => a.s - b.s)
    .slice(0, 4);
  const overallScore = structured.overall_score ??
    (skills.length > 0 ? skills.reduce((acc, x) => acc + (Number(x.score) || 0), 0) / skills.length : 0);
  const confidence = structured.confidence_score ??
    (skills.length > 0 ? skills.reduce((acc, x) => acc + (Number(x.confidence) || 0), 0) / skills.length : 0);
  const fitLabel = report?.hiringVerdict === 'Strong Hire'
    ? 'Strong Fit'
    : report?.hiringVerdict === 'Moderate Hire'
      ? 'Moderate Fit'
      : 'Needs Improvement';
  const riskCount = ev?.overall?.riskFactors?.length || weak.length;
  const evidenceCount = skills.reduce(
    (sum, sk) => sum + (sk.resumeEvidence?.length || 0) + (sk.answerSnippets?.length || 0),
    0
  );
  const modeLabel = {
    balanced: 'Balanced',
    senior_system: 'Senior Systems',
    frontend_product: 'Frontend Product',
    speed_screen: 'Fast Screen',
  }[s.options?.assessmentMode || 'balanced'] || 'Balanced';

  return (
    <div className="max-w-6xl space-y-6">
      <div className="surface-panel rounded-xl p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="muted-label">Decision cockpit</p>
            <h1 className="mt-1 font-display text-2xl font-semibold text-slate-50 light:text-slate-950">
              Hiring intelligence
            </h1>
            <p className="mt-1 text-sm text-slate-400 light:text-slate-600">
              {extract?.roleTitle || 'Role'} - evidence-based view of fit and potential
            </p>
            <p className="mt-1 text-xs text-slate-500">Candidate: {s.candidateName || 'Demo candidate'}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={simulateImprovement}
              className="btn-primary bg-emerald-600 hover:bg-emerald-500"
            >
              <Gauge className="h-4 w-4" />
              Simulate improvement
            </button>
            <Link
              to="/report"
              className="btn-secondary"
            >
              Full report <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="metric-strip">
            <p className="muted-label">Assessment mode</p>
            <p className="mt-1 text-sm font-semibold text-cyan-200 light:text-cyan-800">{modeLabel}</p>
          </div>
          <div className="metric-strip">
            <p className="muted-label">Evidence points</p>
            <p className="mt-1 text-sm font-semibold text-slate-100 light:text-slate-900">{evidenceCount}</p>
          </div>
          <div className="metric-strip">
            <p className="muted-label">Risk signals</p>
            <p className="mt-1 text-sm font-semibold text-amber-200 light:text-amber-800">{riskCount}</p>
          </div>
          <div className="metric-strip">
            <p className="muted-label">Governance</p>
            <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-emerald-200 light:text-emerald-800">
              <ShieldCheck className="h-4 w-4" />
              Human review
            </p>
          </div>
        </div>
      </div>
      <PipelineFlow activeStep={6} label="Final report generated" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(s.pipeline?.steps || []).map((step, idx) => {
          const done = idx <= (s.pipeline?.currentStep ?? 0);
          return (
            <div
              key={step}
              className={clsx(
                'rounded-2xl border p-3 text-sm',
                done ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100' : 'border-white/10 bg-white/5 text-zinc-300'
              )}
            >
              <div className="font-semibold">Step {idx + 1}</div>
              <p className="mt-1">{step}</p>
            </div>
          );
        })}
      </div>

      {report && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={clsx(
            'rounded-2xl p-5 border bg-gradient-to-br',
            verdictStyles[report.hiringVerdict] ||
              'from-zinc-500/10 to-zinc-800/5 border-zinc-500/20 text-zinc-200'
          )}
        >
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-80">
            <Award className="h-4 w-4" />
            Verdict
          </div>
          <div className="mt-1 text-2xl font-display font-semibold light:text-slate-900">
            {fitLabel}
          </div>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="rounded-lg bg-black/20 p-2 light:bg-white/40">
              <p className="text-[10px] uppercase opacity-80">Overall score</p>
              <p className="text-lg font-semibold">{overallScore.toFixed(1)}/10</p>
            </div>
            <div className="rounded-lg bg-black/20 p-2 light:bg-white/40">
              <p className="text-[10px] uppercase opacity-80">Confidence</p>
              <p className="text-lg font-semibold">{(confidence * 100).toFixed(0)}%</p>
            </div>
            <div className="rounded-lg bg-black/20 p-2 light:bg-white/40">
              <p className="text-[10px] uppercase opacity-80">Skill match</p>
              <p className="text-lg font-semibold">{(structured.match_percentage ?? Math.max(40, 100 - weak.length * 8)).toFixed(0)}%</p>
            </div>
            <div className="rounded-lg bg-black/20 p-2 light:bg-white/40">
              <p className="text-[10px] uppercase opacity-80">Consistency</p>
              <p className="text-lg font-semibold capitalize">{ev?.overall?.consistency || 'medium'}</p>
            </div>
          </div>
          <p className="text-sm opacity-90 mt-2 max-w-3xl light:text-slate-800">{report.executiveSummary}</p>
          {report.verdictReasoning && (
            <div className="mt-3 grid sm:grid-cols-3 gap-2 text-xs light:text-slate-800">
              {['skillCoverage', 'depth', 'confidence'].map((k) => (
                <div
                  key={k}
                  className="rounded-lg bg-black/20 p-2 light:bg-white/40"
                >
                  <div className="font-medium opacity-80 capitalize">
                    {k === 'skillCoverage' ? 'Skill coverage' : k}
                  </div>
                  <div className="mt-0.5 opacity-90">{report.verdictReasoning[k]}</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
      {structured.decision_trace && (
        <div className="glass rounded-2xl border border-cyan-400/20 p-5 light:bg-white/90">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-cyan-300">Agent decision trace</p>
              <h2 className="text-lg font-semibold text-white light:text-slate-900">Autonomous focus and reasoning</h2>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { label: 'Selected focus skill', value: structured.decision_trace.selectedFocusSkill },
              { label: 'Why selected', value: structured.decision_trace.whySelected },
              { label: 'Generated question', value: structured.decision_trace.generatedQuestion },
              { label: 'Difficulty', value: structured.decision_trace.difficulty },
              { label: 'Response quality', value: structured.decision_trace.responseQuality },
              { label: 'Next step', value: structured.decision_trace.nextStep },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm light:border-slate-200 light:bg-slate-50">
                <p className="text-[11px] uppercase tracking-wide text-zinc-500 light:text-slate-500">{item.label}</p>
                <p className="mt-1 text-sm text-zinc-100 light:text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {simulation && (
        <div className="glass rounded-2xl border border-emerald-500/20 p-5 light:bg-white/90">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-emerald-300">Simulation</p>
              <h2 className="text-lg font-semibold text-white light:text-slate-900">Candidate improvement preview</h2>
            </div>
            <button
              type="button"
              onClick={() => setSimulation(null)}
              className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-200 hover:bg-white/5"
            >
              Reset
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl bg-black/20 p-4 light:bg-slate-100">
              <p className="text-xs uppercase tracking-wide text-zinc-400">Before</p>
              <p className="mt-2 text-3xl font-semibold text-white light:text-slate-900">{simulation.overallBefore.toFixed(1)}/10</p>
              <p className="text-sm text-zinc-400 light:text-slate-600">{simulation.verdictBefore}</p>
            </div>
            <div className="rounded-xl bg-emerald-500/10 p-4 light:bg-emerald-50">
              <p className="text-xs uppercase tracking-wide text-emerald-500">After</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-200 light:text-emerald-900">{simulation.overallAfter.toFixed(1)}/10</p>
              <p className="text-sm text-emerald-200 light:text-emerald-800">{simulation.verdictAfter}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-4 min-h-[320px] light:bg-white/90">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-zinc-200 light:text-slate-900">Skill radar</h2>
            <Crosshair className="h-4 w-4 text-zinc-500" />
          </div>
          <p className="text-xs text-zinc-500 mb-3">Tested skills (interview) - 0-10</p>
          {radar.length > 0 ? (
            <div className="h-[280px] w-full">
              <ResponsiveContainer>
                <RadarChart data={radar} margin={{ top: 16, right: 8, left: 8, bottom: 0 }}>
                  <PolarGrid stroke="rgba(120,120,150,0.2)" />
                  <PolarAngleAxis
                    dataKey="skill"
                    tick={{ fontSize: 10, fill: 'currentColor' }}
                    className="text-zinc-500 light:text-slate-500"
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} tickCount={3} tick={{ fontSize: 9 }} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="rgb(99, 102, 241)"
                    fill="rgba(99, 102, 241, 0.35)"
                    fillOpacity={0.8}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No skill data.</p>
          )}
        </div>
        <div className="glass rounded-2xl p-4 light:bg-white/90">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-zinc-200 light:text-slate-900">Bar comparison</h2>
            <Layers className="h-4 w-4 text-zinc-500" />
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer>
              <BarChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9 }}
                  className="text-zinc-500"
                  height={50}
                />
                <YAxis domain={[0, 10]} tickCount={6} width={20} fontSize={10} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15,15,25,0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                  }}
                  labelStyle={{ color: '#e4e4e7' }}
                />
                <Bar dataKey="s" name="Score" fill="url(#b)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="b" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-4 light:bg-white/90">
          <h2 className="text-sm font-semibold text-zinc-200 light:text-slate-900 flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Claimed vs tested
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {claimed.slice(0, 6).map((c) => (
              <li
                key={c.name + c.context}
                className="flex justify-between gap-2 border-b border-white/5 pb-2 last:border-0"
              >
                <span className="text-zinc-200 light:text-slate-800 font-medium">{c.name}</span>
                <span className="text-xs text-zinc-500">
                  {testedNames.has(c.name) ? 'Tested in interview' : 'Not directly tested yet'}
                </span>
              </li>
            ))}
            {!claimed.length && <li className="text-zinc-500">No claim list available.</li>}
          </ul>
        </div>
        <div className="glass rounded-2xl p-4 light:bg-white/90">
          <h2 className="text-sm font-semibold text-zinc-200 light:text-slate-900">Weakest areas</h2>
          <div className="mt-3 space-y-3">
            {weak.map((w) => (
              <SkillRow
                key={w.n}
                name={w.n}
                value={w.s}
                sub={
                  w.c != null ? <span>conf. {(w.c * 100).toFixed(0)}%</span> : null
                }
                color="bg-emerald-500"
              />
            ))}
            {!weak.length && <p className="text-sm text-zinc-500"> - </p>}
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-4 light:bg-white/90">
        <h2 className="text-sm font-semibold text-zinc-200 light:text-slate-900">Why this score?</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {skills.slice(0, 4).map((sk) => (
            <div
              key={sk.skillName}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm light:border-slate-200 light:bg-slate-50"
            >
              <div className="flex justify-between font-medium text-zinc-100 light:text-slate-900">
                {sk.skillName}
                <span className="text-cyan-300 light:text-cyan-600">{Number(sk.score).toFixed(1)}/10</span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 line-clamp-3 light:text-slate-600">{sk.explanation}</p>
              {sk.strengths?.length ? (
                <p className="text-[11px] mt-1 text-emerald-300 light:text-emerald-700">
                  Strengths: {sk.strengths.slice(0, 2).join(' - ')}
                </p>
              ) : null}
              {sk.weaknesses?.length ? (
                <p className="text-[11px] mt-1 text-amber-300 light:text-amber-700">
                  Missed concepts: {sk.weaknesses.slice(0, 2).join(' - ')}
                </p>
              ) : null}
              {sk.resumeEvidence?.[0] && (
                <p className="text-[10px] text-zinc-500 mt-2 italic line-clamp-2 light:text-slate-500">
                  "{sk.resumeEvidence[0].snippet}"
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          {
            title: 'Scoring detail',
            icon: <Layers className="h-4 w-4" />,
            body: skills[0] ? 'Top skill score drives depth signals - open Report for all rows.' : ' - ',
          },
          {
            title: 'Next step',
            icon: <BookOpen className="h-4 w-4" />,
            body: report?.recommendedNextStep || learning?.weeklyRoadmap?.[0]?.focus || 'Review learning path in Report.',
          },
          {
            title: 'Gaps to watch',
            icon: <AlertCircle className="h-4 w-4" />,
            body: ev?.overall?.riskFactors?.[0] || (weak[0] ? `Priority: ${weak[0].n}` : ' - '),
          },
        ].map((c) => (
          <div key={c.title} className="glass rounded-xl p-3 text-sm text-zinc-300 light:text-slate-600">
            <div className="flex items-center gap-2 text-zinc-100 light:text-slate-900 text-xs font-semibold uppercase">
              {c.icon}
              {c.title}
            </div>
            <p className="mt-1.5">{c.body}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-4 light:bg-white/90">
        <h2 className="text-sm font-semibold text-zinc-200 light:text-slate-900">Learning roadmap</h2>
        <div className="mt-3 space-y-2">
          {(learning?.weeklyRoadmap || []).map((w) => (
            <details
              key={w.week}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 light:border-slate-200 light:bg-slate-50"
            >
              <summary className="cursor-pointer text-sm text-zinc-200 light:text-slate-800 font-medium">
                Week {w.week}: {w.focus}
              </summary>
              <ul className="mt-2 list-disc pl-5 text-xs text-zinc-400 light:text-slate-600">
                {(w.milestones || []).map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </details>
          ))}
          {!learning?.weeklyRoadmap?.length && (
            <p className="text-sm text-zinc-500 light:text-slate-500">Roadmap will appear after evaluation.</p>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="glass rounded-2xl p-4 light:bg-white/90">
          <h2 className="text-sm font-semibold text-zinc-200 light:text-slate-900">Strengths</h2>
          <ul className="mt-2 list-disc pl-5 text-sm text-zinc-400 light:text-slate-600">
            {(ev?.overall?.strengthsSummary || skills.flatMap((x) => x.strengths || [])).slice(0, 6).map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
        <div className="glass rounded-2xl p-4 light:bg-white/90">
          <h2 className="text-sm font-semibold text-zinc-200 light:text-slate-900">Skill gaps</h2>
          <ul className="mt-2 list-disc pl-5 text-sm text-zinc-400 light:text-slate-600">
            {(ev?.overall?.riskFactors || weak.map((x) => x.n)).slice(0, 6).map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="glass rounded-2xl p-4 light:bg-white/90">
        <h2 className="text-sm font-semibold text-zinc-200 light:text-slate-900">Skill-by-skill breakdown</h2>
        <div className="mt-3 grid gap-2">
          {skills.map((sk) => {
            const status = Number(sk.score) >= 7.5 ? 'Strong' : Number(sk.score) >= 5.5 ? 'Moderate' : 'Needs Work';
            return (
              <div
                key={`row-${sk.skillName}`}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-3 light:border-slate-200 light:bg-slate-50"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-zinc-100 light:text-slate-900">{sk.skillName}</p>
                  <div className="inline-flex items-center gap-2">
                    <span className="text-xs text-zinc-400">{status}</span>
                    <span className="text-sm text-cyan-300 light:text-cyan-600">{Number(sk.score).toFixed(1)}/10</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mt-1 line-clamp-2 light:text-slate-600">{sk.explanation}</p>
                <p className="text-xs text-zinc-500 mt-1 line-clamp-1 light:text-slate-600">
                  Evidence: {sk.resumeEvidence?.[0]?.snippet || sk.answerSnippets?.[0]?.excerpt || 'No direct evidence found'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass rounded-2xl p-4 light:bg-white/90">
        <h2 className="text-sm font-semibold text-zinc-200 light:text-slate-900">Actionable recommendations</h2>
        <ul className="mt-2 grid md:grid-cols-2 gap-2 text-sm text-zinc-300 light:text-slate-700">
          <li className="rounded-lg border border-white/10 p-2 light:border-slate-200">Review learning plan and execute Week 1 tasks.</li>
          <li className="rounded-lg border border-white/10 p-2 light:border-slate-200">Re-assess low-confidence skills with another short interview.</li>
          <li className="rounded-lg border border-white/10 p-2 light:border-slate-200">Prioritize critical gaps before final hiring decision.</li>
          <li className="rounded-lg border border-white/10 p-2 light:border-slate-200">Use report evidence panel for recruiter debrief.</li>
        </ul>
      </div>
    </div>
  );
}
