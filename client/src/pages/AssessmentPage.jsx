import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Send, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useSession } from '../context/SessionContext';
import { MessageList } from '../components/Chat/MessageList';
import { TypingIndicator } from '../components/Chat/TypingIndicator';
import { Stepper } from '../components/Stepper';
import { clsx } from '../components/ui/cn';
import { DEMO_CANDIDATE_REPLIES } from '../data/demoData';
import { PipelineFlow } from '../components/PipelineFlow';
import { SkillChip } from '../components/ui/SkillChip';

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export default function AssessmentPage() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const judge = sp.get('judge') === '1';
  const { sessionId, isDemo, setPhase, clear } = useSession();
  const [items, setItems] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [err, setErr] = useState(null);
  const [finalizing, setFinalizing] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState('Generating questions...');
  const [activePipelineStep, setActivePipelineStep] = useState(3);
  const [questionFeedback, setQuestionFeedback] = useState(null);
  const [sessionSnapshot, setSessionSnapshot] = useState(null);
  const [banner, setBanner] = useState(
    () => (judge && isDemo ? 'Judge mode: simulating candidate replies for the full pipeline.' : null)
  );
  const endRef = useRef(null);

  const appendAssistant = useCallback((result) => {
    if (!result?.assistantMessage) return;
    setItems((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: result.assistantMessage,
        meta: {
          currentDifficulty: result.currentDifficulty,
          interviewPhase: result.interviewPhase,
        },
      },
    ]);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [items, typing, loading]);

  const finalize = useCallback(async () => {
    if (!sessionId) return;
    setFinalizing(true);
    setActivePipelineStep(4);
    setLoadingLabel('Scoring answers...');
    setPhase('scoring');
    try {
      await api.finalize(sessionId);
      setActivePipelineStep(6);
      setLoadingLabel('Assessment complete');
      setPhase('ready');
      navigate('/dashboard');
    } catch (e) {
      setErr(e.message);
    } finally {
      setFinalizing(false);
    }
  }, [sessionId, navigate, setPhase]);

  const runUserMessage = useCallback(
    async (text) => {
      if (!sessionId || !String(text).trim()) return null;
      const t = String(text).trim();
      setErr(null);
      setItems((prev) => [...prev, { role: 'user', content: t }]);
      setInput('');
      setLoading(true);
      setTyping(true);
      setLoadingLabel('Analyzing response...');
      await wait(500 + Math.random() * 400);
      setLoadingLabel('Generating next question...');
      const { result } = await api.interview(sessionId, t);
      setTyping(false);
      setLoading(false);
      appendAssistant(result);
      const assessed = result?.lastAnswerAssessed || 'partial';
      const qualityScore = assessed === 'strong' ? 8.8 : assessed === 'weak' ? 4.9 : 6.6;
      setQuestionFeedback({
        score: qualityScore,
        quality: assessed,
        strengths:
          assessed === 'strong'
            ? 'Specific metrics and technical depth were clear.'
            : 'Provided baseline context and domain relevance.',
        missing:
          assessed === 'weak'
            ? 'Answer lacked technical detail and measurable impact.'
            : 'Could add more architecture trade-offs and edge-case handling.',
      });
      return result;
    },
    [appendAssistant, sessionId]
  );

  useEffect(() => {
    if (!sessionId) {
      navigate('/', { replace: true });
      return;
    }
    let go = true;

    const mapFromServer = (s) => {
      const m = s?.interviewMessages || [];
      if (!m.length) return null;
      return m.map((x) => ({
        role: x.role,
        content: x.content,
        meta:
          x.meta && x.role === 'assistant'
            ? {
                currentDifficulty: x.meta.currentDifficulty,
                interviewPhase: x.meta.interviewPhase,
              }
            : undefined,
      }));
    };

    const run = async () => {
      if (!go) return;
      try {
        setErr(null);
        setActivePipelineStep(3);
        const s = await api.getSession(sessionId);
        if (!go) return;
        setSessionSnapshot(s);
        const existing = mapFromServer(s);
        if (existing?.length) {
          setItems(existing);
          return;
        }
        setTyping(true);
        setLoadingLabel('Generating questions...');
        await wait(600 + Math.random() * 400);
        if (!go) return;
        setTyping(false);
        const { result: first } = await api.interview(sessionId, '');
        if (!go) return;
        appendAssistant(first);

        if (judge && isDemo) {
          let last = first;
          for (let k = 0; k < DEMO_CANDIDATE_REPLIES.length; k += 1) {
            if (!go) return;
            if (last?.isComplete) {
              setBanner('Compiling your hiring report and learning plan...');
              await finalize();
              return;
            }
            const reply = DEMO_CANDIDATE_REPLIES[k];
            setItems((prev) => [...prev, { role: 'user', content: reply }]);
            setLoading(true);
            setTyping(true);
            setLoadingLabel('Analyzing response...');
            await wait(500 + Math.random() * 350);
            if (!go) return;
            const { result: next } = await api.interview(sessionId, reply);
            setTyping(false);
            setLoading(false);
            if (!go) return;
            appendAssistant(next);
            last = next;
            if (next?.isComplete) {
              setBanner('Compiling your hiring report and learning plan...');
              await wait(450);
              if (go) await finalize();
              return;
            }
          }
          if (go && last && !last.isComplete) {
            setBanner('Compiling your hiring report and learning plan...');
            await finalize();
          }
        } else if (first?.isComplete) {
          setBanner('Compiling your hiring report and learning plan...');
          await wait(300);
          if (go) await finalize();
        }
      } catch (e) {
        if (go) {
          setTyping(false);
          setLoading(false);
          if (String(e?.message || '').includes('Session not found')) {
            clear();
            navigate('/', { replace: true });
            return;
          }
          setErr(e?.message || 'Could not start the interview');
        }
      }
    };

    void run();
    return () => {
      go = false;
    };
  }, [appendAssistant, clear, finalize, isDemo, judge, navigate, sessionId]);

  if (!sessionId) return null;

  const onSubmit = (e) => {
    e.preventDefault();
    if (loading || typing || finalizing || (judge && isDemo)) return;
    (async () => {
      const res = await runUserMessage(input);
      if (res?.isComplete) {
        setBanner('Compiling your hiring report and learning plan...');
        setActivePipelineStep(4);
        setLoadingLabel('Finalizing assessment...');
        await wait(300);
        await finalize();
      }
    })();
  };

  return (
    <div className="max-w-3xl h-[min(80vh,720px)] flex flex-col">
      {sessionSnapshot ? (
        <div className="mb-3 grid md:grid-cols-2 gap-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 light:border-slate-200 light:bg-slate-50">
            <p className="text-[11px] uppercase tracking-wide text-zinc-500">Resume input</p>
            <p className="text-xs text-zinc-400 mt-1 line-clamp-3">{sessionSnapshot.hasResume ? 'Resume loaded and analyzed.' : 'No resume found.'}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 light:border-slate-200 light:bg-slate-50">
            <p className="text-[11px] uppercase tracking-wide text-zinc-500">Job description input</p>
            <p className="text-xs text-zinc-400 mt-1 line-clamp-3">{sessionSnapshot.hasJd ? 'Job description loaded and parsed.' : 'No job description found.'}</p>
          </div>
        </div>
      ) : null}
      {banner && (
        <div className="mb-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-xs text-emerald-200/90 light:text-emerald-900 light:bg-emerald-50 light:border-emerald-100">
          {banner}
        </div>
      )}
      {finalizing && <Stepper label="Evaluating, planning, reporting" />}

      <div
        className={clsx(
          'flex-1 rounded-2xl border border-white/10 p-4 overflow-y-auto',
          'bg-zinc-950/30 backdrop-blur-xl light:bg-white/90 light:border-slate-200'
        )}
      >
        <PipelineFlow activeStep={activePipelineStep} label={loading || typing || finalizing ? loadingLabel : 'Interview in progress'} compact />
        {sessionSnapshot?.skillExtraction ? (
          <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 light:border-slate-200 light:bg-slate-50">
            <p className="text-[11px] uppercase tracking-wide text-zinc-500 mb-1">Detected missing skills</p>
            <div className="flex flex-wrap gap-1.5">
              {(sessionSnapshot.skillExtraction?.missingSkills || []).slice(0, 6).map((skill) => (
                <SkillChip key={skill} skill={skill} tone="missing" />
              ))}
              {!sessionSnapshot.skillExtraction?.missingSkills?.length ? (
                <span className="text-xs text-zinc-500">No major gaps detected yet.</span>
              ) : null}
            </div>
          </div>
        ) : null}
        <p className="text-xs text-zinc-500 mb-2 light:text-slate-500">
          The interviewer has memory, adapts difficulty, and will close the loop when complete.
        </p>
        {err && (
          <div className="mb-3 flex items-center justify-between gap-3 text-sm text-red-300 light:text-red-700">
            <span className="inline-flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> {err}
            </span>
            <button
              type="button"
              className="rounded-lg border border-red-400/40 px-2 py-1 text-xs hover:bg-red-500/10"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        )}
        {items.length === 0 && !loading && !typing && !err && (
          <p className="text-sm text-zinc-500 light:text-slate-500">Composing the first question...</p>
        )}
        <MessageList items={items} />
        {questionFeedback ? (
          <div className="mt-3 ml-10 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-xs light:bg-cyan-50 light:border-cyan-200">
            <p className="text-cyan-300 light:text-cyan-700 font-semibold">
              Real-time feedback - {questionFeedback.score.toFixed(1)}/10
            </p>
            <p className="text-zinc-300 light:text-slate-700 mt-1">
              <strong>What was strong:</strong> {questionFeedback.strengths}
            </p>
            <p className="text-zinc-300 light:text-slate-700 mt-1">
              <strong>What was missing:</strong> {questionFeedback.missing}
            </p>
          </div>
        ) : null}
        {(typing || loading) && (
          <div className="pl-10">
            <p className="text-xs text-zinc-500 mb-1">{loadingLabel}</p>
            <TypingIndicator />
          </div>
        )}
        <div ref={endRef} />
      </div>
      <form
        onSubmit={onSubmit}
        className={clsx('mt-3 flex gap-2 p-1 rounded-2xl glass', finalizing && 'opacity-50 pointer-events-none')}
      >
        <input
          className={clsx(
            'flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm',
            'text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/30',
            'light:bg-slate-50 light:border-slate-200 light:text-slate-900',
            judge && isDemo && 'cursor-not-allowed opacity-60'
          )}
          placeholder={judge && isDemo ? 'Autoplay in judge demo' : 'Type your answer...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading || typing || finalizing || (judge && isDemo)}
        />
        <button
          type="submit"
          disabled={loading || typing || finalizing || (judge && isDemo) || !input.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
          Send
        </button>
      </form>
    </div>
  );
}
