import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  BarChart3,
  FileText,
  Menu,
  MessageSquare,
  Moon,
  Route as RouteIcon,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useSession } from '../../context/SessionContext';
import { clsx } from '../ui/cn';

const nav = [
  { to: '/', label: 'Resume Checker', end: true },
  { to: '/assessment', label: 'Interview' },
  { to: '/dashboard', label: 'Match Report' },
  { to: '/report', label: 'Export Report' },
  { to: '/learning-plan', label: 'Learning Plan' },
];

const phaseCopy = {
  idle: 'Ready to scan',
  creating: 'Creating session',
  extracting: 'Extracting skills',
  interview: 'Interview active',
  scoring: 'Scoring',
  ready: 'Report ready',
};

function AppLogo() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-[#18c79a] text-white shadow-sm">
        <Sparkles className="h-5 w-5" />
      </span>
      <span>
        <span className="block font-display text-xl font-semibold leading-none text-slate-950 dark:text-white">
          Meridian Hire
        </span>
        <span className="text-xs font-medium text-slate-500">AI skill assessment</span>
      </span>
    </Link>
  );
}

function NavItems({ onNavigate }) {
  return (
    <>
      {nav.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            clsx(
              'rounded-lg px-3 py-2 text-sm font-semibold transition',
              isActive
                ? 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800'
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </>
  );
}

export function Shell() {
  const { pathname } = useLocation();
  const { theme, toggle } = useTheme();
  const { phase, sessionId } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen gradient-surface text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/92 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
          <AppLogo />

          <nav className="hidden items-center gap-1 lg:flex">
            <NavItems />
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <Activity className="h-4 w-4 text-emerald-500" />
              {phaseCopy[phase] || 'Ready'}
            </div>
            <button
              type="button"
              onClick={toggle}
              className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link to="/dashboard" className="btn-secondary hidden xl:inline-flex">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </Link>
            <Link to="/" className="btn-primary bg-[#18c79a] hover:bg-[#14b78e]">
              Get Started
            </Link>
          </div>

          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setMenuOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-800 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Close navigation"
              className="absolute inset-0 bg-slate-950/45"
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="absolute right-0 top-0 h-full w-80 border-l border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="flex items-center justify-between">
                <AppLogo />
                <button
                  type="button"
                  aria-label="Close navigation"
                  onClick={() => setMenuOpen(false)}
                  className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="mt-6 grid gap-2">
                <NavItems onNavigate={() => setMenuOpen(false)} />
              </nav>
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                  {sessionId ? <FileText className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                  {phaseCopy[phase] || 'Ready'}
                </div>
                <p className="mt-1 text-xs">
                  {sessionId ? 'Your current assessment is saved in this browser.' : 'Start with a resume and job description.'}
                </p>
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <main className={clsx(pathname === '/' ? '' : 'mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8')}>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
