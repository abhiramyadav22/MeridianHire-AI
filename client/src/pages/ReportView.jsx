import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Printer, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useSession } from '../context/SessionContext';
import { VerdictBadge } from '../components/ui/VerdictBadge';
import { LearningPlanTimeline } from '../components/LearningPlanTimeline';
export default function ReportView() {
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
      <div className="text-sm text-red-300 flex items-center justify-between gap-2 light:text-red-800">
        <span className="inline-flex gap-2 items-center"><AlertCircle className="h-4 w-4" />{err}</span>
        <button
          type="button"
          className="rounded-lg border border-red-400/40 px-2 py-1 text-xs hover:bg-red-500/10"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }
  if (!s) {
    return <div className="h-40 max-w-2xl rounded-xl bg-white/5 animate-pulse" />;
  }

  const r = s.report;
  const ev = s.evaluation;
  const l = s.learningPlan;
  const skills = ev?.skillEvaluations || [];
  const structured = s.structuredOutput;

  const onPrint = () => window.print();
  const onCopySummary = async () => {
    const summary = `${r?.hiringVerdict || 'Verdict'} | Score ${(structured?.overall_score || 0).toFixed(1)}/10 | Confidence ${((structured?.confidence || 0) * 100).toFixed(0)}% | ${r?.executiveSummary || ''}`;
    try {
      await navigator.clipboard.writeText(summary);
    } catch (_e) {
      // ignore copy failures
    }
  };

  const scrollToSkill = (skillName) => {
    const id = `skill-${skillName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div>
      <div className="no-print surface-panel mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl p-4">
        <div>
          <p className="muted-label">Exportable artifact</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-slate-50 light:text-slate-950">Hiring report</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCopySummary}
            className="btn-secondary"
          >
            Copy summary
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="btn-secondary"
          >
            <Printer className="h-4 w-4" />
            Export (print to PDF)
          </button>
        </div>
      </div>

      <div id="printable-report" className="print-root text-slate-900 max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow print:shadow-none">
        <div className="text-xs text-slate-500">Meridian Hire</div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Assessment report</h1>
        <p className="text-sm text-slate-600 mt-1">Role: {s.skillExtraction?.roleTitle || 'N/A'}</p>

        <section className="mt-8">
          <h2 className="text-lg font-semibold border-b pb-1">Hiring verdict</h2>
          <div className="mt-2">
            <VerdictBadge verdict={r?.hiringVerdict} />
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-lg border border-slate-200 p-2">
              <p className="text-slate-500">Overall score</p>
              <p className="font-semibold">{(structured?.overall_score || 0).toFixed(1)}/10</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-2">
              <p className="text-slate-500">Confidence</p>
              <p className="font-semibold">{((structured?.confidence || 0) * 100).toFixed(0)}%</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-2">
              <p className="text-slate-500">Recommendation</p>
              <p className="font-semibold line-clamp-2">{r?.recommendedNextStep || 'Review roadmap'}</p>
            </div>
          </div>
          <p className="text-sm text-slate-700 mt-2 leading-relaxed">{r?.executiveSummary}</p>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold border-b pb-1">Key insights</h2>
          <ul className="list-disc pl-4 mt-2 text-sm text-slate-800 space-y-1">
            {(r?.keyInsights || []).map((i, j) => (
              <li key={j}>
                <strong>{i.headline}:</strong> {i.detail}
              </li>
            ))}
          </ul>
          {skills.length > 0 && (
            <div className="mt-4 rounded-xl border border-slate-200/70 bg-slate-50 p-3 text-xs text-slate-600 light:bg-slate-100">
              <p className="font-semibold text-slate-900 mb-2">Jump to skill evidence</p>
              <div className="flex flex-wrap gap-2">
                {skills.map((sk) => (
                  <button
                    key={sk.skillName}
                    type="button"
                    onClick={() => scrollToSkill(sk.skillName)}
                    className="rounded-full border border-slate-200/80 bg-white px-3 py-1 text-xs text-slate-700 transition hover:bg-slate-100"
                  >
                    {sk.skillName}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold border-b pb-1">Per-skill evidence</h2>
          <div className="mt-3 space-y-4 text-sm text-slate-800">
            {skills.map((sk) => {
              const skillId = `skill-${sk.skillName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
              return (
                <details key={sk.skillName} id={skillId} className="border border-slate-200 rounded-lg p-3 break-inside-avoid bg-slate-950/5 light:bg-slate-50">
                  <summary className="flex items-center justify-between cursor-pointer font-semibold text-slate-900 light:text-slate-900">
                    <span>{sk.skillName}</span>
                    <span className="text-cyan-600">{Number(sk.score).toFixed(1)}/10</span>
                  </summary>
                  <div className="mt-3 space-y-2 text-slate-700 light:text-slate-800">
                    <p>{sk.explanation}</p>
                    <p className="text-xs text-slate-500 light:text-slate-600">Confidence: {((sk.confidence || 0) * 100).toFixed(0)}%</p>
                    {sk.strengths?.length > 0 && (
                      <p className="mt-1 text-emerald-800 text-xs light:text-emerald-700">Strengths: {sk.strengths.join(' - ')}</p>
                    )}
                    {sk.weaknesses?.length > 0 && (
                      <p className="mt-1 text-amber-800 text-xs light:text-amber-700">Gaps: {sk.weaknesses.join(' - ')}</p>
                    )}
                    {(sk.resumeEvidence?.length > 0 || sk.answerSnippets?.length > 0) && (
                      <div className="mt-2 rounded-xl border border-slate-200/70 bg-white/5 p-3 text-xs text-slate-500 light:border-slate-200 light:bg-white/95 light:text-slate-700">
                        <div className="font-semibold uppercase tracking-wide text-[11px] text-slate-500 light:text-slate-500">Evidence</div>
                        {sk.resumeEvidence?.map((e, n) => (
                          <p key={`resume-${n}`} className="mt-1 italic">"{e.snippet}" - {e.relevance}</p>
                        ))}
                        {sk.answerSnippets?.map((e, n) => (
                          <p key={`answer-${n}`} className="mt-1 italic">"{e.excerpt}" - {e.turnHint}</p>
                        ))}
                      </div>
                    )}
                    {!sk.resumeEvidence?.length && !sk.answerSnippets?.length && (
                      <p className="text-xs text-slate-500 light:text-slate-600 italic">No direct quote evidence available; use this section to cross-check candidate answers during debrief.</p>
                    )}
                  </div>
                </details>
              );
            })}
          </div>
        </section>

        {l && (
          <section className="mt-6">
            <h2 className="text-lg font-semibold border-b pb-1">Learning roadmap</h2>
            <h3 className="text-sm font-medium mt-3">Critical gaps</h3>
            <ul className="list-disc pl-4 text-sm text-slate-800">
              {(l.criticalGaps || []).map((g) => (
                <li key={g.skillName}>
                  {g.skillName} - ~{g.estimatedWeeks}w, {g.reason}
                </li>
              ))}
            </ul>
            <h3 className="text-sm font-medium mt-2">Weekly focus</h3>
            <ul className="list-decimal pl-4 text-sm text-slate-800">
              {(l.weeklyRoadmap || []).map((w) => (
                <li key={w.week}>
                  Week {w.week}: {w.focus} - {w.milestones?.join('; ')}
                </li>
              ))}
            </ul>
            <h3 className="text-sm font-medium mt-2">Resources</h3>
            <ul className="text-sm text-slate-800 list-disc pl-4">
              {(l.resources || []).map((x, i) => (
                <li key={i}>
                  {x.title} - {x.url} ({x.type})
                </li>
              ))}
            </ul>
            <div className="mt-3">
              <LearningPlanTimeline roadmap={l.weeklyRoadmap || []} resources={l.resources || []} />
            </div>
          </section>
        )}

        {structured && (
          <section className="mt-6">
            <h2 className="text-lg font-semibold border-b pb-1">Structured AI output</h2>
            <div className="mt-2 grid md:grid-cols-3 gap-2 text-xs">
              <div className="rounded-lg border border-slate-200 p-2">
                <p className="font-semibold mb-1">Required skills</p>
                <p>{(structured.required_skills || []).join(', ') || ' - '}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-2">
                <p className="font-semibold mb-1">Candidate skills</p>
                <p>{(structured.candidate_skills || []).join(', ') || ' - '}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-2">
                <p className="font-semibold mb-1">Missing skills</p>
                <p>{(structured.missing_skills || []).join(', ') || ' - '}</p>
              </div>
            </div>
            <div className="mt-2 grid md:grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-slate-200 p-2">
                <p className="font-semibold mb-1">Strong skills</p>
                <p>{(structured.strong_skills || []).join(', ') || ' - '}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-2">
                <p className="font-semibold mb-1">Weak skills</p>
                <p>{(structured.weak_skills || []).join(', ') || ' - '}</p>
              </div>
            </div>
          </section>
        )}

        <p className="text-xs text-slate-500 mt-8">Generated for hiring decision support. Review with human judgment and policy.</p>
      </div>

      <div className="no-print max-w-3xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-zinc-500 text-center mt-4 light:text-slate-500"
        >
          Use the browser's print dialog to save as PDF.
        </motion.p>
      </div>
    </div>
  );
}
