import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useJobPoller } from '../hooks/useJobPoller'
import { uploadAPI } from '../services/api'
import toast from 'react-hot-toast'
import UploadDropzone from '../components/UploadDropzone'
import ProcessingStatus from '../components/ProcessingStatus'
import InsightPanel from '../components/InsightPanel'
import ChatPanel from '../components/ChatPanel'
import NavBar from '../components/NavBar'

export default function DashboardPage() {
  const { user } = useAuth()
  const [email, setEmail] = useState(user?.email || '')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('upload') // upload | insights | chat

  const {
    jobId, status, progress, result, error,
    isProcessing, isComplete, isFailed,
    startPolling, resetJob
  } = useJobPoller()

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    if (email) formData.append('email', email)

    const loadingToast = toast.loading(`Uploading ${files.length} file${files.length > 1 ? 's' : ''}...`)

    try {
      const { data } = await uploadAPI.upload(formData, setUploadProgress)
      toast.dismiss(loadingToast)
      toast.success('Files uploaded! AI processing started.')
      startPolling(data.jobId)
      setActiveTab('insights')
    } catch (err) {
      toast.dismiss(loadingToast)
      const msg = err.response?.data?.message || 'Upload failed'
      toast.error(msg)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleReset = () => {
    resetJob()
    setActiveTab('upload')
  }

  const showChat = isComplete && jobId

  return (
    <div className="min-h-screen bg-void bg-grid">
      {/* Background orbs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl orb" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-3xl orb" style={{ animationDelay: '3s' }} />
      </div>

      <NavBar user={user} />

      <main className="relative max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-3xl font-bold text-bright">
            Good {getGreeting()}, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-subtle mt-1 text-sm">Upload your sales data and get AI-powered executive insights instantly.</p>
        </motion.div>

        {/* Tab navigation */}
        <div className="flex gap-2">
          {['upload', 'insights', ...(showChat ? ['chat'] : [])].map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'glass text-subtle hover:text-bright'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {tab === 'upload' && '📤 '}
              {tab === 'insights' && '🧠 '}
              {tab === 'chat' && '💬 '}
              {tab}
              {tab === 'insights' && isProcessing && (
                <span className="ml-2 inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
              {tab === 'insights' && isComplete && (
                <span className="ml-2 inline-block w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </motion.button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Email input */}
              <div className="glass rounded-2xl p-6 glow-border">
                <label className="block text-text font-semibold mb-3">
                  📧 Report Email Destination
                </label>
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field flex-1"
                    placeholder="executive@company.com"
                  />
                  <div className="flex items-center px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                    <span>✓ HTML report</span>
                  </div>
                </div>
                <p className="text-muted text-xs mt-2">An executive HTML report with charts will be sent to this address after processing.</p>
              </div>

              {/* Upload dropzone */}
              <UploadDropzone
                onUpload={handleUpload}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
              />

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2">
                {['Smart Insight Engine', 'Groq LLM Analysis', 'Auto Chart Generator', 'Async Queue Processing', 'Email Report Delivery'].map((feat) => (
                  <span key={feat} className="px-3 py-1 rounded-full text-xs glass border border-border text-subtle">
                    ✦ {feat}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {!jobId ? (
                <EmptyState onNavigate={() => setActiveTab('upload')} />
              ) : isProcessing ? (
                <ProcessingStatus progress={progress} status={status} />
              ) : isFailed ? (
                <ErrorState error={error} onReset={handleReset} />
              ) : isComplete ? (
                <InsightPanel result={result} onReset={handleReset} onChat={() => setActiveTab('chat')} />
              ) : null}
            </motion.div>
          )}

          {activeTab === 'chat' && showChat && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ChatPanel jobId={jobId} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

const EmptyState = ({ onNavigate }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="glass rounded-2xl p-16 text-center glow-border"
  >
    <div className="text-6xl mb-4">📊</div>
    <h3 className="font-display text-xl font-semibold text-bright mb-2">No Analysis Yet</h3>
    <p className="text-subtle text-sm mb-6">Upload a sales file to see AI-powered insights here.</p>
    <motion.button
      onClick={onNavigate}
      className="btn-primary"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      Upload Files →
    </motion.button>
  </motion.div>
)

const ErrorState = ({ error, onReset }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="glass rounded-2xl p-12 text-center border border-rose-500/30"
  >
    <div className="text-5xl mb-4">⚠️</div>
    <h3 className="font-display text-xl font-semibold text-rose-400 mb-2">Processing Failed</h3>
    <p className="text-subtle text-sm mb-6">{error}</p>
    <motion.button
      onClick={onReset}
      className="btn-primary"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      Try Again
    </motion.button>
  </motion.div>
)
