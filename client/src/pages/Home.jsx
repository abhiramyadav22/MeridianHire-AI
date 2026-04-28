import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Briefcase,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Database,
  Download,
  FileCheck2,
  FileText,
  FileUp,
  Gauge,
  Lock,
  PlayCircle,
  RotateCcw,
  Save,
  SearchCheck,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Upload,
  Wand2,
} from 'lucide-react';
import { api } from '../lib/api';
import { useSession } from '../context/SessionContext';
import { DEMO_RESUME, DEMO_JD } from '../data/demoData';
import { clsx } from '../components/ui/cn';
import { Stepper } from '../components/Stepper';
import { PipelineFlow } from '../components/PipelineFlow';

const DRAFT_KEY = 'meridian-hire-command-draft';

const rolePresets = [
  {
    id: 'platform',
    title: 'Senior Platform Engineer',
    meta: 'Node, Kafka, PostgreSQL, SRE',
    jd: DEMO_JD,
  },
  {
    id: 'frontend',
    title: 'Frontend Product Engineer',
    meta: 'React, UX systems, testing',
    jd: `Job: Frontend Product Engineer
Location: Remote

About the role
We need a product-minded frontend engineer to build complex customer workflows with React, TypeScript, design systems, and strong collaboration with product and design.

You will
- Ship accessible, polished React interfaces for high-value workflows
- Partner with backend engineers on API contracts and data loading patterns
- Improve performance, test coverage, and release quality
- Translate ambiguous product problems into maintainable UI architecture

Requirements
- Strong React, TypeScript, state management, and component architecture
- Experience with testing user workflows and measuring frontend performance
- Comfortable collaborating with PM, design, and backend teams
- Clear written communication and ownership mindset`,
  },
  {
    id: 'backend',
    title: 'Backend Systems Engineer',
    meta: 'APIs, reliability, scale',
    jd: `Job: Backend Systems Engineer
Location: Hybrid

About the role
We are hiring a backend engineer to own critical services, API contracts, observability, and high-reliability system design.

You will
- Design and maintain Node.js/TypeScript services with strong API contracts
- Own PostgreSQL data models, queue consumers, and reliability improvements
- Build dashboards, alerts, and incident response workflows
- Partner with product and frontend teams on customer-facing systems

Requirements
- 4+ years backend engineering experience
- Strong API design, SQL, distributed systems, and testing fundamentals
- Experience with queues, caching, observability, and production operations
- Ability to communicate trade-offs clearly`,
  },
];

const assessmentModes = [
  { id: 'balanced', label: 'Match Report', detail: 'Balanced role-fit scan for resume, JD, and interview evidence.' },
  { id: 'senior_system', label: 'Senior Systems', detail: 'Harder architecture, reliability, queues, and API trade-offs.' },
  { id: 'frontend_product', label: 'Product Frontend', detail: 'React workflows, UX quality, release confidence, and API collaboration.' },
  { id: 'speed_screen', label: 'Fast Screen', detail: 'Short recruiter-friendly pass focused on strongest evidence and risks.' },
];

const guardrailOptions = [
  { id: 'evidenceOnly', label: 'Evidence-based scoring', icon: SearchCheck },
  { id: 'biasCheck', label: 'Bias risk check', icon: ShieldCheck },
  { id: 'learningPlan', label: 'Learning roadmap', icon: FileCheck2 },
];

const atsChecks = [
  ['ATS Parse Rate', 'Checks structure and keyword readability.'],
  ['Skill Match', 'Maps candidate skills to role requirements.'],
  ['Impact Quality', 'Looks for measurable outcomes and ownership.'],
  ['Interview Depth', 'Adapts technical questions to evidence gaps.'],
  ['Report Export', 'Produces recruiter-ready score and recommendations.'],
];

const platformTabs = [
  { label: 'Match Report', icon: FileText },
  { label: 'One-Click Optimize', icon: Sparkles },
  { label: 'Job Match', icon: Briefcase },
  { label: 'Interview AI', icon: BrainCircuit },
  { label: 'Learning Plan', icon: FileCheck2 },
];

const workflowCards = [
  {
    title: 'Resume + JD scanning',
    body: 'Paste context or load a role preset, then scan for skills, gaps, and evidence quality.',
    icon: Database,
  },
  {
    title: 'Adaptive technical interview',
    body: 'Mode-specific questions probe backend, frontend, systems, or fast-screen signals.',
    icon: BrainCircuit,
  },
  {
    title: 'Hiring decision report',
    body: 'Dashboard, score, confidence, risks, and printable report are generated from one flow.',
    icon: BarChart3,
  },
  {
    title: 'Governed recommendations',
    body: 'Guardrails keep the output explainable, evidence-backed, and human-reviewed.',
    icon: Lock,
  },
];

function wordCount(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length;
}

function ProductPreview({ readiness, selectedMode }) {
  const score = Math.max(24, readiness.score);
  return (
    <div className="relative mx-auto w-full max-w-[620px] rounded-[28px] bg-white/80 p-4 shadow-2xl shadow-sky-200/60 ring-1 ring-slate-200">
      <div className="rounded-[22px] border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
            <Sparkles className="h-4 w-4" />
            Meridian Hire
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Live score
          </span>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-[150px_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-center text-sm font-semibold text-slate-700">ATS Score</p>
            <div className="conic-preview relative mx-auto mt-4 grid h-28 w-28 place-items-center rounded-full">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-white text-2xl font-bold text-slate-950">
                {score}%
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {['Content', 'Format', 'Skills'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-[#f7f9fd] p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase text-slate-500">Content checks</p>
              <span className="rounded-full bg-sky-100 px-2 py-1 text-[11px] font-semibold text-sky-700">
                {selectedMode.label}
              </span>
            </div>
            <div className="mt-5 space-y-4">
              {[92, readiness.resumeReady ? 82 : 46, readiness.jdReady ? 76 : 40].map((width, index) => (
                <div key={index}>
                  <div className="mb-2 flex justify-between text-xs text-slate-500">
                    <span>{['ATS parse rate', 'Keyword match', 'Impact signal'][index]}</span>
                    <span>{width}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-[#1478e8]" style={{ width: `${width}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-bold uppercase text-slate-500">Skill gap insight</p>
              <div className="mt-3 h-2 rounded-full bg-slate-200">
                <div className="h-full w-2/3 rounded-full bg-[#18c79a]" />
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Strong backend signals. Validate system-design depth through interview follow-up.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const draftInputRef = useRef(null);
  const resumeFileRef = useRef(null);
  const { setSession, setPhase } = useSession();
  const [resume, setResume] = useState('');
  const [jd, setJd] = useState('');
  const [assessmentMode, setAssessmentMode] = useState('balanced');
  const [guardrails, setGuardrails] = useState({
    evidenceOnly: true,
    biasCheck: true,
    learningPlan: true,
  });
  const [recentSessions, setRecentSessions] = useState([]);
  const [err, setErr] = useState(null);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(null);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [pipelineLabel, setPipelineLabel] = useState('');

  const readiness = useMemo(() => {
    const resumeWords = wordCount(resume);
    const jdWords = wordCount(jd);
    const resumeReady = resumeWords >= 45;
    const jdReady = jdWords >= 45;
    const guardrailReady = Object.values(guardrails).some(Boolean);
    const score = [resumeReady, jdReady, Boolean(assessmentMode), guardrailReady].filter(Boolean).length * 25;
    return { resumeWords, jdWords, resumeReady, jdReady, guardrailReady, score };
  }, [assessmentMode, guardrails, jd, resume]);

  const selectedMode = assessmentModes.find((mode) => mode.id === assessmentMode) || assessmentModes[0];

  const refreshSessions = async () => {
    try {
      const sessions = await api.listSessions();
      setRecentSessions(sessions.slice(0, 4));
    } catch {
      setRecentSessions([]);
    }
  };

  useEffect(() => {
    void refreshSessions();
  }, []);

  const runPipeline = async (demo) => {
    setErr(null);
    setNotice(null);
    setBusy(true);
    setPhase('creating');
    setStep('Analyzing resume');
    setPipelineStep(0);
    setPipelineLabel('Analyzing resume...');
    try {
      const r = demo ? DEMO_RESUME : resume;
      const j = demo ? DEMO_JD : jd;
      if (!r?.trim() || !j?.trim()) {
        throw new Error('Add resume and job description text, or use Try demo.');
      }
      const { sessionId } = await api.createSession(r, j, {
        assessmentMode,
        guardrails,
      });
      setSession(sessionId, demo);
      setPipelineStep(1);
      setStep('Extracting skills');
      setPipelineLabel('Extracting skills...');
      setPhase('extracting');
      await new Promise((res) => setTimeout(res, 400));
      await api.initialize(sessionId);
      setPipelineStep(2);
      setPipelineLabel('Generating questions...');
      setPhase('interview');
      setStep(null);
      navigate(`/assessment${demo ? '?judge=1' : ''}`);
    } catch (e) {
      setErr(e.message || 'Something went wrong');
      setStep(null);
      setPipelineLabel('');
      setPhase('idle');
    } finally {
      setBusy(false);
    }
  };

  const loadDemoText = () => {
    setResume(DEMO_RESUME);
    setJd(DEMO_JD);
    setAssessmentMode('senior_system');
    setErr(null);
    setNotice('Sample senior-platform case loaded.');
  };

  const applyPreset = (preset) => {
    setJd(preset.jd);
    setErr(null);
    setNotice(`${preset.title} role preset applied.`);
  };

  const readTextFile = async (file) => {
    const text = await file.text();
    if (file.name.endsWith('.json')) {
      const data = JSON.parse(text);
      return data.resume || data.resumeText || text;
    }
    return text;
  };

  const importResumeText = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await readTextFile(file);
      setResume(text);
      setErr(null);
      setNotice(`${file.name} loaded into resume field.`);
    } catch {
      setErr('Upload a readable TXT, MD, or JSON file for this browser demo.');
    } finally {
      event.target.value = '';
    }
  };

  const toggleGuardrail = (id) => {
    setGuardrails((current) => ({ ...current, [id]: !current[id] }));
  };

  const saveDraft = () => {
    window.localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ resume, jd, assessmentMode, guardrails, savedAt: new Date().toISOString() })
    );
    setNotice('Draft saved in this browser.');
  };

  const loadDraft = () => {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) {
      setErr('No saved draft found.');
      return;
    }
    try {
      const draft = JSON.parse(raw);
      setResume(draft.resume || '');
      setJd(draft.jd || '');
      setAssessmentMode(draft.assessmentMode || 'balanced');
      setGuardrails({ evidenceOnly: true, biasCheck: true, learningPlan: true, ...(draft.guardrails || {}) });
      setErr(null);
      setNotice('Draft restored.');
    } catch {
      setErr('Saved draft could not be read.');
    }
  };

  const exportDraft = () => {
    const payload = JSON.stringify({ resume, jd, assessmentMode, guardrails }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'meridian-hire-assessment-draft.json';
    link.click();
    URL.revokeObjectURL(url);
    setNotice('Draft exported.');
  };

  const importDraft = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const draft = JSON.parse(text);
      setResume(draft.resume || '');
      setJd(draft.jd || '');
      setAssessmentMode(draft.assessmentMode || 'balanced');
      setGuardrails({ evidenceOnly: true, biasCheck: true, learningPlan: true, ...(draft.guardrails || {}) });
      setErr(null);
      setNotice('Draft imported.');
    } catch {
      setErr('Imported file must be a Meridian Hire JSON draft.');
    } finally {
      event.target.value = '';
    }
  };

  const clearDraft = () => {
    setResume('');
    setJd('');
    setAssessmentMode('balanced');
    setGuardrails({ evidenceOnly: true, biasCheck: true, learningPlan: true });
    setErr(null);
    setNotice('Workspace cleared.');
  };

  const openSession = (session) => {
    setSession(session.id, false);
    setPhase(session.hasEvaluation ? 'ready' : 'interview');
    navigate(session.hasEvaluation ? '/dashboard' : '/assessment');
  };

  const launchChecks = [
    { label: 'Resume loaded', done: readiness.resumeReady, detail: `${readiness.resumeWords} words` },
    { label: 'Role loaded', done: readiness.jdReady, detail: `${readiness.jdWords} words` },
    { label: 'Mode selected', done: Boolean(assessmentMode), detail: selectedMode.label },
    { label: 'Guardrails on', done: readiness.guardrailReady, detail: `${Object.values(guardrails).filter(Boolean).length}/3 active` },
  ];

  return (
    <div>
      <section className="relative overflow-hidden bg-[#f7fbff]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,154,0.22),transparent_34%),radial-gradient(circle_at_70%_42%,rgba(59,130,246,0.18),transparent_32%),linear-gradient(120deg,#ffffff_0%,#eef8ff_58%,#f8f5ff_100%)]" />
        <div className="relative mx-auto grid min-h-[720px] max-w-7xl gap-10 px-4 py-16 md:px-8 lg:grid-cols-[minmax(0,1fr)_560px] lg:items-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm font-bold uppercase tracking-wide text-[#635bff]">AI Resume + Skill Checker</p>
            <h1 className="mt-6 max-w-3xl font-display text-5xl font-bold leading-tight text-slate-950 md:text-7xl">
              Optimize your resume to get{' '}
              <span className="text-[#1478e8]">more interviews</span>
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-slate-600">
              Scan resume evidence against a job description, run an adaptive technical interview,
              and generate a recruiter-ready match report with learning recommendations.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => runPipeline(false)} disabled={busy} className="btn-primary bg-[#1478e8] px-7 py-4 text-base hover:bg-[#0f66c8]">
                Scan Resume For Free
              </button>
              <button type="button" onClick={loadDemoText} disabled={busy} className="btn-secondary border-slate-300 bg-white px-7 py-4 text-base text-slate-900">
                <Wand2 className="h-5 w-5" />
                Try sample
              </button>
            </div>

            <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
              {[
                ['18+', 'ATS & quality checks'],
                ['4', 'interview modes'],
                ['Local', 'browser session data'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                  <p className="text-2xl font-bold text-slate-950">{value}</p>
                  <p className="mt-1 text-sm text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            <ProductPreview readiness={readiness} selectedMode={selectedMode} />
          </motion.div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          {(step || busy) && <PipelineFlow activeStep={pipelineStep} label={pipelineLabel} />}
          {step && <Stepper label={step} />}
          {err && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {err}
            </div>
          )}
          {notice && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {notice}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Free ATS resume checker</p>
                  <h2 className="mt-1 text-3xl font-bold text-slate-950">Uncover gaps before recruiters do</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <input
                    ref={resumeFileRef}
                    type="file"
                    accept=".txt,.md,.json"
                    className="hidden"
                    onChange={importResumeText}
                  />
                  <button type="button" onClick={() => resumeFileRef.current?.click()} className="btn-secondary border-slate-300 bg-white text-slate-900">
                    <Upload className="h-4 w-4" />
                    Upload text
                  </button>
                  <button type="button" onClick={() => runPipeline(true)} className="btn-primary bg-[#18c79a] hover:bg-[#13ad86]">
                    <FileUp className="h-4 w-4" />
                    Auto demo
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-5 xl:grid-cols-2">
                <label>
                  <span className="text-sm font-bold uppercase tracking-wide text-slate-500">Resume</span>
                  <textarea
                    className="mt-2 min-h-[300px] w-full resize-y rounded-2xl border border-dashed border-emerald-400 bg-emerald-50/30 p-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    placeholder="Drop your resume text here or paste it..."
                    value={resume}
                    onChange={(e) => setResume(e.target.value)}
                  />
                  <p className="mt-2 text-xs text-slate-500">{readiness.resumeWords} words. TXT/MD/JSON upload supported in this browser demo.</p>
                </label>
                <label>
                  <span className="text-sm font-bold uppercase tracking-wide text-slate-500">Job description</span>
                  <textarea
                    className="mt-2 min-h-[300px] w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                    placeholder="Paste job description, role scope, and requirements..."
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                  />
                  <p className="mt-2 text-xs text-slate-500">{readiness.jdWords} words. Use a preset if you need sample data.</p>
                </label>
              </div>

              <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => runPipeline(false)} disabled={busy} className="btn-primary bg-[#1478e8] hover:bg-[#0f66c8]">
                    <PlayCircle className="h-4 w-4" />
                    Start assessment
                  </button>
                  <button type="button" onClick={saveDraft} className="btn-secondary border-slate-300 bg-white text-slate-900">
                    <Save className="h-4 w-4" />
                    Save draft
                  </button>
                  <button type="button" onClick={loadDraft} className="btn-secondary border-slate-300 bg-white text-slate-900">
                    <Clock3 className="h-4 w-4" />
                    Restore
                  </button>
                </div>
                <div className="min-w-[240px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span className="inline-flex items-center gap-2 text-slate-700">
                      <Gauge className="h-4 w-4 text-emerald-500" />
                      Readiness
                    </span>
                    <span className="text-slate-950">{readiness.score}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-[#18c79a]" style={{ width: `${readiness.score}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-5">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
                <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Role presets</p>
                <div className="mt-4 grid gap-3">
                  {rolePresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-sky-300 hover:bg-sky-50"
                    >
                      <Briefcase className="h-4 w-4 text-sky-600" />
                      <p className="mt-3 font-bold text-slate-950">{preset.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{preset.meta}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
                <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Assessment mode</p>
                <div className="mt-4 space-y-2">
                  {assessmentModes.map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setAssessmentMode(mode.id)}
                      className={clsx(
                        'w-full rounded-2xl border p-4 text-left transition',
                        assessmentMode === mode.id
                          ? 'border-sky-500 bg-sky-50 text-sky-900'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      )}
                    >
                      <span className="font-bold">{mode.label}</span>
                      <span className="mt-1 block text-sm opacity-75">{mode.detail}</span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-[#f6fbff] py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <h2 className="text-center text-3xl font-bold text-slate-950">All-in-one hiring assessment platform</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {platformTabs.map(({ label, icon: Icon }, index) => (
              <div
                key={label}
                className={clsx(
                  'inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-bold shadow-sm',
                  index === 0 ? 'border-sky-400 bg-sky-50 text-sky-700' : 'border-slate-200 bg-white text-slate-700'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Quality checks</p>
                <ClipboardCheck className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="mt-5 space-y-4">
                {atsChecks.map(([title, body]) => (
                  <div key={title} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="font-bold text-slate-950">{title}</p>
                      <p className="mt-1 text-sm text-slate-500">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {workflowCards.map(({ title, body, icon: Icon }) => (
                <div key={title} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-50 text-sky-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-slate-950">{title}</h3>
                  <p className="mt-2 leading-7 text-slate-600">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Guardrails</p>
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {guardrailOptions.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleGuardrail(id)}
                    className={clsx(
                      'rounded-2xl border p-4 text-left transition',
                      guardrails[id] ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-white text-slate-600'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <p className="mt-3 text-sm font-bold">{label}</p>
                    <p className="mt-1 text-xs opacity-70">{guardrails[id] ? 'Enabled' : 'Disabled'}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Draft + sessions</p>
                <SlidersHorizontal className="h-5 w-5 text-sky-600" />
              </div>
              <input ref={draftInputRef} type="file" accept="application/json" className="hidden" onChange={importDraft} />
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={exportDraft} className="btn-secondary border-slate-300 bg-white text-slate-900">
                  <Download className="h-4 w-4" />
                  Export draft
                </button>
                <button type="button" onClick={() => draftInputRef.current?.click()} className="btn-secondary border-slate-300 bg-white text-slate-900">
                  <Upload className="h-4 w-4" />
                  Import draft
                </button>
                <button type="button" onClick={clearDraft} className="btn-secondary border-slate-300 bg-white text-slate-900">
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>
              <div className="mt-5 grid gap-2">
                {recentSessions.length ? (
                  recentSessions.map((session) => (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => openSession(session)}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:bg-sky-50"
                    >
                      <span>
                        <span className="block text-sm font-bold text-slate-950">{session.candidateName}</span>
                        <span className="block text-xs text-slate-500">{session.roleTitle}</span>
                      </span>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-sky-700">
                        {session.hasEvaluation ? 'Report' : 'Open'}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                    Recent assessments will appear here after your first scan.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-12 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-emerald-300">Ready for the full pipeline?</p>
            <h2 className="mt-2 text-3xl font-bold">Start with a resume scan, finish with a hiring report.</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => runPipeline(false)} className="btn-primary bg-[#18c79a] px-6 py-3 hover:bg-[#13ad86]">
              Start assessment
            </button>
            <Link to="/dashboard" className="btn-secondary border-white/20 bg-white/10 px-6 py-3 text-white hover:bg-white/15">
              View dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
