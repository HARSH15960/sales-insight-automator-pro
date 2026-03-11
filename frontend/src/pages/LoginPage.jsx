import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@demo.com')
  const [password, setPassword] = useState('demo123')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)

    if (result.success) {
      toast.success(`Welcome back, ${result.user.name}!`)
      navigate('/dashboard')
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-void bg-grid flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl orb" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl orb" style={{ animationDelay: '2s' }} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 mb-5 shadow-lg shadow-indigo-500/30">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M3 3v18h18" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <path d="M7 16l4-5 4 3 4-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-bright">Sales Insight</h1>
          <h1 className="font-display text-2xl font-bold gradient-text">Automator Pro</h1>
          <p className="text-subtle text-sm mt-2">AI-powered sales intelligence platform</p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="glass rounded-2xl p-8 glow-border"
        >
          <h2 className="text-bright font-display font-semibold text-lg mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-subtle text-sm font-medium mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field font-body"
                placeholder="you@company.com"
                required
              />
            </div>

            <div>
              <label className="block text-subtle text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field font-body"
                placeholder="••••••••"
                required
              />
            </div>

            <motion.button
              type="submit"
              className="btn-primary w-full text-center"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In →'}
            </motion.button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
            <p className="text-subtle text-xs font-medium mb-2 uppercase tracking-wide">Demo Credentials</p>
            <div className="space-y-1 font-mono text-xs">
              <p className="text-text">admin@demo.com <span className="text-muted">/ demo123</span></p>
              <p className="text-text">analyst@demo.com <span className="text-muted">/ demo123</span></p>
            </div>
          </div>
        </motion.div>

        <p className="text-center text-muted text-xs mt-6">
          Secured with JWT • Rate Limited • TLS Encrypted
        </p>
      </motion.div>
    </div>
  )
}
