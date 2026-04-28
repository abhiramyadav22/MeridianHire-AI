import { motion } from 'framer-motion';

export function Stepper({ label }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mb-4 flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-3 py-2 text-sm text-cyan-200/90 light:border-cyan-100 light:bg-cyan-50 light:text-cyan-800"
    >
      <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
      {label}...
    </motion.div>
  );
}
