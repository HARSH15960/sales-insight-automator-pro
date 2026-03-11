import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function NavBar({ user }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Signed out')
    navigate('/login')
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 glass border-b border-border/50 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 3v18h18" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M7 16l4-5 4 3 4-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <span className="font-display font-bold text-bright text-sm">SIA</span>
            <span className="font-display font-bold gradient-text text-sm"> Pro</span>
          </div>
        </div>

        {/* Center badge */}
        <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-border/50">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-subtle font-medium">System Operational</span>
        </div>

        {/* User area */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-bright text-sm font-semibold leading-tight">{user?.name}</p>
            <p className="text-muted text-xs capitalize">{user?.role}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center">
            <span className="text-indigo-400 font-display font-bold text-sm">
              {user?.name?.[0]?.toUpperCase()}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg glass text-subtle hover:text-rose-400 hover:border-rose-500/30 border border-transparent text-xs font-medium transition-all duration-200"
          >
            Sign Out
          </button>
        </div>
      </div>
    </motion.nav>
  )
}
