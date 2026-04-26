const base = '/api';

async function j(path, opt = {}, retries = 1) {
  try {
    const r = await fetch(`${base}${path}`, {
      headers: { 'Content-Type': 'application/json', ...opt.headers },
      ...opt,
      body: opt.body ? JSON.stringify(opt.body) : undefined,
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      throw new Error(data.error || r.statusText || 'Request failed');
    }
    return data;
  } catch (e) {
    if (retries > 0) {
      await new Promise((res) => setTimeout(res, 600));
      return j(path, opt, retries - 1);
    }
    throw e;
  }
}

export const api = {
  health: () => j('/health'),
  createSession: (resumeText, jobDescription) =>
    j('/session', { method: 'POST', body: { resumeText, jobDescription } }),
  initialize: (sessionId) => j(`/session/${sessionId}/initialize`, { method: 'POST', body: {} }),
  interview: (sessionId, message) =>
    j(`/session/${sessionId}/interview`, { method: 'POST', body: { message } }),
  finalize: (sessionId) => j(`/session/${sessionId}/finalize`, { method: 'POST', body: {} }),
  getSession: (sessionId) => j(`/session/${sessionId}`),
};
