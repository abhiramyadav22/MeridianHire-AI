import { motion } from 'framer-motion';

export function Stepper({ label }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mb-4 flex items-center gap-2 rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-3 py-2 text-sm text-indigo-200/90 light:text-indigo-800 light:bg-indigo-50 light:border-indigo-100"
    >
      <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
      {label}…
    </motion.div>
  );
}
