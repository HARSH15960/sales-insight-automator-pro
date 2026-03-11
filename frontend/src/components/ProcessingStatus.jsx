import { motion } from 'framer-motion'

const STAGES = [
  { min: 0, max: 20, label: 'Parsing files', icon: '📂', desc: 'Reading CSV/XLSX data rows' },
  { min: 20, max: 45, label: 'Analyzing patterns', icon: '🔍', desc: 'Detecting regions, categories, trends' },
  { min: 45, max: 65, label: 'AI generating insights', icon: '🧠', desc: 'Groq LLM processing your data' },
  { min: 65, max: 80, label: 'Creating charts', icon: '📊', desc: 'Generating visual analytics' },
  { min: 80, max: 95, label: 'Sending email report', icon: '📧', desc: 'Delivering executive HTML report' },
  { min: 95, max: 100, label: 'Finalizing', icon: '✅', desc: 'Wrapping up and cleaning storage' }
]

const getStage = (progress) => {
  return STAGES.find(s => progress >= s.min && progress < s.max) || STAGES[STAGES.length - 1]
}

export default function ProcessingStatus({ progress, status }) {
  const stage = getStage(progress)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Main progress card */}
      <div className="glass rounded-2xl p-8 glow-border text-center">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/30"
        >
          {stage.icon}
        </motion.div>

        <h3 className="font-display text-xl font-bold text-bright mb-1">{stage.label}</h3>
        <p className="text-subtle text-sm mb-8">{stage.desc}</p>

        {/* Progress bar */}
        <div className="relative">
          <div className="flex justify-between text-xs text-muted mb-2">
            <span>Processing</span>
            <span className="font-mono text-indigo-400">{progress}%</span>
          </div>
          <div className="h-3 bg-surface rounded-full overflow-hidden border border-border">
            <motion.div
              className="h-full rounded-full progress-glow"
              style={{
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s linear infinite, progress-glow 1.5s ease-in-out infinite'
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Status badge */}
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-amber-500/30">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-amber-400 text-xs font-medium capitalize">{status}</span>
        </div>
      </div>

      {/* Stage pipeline */}
      <div className="glass rounded-2xl p-6">
        <p className="text-subtle text-xs font-medium uppercase tracking-widest mb-4">Processing Pipeline</p>
        <div className="space-y-3">
          {STAGES.map((s, idx) => {
            const isDone = progress >= s.max
            const isActive = progress >= s.min && progress < s.max
            const isPending = progress < s.min

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                  isActive ? 'bg-indigo-500/10 border border-indigo-500/30' :
                  isDone ? 'opacity-50' : 'opacity-30'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${
                  isDone ? 'bg-emerald-500/20 text-emerald-400' :
                  isActive ? 'bg-indigo-500/20 text-indigo-400' :
                  'bg-surface text-muted'
                }`}>
                  {isDone ? '✓' : isActive ? (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      ⟳
                    </motion.span>
                  ) : '○'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isActive ? 'text-bright' : isDone ? 'text-text' : 'text-muted'}`}>
                    {s.label}
                  </p>
                  {isActive && (
                    <p className="text-indigo-400/70 text-xs">{s.desc}</p>
                  )}
                </div>
                <div className="text-xs font-mono text-muted">{s.min}%</div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
