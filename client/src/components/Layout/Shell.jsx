import { Link, useLocation, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Moon,
  Sun,
  Home,
  Route,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useSession } from '../../context/SessionContext';
import { clsx } from '../ui/cn';

const nav = [
  { to: '/', label: 'Home', end: true },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/assessment', label: 'Assessment' },
  { to: '/report', label: 'Report' },
  { to: '/learning-plan', label: 'Learning Plan' },
];

const icons = {
  '/dashboard': LayoutDashboard,
  '/assessment': MessageSquare,
  '/report': FileText,
  '/learning-plan': Route,
  '/': Home,
};

function NavIcon({ path }) {
  const Icon = icons[path] || MessageSquare;
  return <Icon className="h-4 w-4" strokeWidth={1.75} />;
}

export function Shell() {
  const { pathname } = useLocation();
  const { theme, toggle } = useTheme();
  const { isDemo, sessionId } = useSession();

  return (
    <div className="min-h-screen gradient-surface flex">
      <aside
        className={clsx(
          'no-print w-64 shrink-0 p-4 flex flex-col border-r',
          'border-white/5 bg-zinc-950/40 backdrop-blur-xl',
          'light:border-slate-200/80 light:bg-white/60'
        )}
      >
        <div className="px-2 pt-1 pb-4">
          <div className="font-display text-lg font-semibold tracking-tight bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
            Meridian Hire
          </div>
          <p className="text-xs text-zinc-500 light:text-slate-500 mt-0.5">AI skills & hiring</p>
        </div>
        {isDemo && (
          <div className="mx-2 mb-3 px-2 py-1.5 rounded-lg text-[11px] font-medium border border-amber-500/30 text-amber-200/90 bg-amber-500/10 light:text-amber-900 light:bg-amber-50 light:border-amber-200">
            Demo mode{sessionId ? ' · data only in this browser session' : ''}
          </div>
        )}
        <nav className="flex-1 space-y-1">
          {nav.map((n) => {
            const active = n.end ? pathname === n.to : pathname === n.to || (n.to !== '/' && pathname.startsWith(n.to));
            return (
              <Link
                key={n.to + n.label}
                to={n.to}
                className={clsx(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-white/10 text-white light:bg-indigo-50 light:text-indigo-900'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 light:text-slate-600 light:hover:bg-slate-100 light:hover:text-slate-900'
                )}
              >
                <NavIcon path={n.to} />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={toggle}
          className={clsx(
            'mt-4 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm border border-white/10',
            'text-zinc-300 hover:bg-white/5',
            'light:border-slate-200 light:text-slate-700 light:hover:bg-slate-50'
          )}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </aside>
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden max-w-7xl w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
