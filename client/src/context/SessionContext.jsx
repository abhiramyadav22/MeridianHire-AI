import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'meridian-hire-session';
const SessionContext = createContext({
  sessionId: null,
  isDemo: false,
  phase: 'idle',
  setPhase: () => {},
  setSession: () => {},
  clear: () => {},
});

export function SessionProvider({ children }) {
  const [sessionId, setSessionId] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored).sessionId : null;
    } catch {
      return null;
    }
  });
  const [isDemo, setIsDemo] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored).isDemo : false;
    } catch {
      return false;
    }
  });
  const [phase, setPhase] = useState(() => {
    if (typeof window === 'undefined') return 'idle';
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored).phase : 'idle';
    } catch {
      return 'idle';
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessionId, isDemo, phase }));
  }, [sessionId, isDemo, phase]);

  const setSession = useCallback((id, demo) => {
    setSessionId(id);
    if (typeof demo === 'boolean') setIsDemo(demo);
  }, []);

  const clear = useCallback(() => {
    setSessionId(null);
    setIsDemo(false);
    setPhase('idle');
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <SessionContext.Provider value={{ sessionId, isDemo, phase, setPhase, setSession, clear }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
