const remoteBase = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || null;
const STORE_KEY = 'meridian-hire-local-sessions';
const MAX_INTERVIEW_ANSWERS = 6;

const ASSESSMENT_MODE_LABELS = {
  balanced: 'Balanced hiring screen',
  senior_system: 'Senior system design',
  frontend_product: 'Frontend product engineer',
  speed_screen: 'Fast recruiter screen',
};

const PIPELINE_STEPS = [
  'Resume & JD Ingestion',
  'Skill Extraction',
  'Gap Analysis',
  'Adaptive Interview',
  'Scoring & Verdict',
  'Learning Plan Generation',
  'Final Report',
];

const SKILL_LIBRARY = [
  { name: 'TypeScript', terms: ['typescript', 'ts'] },
  { name: 'Node.js', terms: ['node.js', 'node', 'express'] },
  { name: 'React', terms: ['react', 'frontend', 'ui'] },
  { name: 'API Design', terms: ['api', 'rest', 'graphql', 'contract', 'version'] },
  { name: 'PostgreSQL', terms: ['postgresql', 'postgres', 'sql', 'database'] },
  { name: 'Redis', terms: ['redis', 'cache', 'caching'] },
  { name: 'Kafka', terms: ['kafka', 'event', 'queue', 'async', 'message'] },
  { name: 'System Design', terms: ['system design', 'distributed', 'scale', 'architecture'] },
  { name: 'Reliability', terms: ['reliability', 'slo', 'observability', 'incident', 'on-call'] },
  { name: 'Testing', terms: ['testing', 'jest', 'k6', 'load-test', 'test'] },
  { name: 'Mentorship', terms: ['mentor', 'lead', 'review', 'workshop'] },
  { name: 'Product Collaboration', terms: ['product', 'design', 'customer', 'stakeholder'] },
];

const QUESTION_BANK = [
  {
    skill: 'System Design',
    difficulty: 'medium',
    phase: 'architecture',
    question:
      'Walk me through a system you designed or improved. What were the bottlenecks, trade-offs, and measurable results?',
  },
  {
    skill: 'API Design',
    difficulty: 'medium',
    phase: 'implementation',
    question:
      'How would you design a reliable API for a high-impact workflow, including idempotency, errors, and observability?',
  },
  {
    skill: 'Kafka',
    difficulty: 'hard',
    phase: 'depth',
    question:
      'Describe how you would handle message retries, duplicate events, consumer lag, and data consistency in an event-driven service.',
  },
  {
    skill: 'Reliability',
    difficulty: 'hard',
    phase: 'depth',
    question:
      'A production service is breaching its latency SLO. What signals do you inspect first, and how do you decide between mitigation and root-cause work?',
  },
  {
    skill: 'Mentorship',
    difficulty: 'medium',
    phase: 'collaboration',
    question:
      'Tell me about a time you raised the engineering bar for a team. What changed after your intervention?',
  },
  {
    skill: 'Growth Areas',
    difficulty: 'medium',
    phase: 'closing',
    question:
      'Which skill gaps would you prioritize for this role, and what concrete plan would you use to close them?',
  },
];

const MODE_QUESTION_BANKS = {
  balanced: QUESTION_BANK,
  senior_system: [
    {
      skill: 'System Design',
      difficulty: 'hard',
      phase: 'architecture',
      question:
        'Design a payment or ledger platform for high write volume. How do you model consistency, idempotency, and failure recovery?',
    },
    {
      skill: 'Kafka',
      difficulty: 'hard',
      phase: 'distributed-systems',
      question:
        'A Kafka consumer is falling behind while duplicate events are appearing downstream. Walk through your diagnosis and fix.',
    },
    {
      skill: 'Reliability',
      difficulty: 'hard',
      phase: 'operations',
      question:
        'Your p99 latency regresses after a release. Which traces, metrics, and rollback criteria do you use in the first 30 minutes?',
    },
    {
      skill: 'API Design',
      difficulty: 'hard',
      phase: 'contracts',
      question:
        'How would you evolve a public API without breaking clients while improving validation, observability, and error semantics?',
    },
    {
      skill: 'Mentorship',
      difficulty: 'medium',
      phase: 'leadership',
      question:
        'How do you turn repeated production issues into engineering standards that the team actually follows?',
    },
    {
      skill: 'Growth Areas',
      difficulty: 'medium',
      phase: 'closing',
      question:
        'Which architecture topic would you deepen next for this role, and how would you prove progress in four weeks?',
    },
  ],
  frontend_product: [
    {
      skill: 'React',
      difficulty: 'medium',
      phase: 'product-ui',
      question:
        'Describe a complex React interface you shipped. How did you manage state, performance, accessibility, and user feedback?',
    },
    {
      skill: 'Product Collaboration',
      difficulty: 'medium',
      phase: 'collaboration',
      question:
        'Tell me about a time you shaped product requirements with design or PM partners before implementation.',
    },
    {
      skill: 'Testing',
      difficulty: 'medium',
      phase: 'quality',
      question:
        'How do you test a user-facing workflow across unit, integration, and browser-level coverage?',
    },
    {
      skill: 'API Design',
      difficulty: 'medium',
      phase: 'full-stack',
      question:
        'How do you coordinate frontend data needs with backend API contracts without overfetching or creating fragile coupling?',
    },
    {
      skill: 'Reliability',
      difficulty: 'medium',
      phase: 'release',
      question:
        'What signals tell you a frontend release is healthy after launch, and what rollback plan do you prefer?',
    },
    {
      skill: 'Growth Areas',
      difficulty: 'medium',
      phase: 'closing',
      question:
        'What product engineering skill would you strengthen for this role, and what project would you use to demonstrate it?',
    },
  ],
  speed_screen: [
    {
      skill: 'Role Fit',
      difficulty: 'medium',
      phase: 'screen',
      question:
        'Give me the strongest evidence that your recent work matches this role, with one measurable outcome.',
    },
    {
      skill: 'Technical Depth',
      difficulty: 'medium',
      phase: 'screen',
      question:
        'Pick one required skill from the job description and explain a real project where you used it deeply.',
    },
    {
      skill: 'Risk Areas',
      difficulty: 'medium',
      phase: 'screen',
      question:
        'Which requirement is least represented in your background, and how would you close that gap quickly?',
    },
    {
      skill: 'Communication',
      difficulty: 'medium',
      phase: 'closing',
      question:
        'Summarize why you should advance to the next round in two minutes or less.',
    },
  ],
};

function readStore() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeStore(store) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
  }
}

function getStoredSession(sessionId) {
  const session = readStore()[sessionId];
  if (!session) throw new Error('Session not found. Start a new assessment.');
  return session;
}

function saveSession(session) {
  const store = readStore();
  store[session.id] = { ...session, updatedAt: new Date().toISOString() };
  writeStore(store);
  return store[session.id];
}

function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalize(text) {
  return String(text || '').toLowerCase();
}

function includesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function unique(list) {
  return [...new Set(list.filter(Boolean))];
}

function firstMatchingLine(text, terms) {
  const lines = String(text || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    lines.find((line) => includesAny(normalize(line), terms)) ||
    lines.find((line) => line.length > 24) ||
    'Relevant experience was provided in the submitted resume.'
  );
}

function extractRoleTitle(jobDescription) {
  const lines = String(jobDescription || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const jobLine = lines.find((line) => /^job\s*:/i.test(line));
  if (jobLine) return jobLine.replace(/^job\s*:\s*/i, '');
  return lines[0] || 'Open role';
}

function extractCandidateName(resumeText) {
  const firstLine = String(resumeText || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);
  if (!firstLine) return 'Candidate';
  return firstLine.length > 60 || firstLine.includes('@') ? 'Candidate' : firstLine;
}

function extractSkillNames(text, fallback = []) {
  const haystack = normalize(text);
  const found = SKILL_LIBRARY.filter((skill) => includesAny(haystack, skill.terms)).map((skill) => skill.name);
  return unique(found.length ? found : fallback);
}

function buildSkillExtraction(resumeText, jobDescription) {
  const requiredSkills = extractSkillNames(jobDescription, [
    'TypeScript',
    'Node.js',
    'API Design',
    'PostgreSQL',
    'System Design',
    'Testing',
  ]);
  const candidateSkills = extractSkillNames(resumeText, ['Communication', 'Problem Solving']);
  const missingSkills = requiredSkills.filter((skill) => !candidateSkills.includes(skill));
  const adjacentSkills = candidateSkills.filter((skill) => !requiredSkills.includes(skill)).slice(0, 4);

  return {
    roleTitle: extractRoleTitle(jobDescription),
    requiredSkills,
    candidateSkills,
    missingSkills,
    adjacentSkills,
    claimedSkills: candidateSkills.map((name) => {
      const meta = SKILL_LIBRARY.find((skill) => skill.name === name);
      return {
        name,
        context: firstMatchingLine(resumeText, meta?.terms || [name.toLowerCase()]),
      };
    }),
  };
}

function qualityForAnswer(answer) {
  const text = normalize(answer);
  if (!text.trim()) return 'partial';

  const signals = [
    /\d/.test(text),
    includesAny(text, ['trade-off', 'tradeoff', 'latency', 'slo', 'metric', 'p99', 'load', 'observability']),
    includesAny(text, ['because', 'therefore', 'first', 'then', 'after', 'root cause']),
    text.length > 220,
  ].filter(Boolean).length;

  if (signals >= 3) return 'strong';
  if (signals <= 1) return 'weak';
  return 'partial';
}

function nextQuestion(session, lastQuality = null) {
  const answerCount = session.answers?.length || 0;
  const mode = session.options?.assessmentMode || 'balanced';
  const questionBank = MODE_QUESTION_BANKS[mode] || QUESTION_BANK;
  const maxAnswers = mode === 'speed_screen' ? 4 : MAX_INTERVIEW_ANSWERS;
  const question = questionBank[Math.min(answerCount, questionBank.length - 1)];
  const isComplete = answerCount >= Math.min(maxAnswers, questionBank.length);

  if (isComplete) {
    return {
      assistantMessage:
        'Thanks. I have enough signal across role fit, depth, reliability, and growth areas. I will compile the hiring report now.',
      currentDifficulty: 'complete',
      interviewPhase: 'closing',
      lastAnswerAssessed: lastQuality,
      isComplete: true,
    };
  }

  return {
    assistantMessage: question.question,
    currentDifficulty: question.difficulty,
    interviewPhase: question.phase,
    targetSkill: question.skill,
    lastAnswerAssessed: lastQuality,
    isComplete: false,
  };
}

function scoreSkill(session, skillName, index) {
  const extraction = session.skillExtraction || buildSkillExtraction(session.resumeText, session.jobDescription);
  const answerText = normalize((session.answers || []).join(' '));
  const skill = SKILL_LIBRARY.find((entry) => entry.name === skillName);
  const terms = skill?.terms || [skillName.toLowerCase()];
  const inResume = extraction.candidateSkills?.includes(skillName) || includesAny(normalize(session.resumeText), terms);
  const inAnswers = includesAny(answerText, terms);
  const strongAnswers = (session.answerQualities || []).filter((quality) => quality === 'strong').length;
  const weakAnswers = (session.answerQualities || []).filter((quality) => quality === 'weak').length;

  let score = 5.2 + (inResume ? 1.4 : 0) + (inAnswers ? 1.2 : 0) + strongAnswers * 0.25 - weakAnswers * 0.2;
  score += index % 2 === 0 ? 0.3 : -0.1;
  score = Math.max(3.8, Math.min(9.2, Number(score.toFixed(1))));

  const confidence = Math.max(0.58, Math.min(0.92, Number((0.68 + (inAnswers ? 0.1 : 0) + (inResume ? 0.08 : 0)).toFixed(2))));
  const status = score >= 7.5 ? 'strong' : score >= 5.5 ? 'moderate' : 'weak';

  return {
    skillName,
    score,
    confidence,
    status,
    explanation:
      status === 'strong'
        ? `${skillName} is supported by resume evidence and interview detail with credible ownership signals.`
        : status === 'moderate'
          ? `${skillName} shows useful experience, but the evidence would benefit from deeper trade-offs and edge cases.`
          : `${skillName} appears under-evidenced for this role and should be probed again before a final decision.`,
    strengths:
      status === 'weak'
        ? ['Some baseline familiarity is present']
        : ['Relevant examples were provided', 'Signals align with role expectations'],
    weaknesses:
      status === 'strong'
        ? []
        : ['Needs more specific architecture detail', 'Could quantify impact more clearly'],
    resumeEvidence: [
      {
        snippet: firstMatchingLine(session.resumeText, terms),
        relevance: inResume ? 'Direct resume match' : 'Closest available resume signal',
      },
    ],
    answerSnippets: (session.answers || [])
      .filter((answer) => includesAny(normalize(answer), terms) || answer.length > 80)
      .slice(0, 1)
      .map((answer, answerIndex) => ({
        excerpt: answer.slice(0, 180),
        turnHint: `Interview answer ${answerIndex + 1}`,
      })),
  };
}

function buildEvaluation(session) {
  const extraction = session.skillExtraction || buildSkillExtraction(session.resumeText, session.jobDescription);
  const modeFocus = {
    senior_system: ['System Design', 'Kafka', 'Reliability', 'API Design'],
    frontend_product: ['React', 'Product Collaboration', 'Testing', 'API Design'],
    speed_screen: ['API Design', 'System Design', 'Communication'],
    balanced: [],
  }[session.options?.assessmentMode || 'balanced'];
  const focusSkills = unique([
    ...(modeFocus || []),
    ...(extraction.requiredSkills || []),
    ...(extraction.candidateSkills || []).slice(0, 3),
    'Communication',
  ]).slice(0, 8);

  const skillEvaluations = focusSkills.map((skillName, index) => scoreSkill(session, skillName, index));
  const weakSkills = skillEvaluations.filter((skill) => skill.score < 6.5).map((skill) => skill.skillName);
  const strongSkills = skillEvaluations.filter((skill) => skill.score >= 7.5).map((skill) => skill.skillName);

  return {
    skillEvaluations,
    overall: {
      consistency: weakSkills.length > 3 ? 'medium' : 'high',
      strengthsSummary: unique([
        ...strongSkills.map((skill) => `Strong signal in ${skill}`),
        'Clear communication across the interview flow',
      ]).slice(0, 5),
      riskFactors: unique([
        ...weakSkills.map((skill) => `${skill} needs additional validation`),
        ...(extraction.missingSkills || []).slice(0, 2).map((skill) => `${skill} was required but lightly evidenced`),
      ]).slice(0, 5),
    },
  };
}

function buildLearningPlan(session, evaluation) {
  const weak = [...(evaluation.skillEvaluations || [])].sort((a, b) => a.score - b.score).slice(0, 3);
  const criticalGaps = weak.map((skill, index) => ({
    skillName: skill.skillName,
    estimatedWeeks: index === 0 ? 2 : 1,
    reason: skill.explanation,
  }));

  const roadmap = [
    {
      week: 1,
      focus: `Deepen ${weak[0]?.skillName || 'core role'} fundamentals`,
      goal: `Deepen ${weak[0]?.skillName || 'core role'} fundamentals`,
      milestones: ['Review role expectations', 'Build one focused practice project', 'Write a short design note'],
      tasks: ['Review fundamentals', 'Practice with a realistic prompt', 'Summarize trade-offs'],
      timeEstimate: '5-7 hrs',
      resources: ['Official docs', 'System design notes'],
    },
    {
      week: 2,
      focus: `Apply ${weak[1]?.skillName || 'implementation'} in a realistic scenario`,
      goal: `Apply ${weak[1]?.skillName || 'implementation'} in a realistic scenario`,
      milestones: ['Implement a small feature', 'Add tests and metrics', 'Explain failure modes'],
      tasks: ['Code a focused exercise', 'Add tests', 'Capture metrics'],
      timeEstimate: '6-8 hrs',
      resources: ['Testing guide', 'Observability checklist'],
    },
    {
      week: 3,
      focus: `Strengthen ${weak[2]?.skillName || 'architecture'} evidence`,
      goal: `Strengthen ${weak[2]?.skillName || 'architecture'} evidence`,
      milestones: ['Prepare two STAR stories', 'Quantify business impact', 'Practice follow-up questions'],
      tasks: ['Draft examples', 'Add measurable outcomes', 'Mock interview'],
      timeEstimate: '4-6 hrs',
      resources: ['Interview story rubric'],
    },
    {
      week: 4,
      focus: 'Re-assessment readiness',
      goal: 'Re-assessment readiness',
      milestones: ['Run a timed mock interview', 'Review gaps', 'Prepare final evidence portfolio'],
      tasks: ['Timed practice', 'Review feedback', 'Package evidence'],
      timeEstimate: '4-5 hrs',
      resources: ['Mock interview checklist'],
    },
  ];

  return {
    criticalGaps,
    adjacentSkills: (session.skillExtraction?.adjacentSkills || []).map((skillName) => ({
      skillName,
      reason: 'Adjacent experience can transfer into role expectations.',
    })),
    optionalImprovements: (session.skillExtraction?.candidateSkills || []).slice(0, 3).map((skillName) => ({
      skillName,
      reason: 'Keep this strength fresh for interview follow-ups.',
    })),
    weeklyRoadmap: roadmap,
    resources: [
      { title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer', type: 'Guide' },
      { title: 'Testing JavaScript', url: 'https://testingjavascript.com/', type: 'Course' },
      { title: 'PostgreSQL Documentation', url: 'https://www.postgresql.org/docs/', type: 'Docs' },
    ],
    dailyPlanTemplate: {
      tasks: [
        { title: 'Read one concept and write notes', dayPart: 'Morning', minutes: 25 },
        { title: 'Practice one role-specific problem', dayPart: 'Afternoon', minutes: 35 },
        { title: 'Record a concise interview answer', dayPart: 'Evening', minutes: 20 },
      ],
    },
  };
}

function buildReport(session, evaluation, structuredOutput) {
  const score = structuredOutput.overall_score;
  const hiringVerdict = score >= 7.5 ? 'Strong Hire' : score >= 5.5 ? 'Moderate Hire' : 'Needs Improvement';
  const weak = structuredOutput.weak_skills || [];
  const strong = structuredOutput.strong_skills || [];
  const modeLabel = ASSESSMENT_MODE_LABELS[session.options?.assessmentMode || 'balanced'];

  return {
    hiringVerdict,
    executiveSummary:
      `${session.candidateName} is a ${hiringVerdict.toLowerCase()} for ${session.skillExtraction?.roleTitle || 'the role'}. ` +
      `The strongest evidence appears in ${strong.slice(0, 2).join(', ') || 'core engineering fundamentals'}, while ${weak.slice(0, 2).join(', ') || 'a few role areas'} should be validated further.`,
    recommendedNextStep:
      hiringVerdict === 'Strong Hire'
        ? 'Advance to final team interview with a deeper system design exercise.'
        : hiringVerdict === 'Moderate Hire'
          ? 'Run one targeted follow-up on the weakest role-critical skill.'
          : 'Use the learning plan before reassessment.',
    verdictReasoning: {
      skillCoverage: `${structuredOutput.match_percentage.toFixed(0)}% of required skills have usable evidence.`,
      depth: weak.length ? `Depth is uneven around ${weak.slice(0, 2).join(', ')}.` : 'Depth is consistent across tested areas.',
      confidence: `Confidence is ${(structuredOutput.confidence_score * 100).toFixed(0)}% based on resume and interview signals.`,
    },
    keyInsights: [
      {
        headline: 'Role match',
        detail: `${structuredOutput.required_skills.length} role skills were mapped against resume and interview evidence.`,
      },
      {
        headline: 'Strongest signals',
        detail: strong.length ? strong.join(', ') : 'Communication and general engineering judgment.',
      },
      {
        headline: 'Main risks',
        detail: weak.length ? weak.join(', ') : 'No severe gaps detected; validate depth in final round.',
      },
      {
        headline: 'Assessment mode',
        detail: modeLabel || 'Balanced hiring screen',
      },
    ],
  };
}

function finalizeSession(session) {
  const skillExtraction = session.skillExtraction || buildSkillExtraction(session.resumeText, session.jobDescription);
  const evaluation = buildEvaluation({ ...session, skillExtraction });
  const scores = evaluation.skillEvaluations.map((skill) => Number(skill.score) || 0);
  const confidences = evaluation.skillEvaluations.map((skill) => Number(skill.confidence) || 0);
  const overallScore = scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
  const confidenceScore = confidences.length
    ? confidences.reduce((sum, confidence) => sum + confidence, 0) / confidences.length
    : 0;
  const strongSkills = evaluation.skillEvaluations
    .filter((skill) => skill.score >= 7.5)
    .map((skill) => skill.skillName);
  const weakSkills = evaluation.skillEvaluations
    .filter((skill) => skill.score < 6.5)
    .map((skill) => skill.skillName);
  const matchPercentage =
    ((skillExtraction.requiredSkills.length - skillExtraction.missingSkills.length) /
      Math.max(1, skillExtraction.requiredSkills.length)) *
    100;

  const structuredOutput = {
    required_skills: skillExtraction.requiredSkills,
    candidate_skills: skillExtraction.candidateSkills,
    missing_skills: skillExtraction.missingSkills,
    strong_skills: strongSkills,
    weak_skills: weakSkills,
    overall_score: Number(overallScore.toFixed(1)),
    confidence_score: Number(confidenceScore.toFixed(2)),
    confidence: Number(confidenceScore.toFixed(2)),
    match_percentage: Number(matchPercentage.toFixed(0)),
    decision_trace: {
      selectedFocusSkill: weakSkills[0] || skillExtraction.requiredSkills[0] || 'System Design',
      whySelected: 'Selected because it has the highest hiring impact or the lightest evidence.',
      generatedQuestion: QUESTION_BANK[0].question,
      difficulty: ASSESSMENT_MODE_LABELS[session.options?.assessmentMode || 'balanced'] || 'Adaptive medium-to-hard',
      responseQuality: session.answerQualities?.at(-1) || 'partial',
      nextStep: 'Review dashboard evidence and follow the learning plan for weak skills.',
    },
  };

  const learningPlan = buildLearningPlan({ ...session, skillExtraction }, evaluation);
  const report = buildReport({ ...session, skillExtraction }, evaluation, structuredOutput);

  return {
    ...session,
    skillExtraction,
    evaluation,
    structuredOutput,
    report,
    learningPlan,
    pipeline: {
      steps: PIPELINE_STEPS,
      currentStep: 6,
    },
    status: 'ready',
  };
}

async function remoteJson(path, opt = {}, retries = 1) {
  try {
    const response = await fetch(`${remoteBase}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(opt.headers || {}),
      },
      ...opt,
      body: opt.body ? JSON.stringify(opt.body) : undefined,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || response.statusText || 'Request failed');
    }
    return data;
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return remoteJson(path, opt, retries - 1);
    }
    throw error;
  }
}

function localApi() {
  return {
    async health() {
      return { ok: true, mode: 'local' };
    },

    async createSession(resumeText, jobDescription, options = {}) {
      const session = saveSession({
        id: makeId(),
        resumeText,
        jobDescription,
        options: {
          assessmentMode: options.assessmentMode || 'balanced',
          guardrails: {
            evidenceOnly: options.guardrails?.evidenceOnly ?? true,
            biasCheck: options.guardrails?.biasCheck ?? true,
            learningPlan: options.guardrails?.learningPlan ?? true,
          },
        },
        candidateName: extractCandidateName(resumeText),
        hasResume: Boolean(String(resumeText || '').trim()),
        hasJd: Boolean(String(jobDescription || '').trim()),
        interviewMessages: [],
        answers: [],
        answerQualities: [],
        status: 'created',
        pipeline: {
          steps: PIPELINE_STEPS,
          currentStep: 0,
        },
        createdAt: new Date().toISOString(),
      });
      return { sessionId: session.id };
    },

    async listSessions() {
      const sessions = Object.values(readStore());
      return sessions
        .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
        .map((session) => ({
          id: session.id,
          candidateName: session.candidateName || extractCandidateName(session.resumeText),
          roleTitle: session.skillExtraction?.roleTitle || extractRoleTitle(session.jobDescription),
          status: session.status || 'created',
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          hiringVerdict: session.report?.hiringVerdict,
          score: session.structuredOutput?.overall_score,
          mode: session.options?.assessmentMode || 'balanced',
          hasEvaluation: Boolean(session.evaluation),
        }));
    },

    async initialize(sessionId) {
      const session = getStoredSession(sessionId);
      const initialized = saveSession({
        ...session,
        skillExtraction: buildSkillExtraction(session.resumeText, session.jobDescription),
        pipeline: {
          steps: PIPELINE_STEPS,
          currentStep: 2,
        },
        status: 'interview',
      });
      return { session: initialized };
    },

    async interview(sessionId, message) {
      const session = getStoredSession(sessionId);
      const text = String(message || '').trim();
      let nextSession = {
        ...session,
        skillExtraction: session.skillExtraction || buildSkillExtraction(session.resumeText, session.jobDescription),
        answers: [...(session.answers || [])],
        answerQualities: [...(session.answerQualities || [])],
        interviewMessages: [...(session.interviewMessages || [])],
      };

      let lastQuality = null;
      if (text) {
        lastQuality = qualityForAnswer(text);
        nextSession.answers.push(text);
        nextSession.answerQualities.push(lastQuality);
        nextSession.interviewMessages.push({ role: 'user', content: text });
      }

      const result = nextQuestion(nextSession, lastQuality);
      nextSession.interviewMessages.push({
        role: 'assistant',
        content: result.assistantMessage,
        meta: {
          currentDifficulty: result.currentDifficulty,
          interviewPhase: result.interviewPhase,
        },
      });
      nextSession.pipeline = {
        steps: PIPELINE_STEPS,
        currentStep: result.isComplete ? 4 : 3,
      };

      saveSession(nextSession);
      return { result };
    },

    async finalize(sessionId) {
      const session = getStoredSession(sessionId);
      const finalized = saveSession(finalizeSession(session));
      return { session: finalized };
    },

    async getSession(sessionId) {
      return getStoredSession(sessionId);
    },
  };
}

const local = localApi();

export const api = remoteBase
  ? {
      health: () => remoteJson('/health'),
      createSession: (resumeText, jobDescription, options = {}) =>
        remoteJson('/session', {
          method: 'POST',
          body: { resumeText, jobDescription, options },
        }),
      listSessions: async () => [],
      initialize: (sessionId) =>
        remoteJson(`/session/${sessionId}/initialize`, {
          method: 'POST',
          body: {},
        }),
      interview: (sessionId, message) =>
        remoteJson(`/session/${sessionId}/interview`, {
          method: 'POST',
          body: { message },
        }),
      finalize: (sessionId) =>
        remoteJson(`/session/${sessionId}/finalize`, {
          method: 'POST',
          body: {},
        }),
      getSession: (sessionId) => remoteJson(`/session/${sessionId}`),
    }
  : local;
