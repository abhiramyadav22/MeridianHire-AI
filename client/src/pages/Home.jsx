import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, FileUp, ArrowRight, Wand2, Eye, ShieldCheck, BrainCircuit, BarChart3 } from 'lucide-react';
import { api } from '../lib/api';
import { useSession } from '../context/SessionContext';
import { DEMO_RESUME, DEMO_JD } from '../data/demoData';
import { clsx } from '../components/ui/cn';
import { Stepper } from '../components/Stepper';
import { PipelineFlow } from '../components/PipelineFlow';
import { StatCard } from '../components/ui/StatCard';
import { SectionHeader } from '../components/ui/SectionHeader';

export default function Home() {
  const navigate = useNavigate();
  const { setSession, setPhase } = useSession();
  const [resume, setResume] = useState('');
  const [jd, setJd] = useState('');
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(null);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [pipelineLabel, setPipelineLabel] = useState('');

  const runPipeline = async (demo) => {
    setErr(null);
    setBusy(true);
    setPhase('creating');
    setStep('Analyzing resume');
    setPipelineStep(0);
    setPipelineLabel('Analyzing resume…');
    try {
      const r = demo ? DEMO_RESUME : resume;
      const j = demo ? DEMO_JD : jd;
      if (!r?.trim() || !j?.trim()) {
        throw new Error('Add a resume and job description, or use Try demo.');
      }
      const { sessionId } = await api.createSession(r, j);
      setSession(sessionId, demo);
      setPipelineStep(1);
      setStep('Extracting skills');
      setPipelineLabel('Extracting skills…');
      setPhase('extracting');
      await new Promise((res) => setTimeout(res, 400));
      await api.initialize(sessionId);
      setPipelineStep(2);
      setPipelineLabel('Generating questions…');
      setPhase('interview');
      setStep(null);
      const q = demo ? '?judge=1' : '';
      navigate(`/assessment${q}`);
    } catch (e) {
      setErr(e.message || 'Something went wrong');
      setStep(null);
      setPipelineLabel('');
      setPhase('idle');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300 light:text-slate-600 light:bg-white light:border-slate-200">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          Autonomous multi-agent assessment
        </div>
        <h1 className="mt-4 font-display text-3xl md:text-4xl font-semibold tracking-tight text-white light:text-slate-900">
          The hiring experience candidates expect.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-500">
            Structured. Fair. Actionable.
          </span>
        </h1>
        <p className="mt-2 text-zinc-400 text-lg max-w-2xl light:text-slate-600">
          Resume plus job description, skill extraction, adaptive interview, live scoring, verdict, and a learning
          plan — presented in a dashboard built for real recruiting teams.
        </p>
      </motion.div>

      {(step || busy) && <PipelineFlow activeStep={pipelineStep} label={pipelineLabel} />}
      {step && <Stepper label={step} />}

      {err && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200 light:bg-red-50 light:text-red-800 light:border-red-200">
          {err}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span
            className={clsx(
              'text-xs font-medium text-zinc-500 uppercase tracking-wider',
              'light:text-slate-500'
            )}
          >
            Resume
          </span>
          <textarea
            className={clsx(
              'mt-1.5 w-full min-h-[200px] rounded-xl border border-white/10 bg-white/5 p-3 text-sm',
              'text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40',
              'light:bg-white light:border-slate-200 light:text-slate-900'
            )}
            placeholder="Paste the candidate resume…"
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            disabled={busy}
          />
        </label>
        <label className="block">
          <span
            className={clsx(
              'text-xs font-medium text-zinc-500 uppercase tracking-wider',
              'light:text-slate-500'
            )}
          >
            Job description
          </span>
          <textarea
            className={clsx(
              'mt-1.5 w-full min-h-[200px] rounded-xl border border-white/10 bg-white/5 p-3 text-sm',
              'text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/40',
              'light:bg-white light:border-slate-200 light:text-slate-900'
            )}
            placeholder="Paste the open role and requirements…"
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            disabled={busy}
          />
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => runPipeline(true)}
          className={clsx(
            'inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600',
            'px-5 py-2.5 text-sm font-semibold text-white shadow-glass-lg hover:opacity-95',
            'disabled:opacity-50'
          )}
        >
          <Wand2 className="h-4 w-4 text-amber-200" />
          Try demo
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => runPipeline(false)}
          className={clsx(
            'inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5',
            'px-5 py-2.5 text-sm font-medium text-zinc-100 hover:bg-white/10',
            'light:border-slate-200 light:bg-white light:text-slate-800 light:shadow',
            'disabled:opacity-50'
          )}
        >
          <FileUp className="h-4 w-4" />
          Start assessment
        </button>
        <a
          href="#how"
          className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-200 self-center light:text-slate-500"
        >
          How it works <ArrowRight className="h-4 w-4" />
        </a>
      </div>
      <p className="mt-2 text-xs text-zinc-500 light:text-slate-500">
        Try demo loads a strong sample resume and JD, then auto-runs the full pipeline in judge mode.
      </p>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="JD parsed" value="98%" hint="Role requirements normalized" icon={<BarChart3 className="h-4 w-4" />} />
        <StatCard label="Skills extracted" value="12" hint="Resume + JD overlap" icon={<BrainCircuit className="h-4 w-4" />} />
        <StatCard label="Confidence score" value="82%" hint="Evidence-backed reliability" tone="success" icon={<ShieldCheck className="h-4 w-4" />} />
        <StatCard label="Hiring verdict" value="Moderate Fit" hint="Explainable and actionable" tone="warn" icon={<Sparkles className="h-4 w-4" />} />
      </div>

      <section id="how" className="mt-16 border-t border-white/10 pt-10 light:border-slate-200">
        <SectionHeader
          eyebrow="Pipeline preview"
          title="How the AI hiring engine works"
          subtitle="A multi-agent sequence with explainable signals at every stage."
        />
        <ul className="mt-4 grid sm:grid-cols-2 gap-3 text-sm text-zinc-400 light:text-slate-600">
          {[
            { t: 'Resume + JD ingestion', d: 'Normalize candidate and role context' },
            { t: 'Skill extraction', d: 'Map required vs claimed competencies' },
            { t: 'Gap detection', d: 'Highlight critical and adjacent missing skills' },
            { t: 'Adaptive interview', d: 'Difficulty adjusts to candidate answers' },
            { t: 'Scoring + verdict', d: 'Evidence-based performance evaluation' },
            { t: 'Learning plan generation', d: 'Weekly roadmap with resources' },
          ].map((x) => (
            <li key={x.t} className="glass rounded-xl p-3">
              <div className="text-zinc-200 font-medium light:text-slate-800">{x.t}</div>
              <div className="text-zinc-500 text-xs mt-0.5 light:text-slate-500">{x.d}</div>
            </li>
          ))}
        </ul>
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="glass rounded-xl p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Sample output preview</p>
            <div className="space-y-2 text-sm">
              <p className="text-zinc-200 light:text-slate-800 font-medium inline-flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Verdict: Moderate Fit
              </p>
              <p className="text-zinc-400 light:text-slate-600">Overall score: 7.1 / 10 · Confidence: 82%</p>
              <p className="text-zinc-500 light:text-slate-500">Missing skills: large-scale DSA optimization, queue design tradeoffs</p>
            </div>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Why judges love demo mode</p>
            <p className="text-sm text-zinc-400 light:text-slate-600">
              One click auto-fills data, simulates interview answers, and lands directly on dashboard + report.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <SectionHeader
          eyebrow="Why it is better"
          title="Built for trust, fairness, and actionability"
          subtitle="Not a black box chatbot — a recruiter-ready decision tool."
        />
        <div className="mt-4 grid md:grid-cols-2 gap-3">
          {[
            ['Evidence-based scoring', 'Every score cites resume and interview evidence snippets.'],
            ['Adaptive interview flow', 'Strong answers increase depth; weak answers trigger fundamentals.'],
            ['Explainable verdicts', 'Verdict includes coverage, depth, confidence, and risks.'],
            ['Personalized roadmap', 'Critical gaps convert into weekly tasks and curated resources.'],
          ].map(([title, body]) => (
            <div key={title} className="glass rounded-xl p-4">
              <p className="text-sm font-semibold text-zinc-200 light:text-slate-900">{title}</p>
              <p className="text-xs text-zinc-500 light:text-slate-500 mt-1">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
