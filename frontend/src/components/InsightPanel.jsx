import { motion } from 'framer-motion'

const scoreColors = {
  GOOD: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', bar: 'from-emerald-500 to-emerald-400' },
  FAIR: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', bar: 'from-amber-500 to-amber-400' },
  'AT RISK': { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', bar: 'from-rose-500 to-rose-400' },
  CRITICAL: { bg: 'bg-red-900/20', border: 'border-red-500/30', text: 'text-red-400', bar: 'from-red-700 to-red-500' },
}

const trendIcons = {
  UPWARD: { icon: '📈', color: 'text-emerald-400' },
  DOWNWARD: { icon: '📉', color: 'text-rose-400' },
  STABLE: { icon: '➡️', color: 'text-amber-400' },
  VOLATILE: { icon: '⚡', color: 'text-violet-400' },
}

export default function InsightPanel({ result, onReset, onChat }) {
  if (!result) return null

  const insights = result.insights || {}
  const summary = result.summary || {}

  const healthLabel = insights?.overallHealthScore?.label || 'FAIR'
  const healthScore = result?.summary?.healthScore || insights?.overallHealthScore?.score || 0
  const colors = scoreColors[healthLabel] || scoreColors.FAIR
  const trendDirection = insights?.revenueTrend?.direction || 'STABLE'
  const trend = trendIcons[trendDirection] || trendIcons.STABLE

  // Safe fallback values
  const topRegion = insights?.topPerformingRegion || {
    region: 'N/A',
    revenue: 'N/A',
    analysis: 'Data not available'
  }

  const worstCategory = insights?.worstPerformingCategory || {
    category: 'N/A',
    revenue: 'N/A',
    analysis: 'Data not available'
  }

  const cancellation = insights?.cancellationAnalysis || {
    rate: 'N/A',
    risk: 'LOW',
    analysis: 'Data not available'
  }

  const revenueTrend = insights?.revenueTrend || {
    direction: 'STABLE',
    analysis: 'Trend data not available'
  }

  const riskAlerts = insights?.riskAlerts || []
  const recommendations = insights?.recommendations || []
  const predictedTrend = insights?.predictedNextTrend || 'Prediction not available'
  const executiveSummary = insights?.executiveSummary || 'Summary not available'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      {/* Health Score Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass rounded-2xl p-6 border ${colors.border} ${colors.bg}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-bold uppercase tracking-widest ${colors.text}`}>Business Health</span>
              <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${colors.bg} ${colors.text} border ${colors.border}`}>
                {healthLabel}
              </span>
            </div>
            <div className={`font-display text-5xl font-black ${colors.text}`}>
              {healthScore}<span className="text-2xl opacity-50">/100</span>
            </div>
            <p className="text-subtle text-sm mt-2">{insights?.overallHealthScore?.rationale || ''}</p>
          </div>
          <div className="hidden md:block w-32">
            <svg viewBox="0 0 100 50" className="w-full">
              <path d="M5 45 A45 45 0 0 1 95 45" fill="none" stroke="#252550" strokeWidth="8" strokeLinecap="round" />
              <path
                d="M5 45 A45 45 0 0 1 95 45"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                stroke="url(#scoreGrad)"
                strokeDasharray={`${healthScore * 1.41} 141`}
              />
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Files Processed', value: summary.filesProcessed ?? 1, icon: '📁', color: 'text-indigo-400' },
          { label: 'Rows Analyzed', value: (summary.rowsAnalyzed ?? 0).toLocaleString(), icon: '📊', color: 'text-violet-400' },
          { label: 'Health Score', value: `${summary.healthScore ?? healthScore}/100`, icon: '💯', color: 'text-emerald-400' },
          { label: 'Charts Generated', value: summary.chartsGenerated ?? 3, icon: '📈', color: 'text-amber-400' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="stat-card"
          >
            <div className="text-xl mb-2">{stat.icon}</div>
            <div className={`font-display font-bold text-lg ${stat.color}`}>{stat.value}</div>
            <div className="text-muted text-xs">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Executive Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-3">Executive Summary</h3>
        <p className="text-text text-sm leading-relaxed">{executiveSummary}</p>
      </motion.div>

      {/* Top Region + Worst Category - ALWAYS SHOW */}
      <div className="grid md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-2xl p-5 border-l-2 border-emerald-500"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🏆</span>
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wide">Top Region</span>
          </div>
          <p className="font-display text-lg font-bold text-bright">{topRegion.region}</p>
          <p className="text-emerald-400 font-mono text-xl font-bold">{topRegion.revenue}</p>
          <p className="text-subtle text-xs mt-2 leading-relaxed">{topRegion.analysis}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-5 border-l-2 border-rose-500"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">⚠️</span>
            <span className="text-rose-400 text-xs font-bold uppercase tracking-wide">Needs Attention</span>
          </div>
          <p className="font-display text-lg font-bold text-bright">{worstCategory.category}</p>
          <p className="text-rose-400 font-mono text-xl font-bold">{worstCategory.revenue}</p>
          <p className="text-subtle text-xs mt-2 leading-relaxed">{worstCategory.analysis}</p>
        </motion.div>
      </div>

      {/* Revenue Trend + Cancellation - ALWAYS SHOW */}
      <div className="grid md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{trend.icon}</span>
            <span className="text-subtle text-xs font-bold uppercase tracking-wide">Revenue Trend</span>
            <span className={`ml-auto px-2 py-0.5 rounded text-xs font-bold ${trend.color}`}>
              {revenueTrend.direction}
            </span>
          </div>
          <p className="text-text text-sm leading-relaxed">{revenueTrend.analysis}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`glass rounded-2xl p-5 ${
            cancellation.risk === 'HIGH' ? 'border border-rose-500/30' : ''
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🔄</span>
            <span className="text-subtle text-xs font-bold uppercase tracking-wide">Cancellation Rate</span>
            <span className={`ml-auto px-2 py-0.5 rounded text-xs font-bold ${
              cancellation.risk === 'HIGH'   ? 'text-rose-400' :
              cancellation.risk === 'MEDIUM' ? 'text-amber-400' :
              'text-emerald-400'
            }`}>
              {cancellation.risk} RISK
            </span>
          </div>
          <p className="font-mono text-2xl font-bold text-bright">{cancellation.rate}</p>
          <p className="text-subtle text-xs mt-1 leading-relaxed">{cancellation.analysis}</p>
        </motion.div>
      </div>

      {/* Risk Alerts - ALWAYS SHOW */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="glass rounded-2xl p-6 border border-rose-500/20"
      >
        <h3 className="text-rose-400 text-xs font-bold uppercase tracking-widest mb-4">🚨 Risk Alerts</h3>
        <div className="space-y-2">
          {riskAlerts.length > 0 ? riskAlerts.map((alert, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
              <span className="text-rose-400 mt-0.5 flex-shrink-0">▸</span>
              <p className="text-text text-sm">{alert}</p>
            </div>
          )) : (
            <p className="text-muted text-sm">No risk alerts detected.</p>
          )}
        </div>
      </motion.div>

      {/* Recommendations - ALWAYS SHOW */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">💡 Strategic Recommendations</h3>
        <div className="space-y-3">
          {recommendations.length > 0 ? recommendations.map((rec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.07 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 hover:border-indigo-500/30 transition-all duration-200"
            >
              <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-text text-sm">{rec}</p>
            </motion.div>
          )) : (
            <p className="text-muted text-sm">No recommendations available.</p>
          )}
        </div>
      </motion.div>

      {/* Predicted Trend - ALWAYS SHOW */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass rounded-2xl p-6 border border-violet-500/20 bg-violet-500/5"
      >
        <h3 className="text-violet-400 text-xs font-bold uppercase tracking-widest mb-3">🔮 Predicted Next Trend</h3>
        <p className="text-text text-sm italic leading-relaxed">"{predictedTrend}"</p>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex gap-3 flex-wrap"
      >
        <motion.button
          onClick={onChat}
          className="btn-primary flex-1 min-w-[180px]"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          💬 Ask AI About This Data
        </motion.button>
        <motion.button
          onClick={onReset}
          className="btn-secondary flex-1 min-w-[140px]"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          📤 Upload New Files
        </motion.button>
      </motion.div>
    </motion.div>
  )
}