import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { chatAPI } from '../services/api'
import toast from 'react-hot-toast'

const SUGGESTED_QUERIES = [
  'Which region sold the most?',
  'What is the worst performing category?',
  'Predict the next revenue trend',
  'What are the main risk factors?',
  'Compare top and bottom performing segments',
  'What strategic action should I take first?'
]

export default function ChatPanel({ jobId }) {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "👋 Hello! I'm your AI sales analyst. I've analyzed your data and I'm ready to answer your questions. Ask me anything about your sales performance, trends, regional breakdowns, or strategic recommendations!",
    timestamp: new Date()
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const message = (text || input).trim()
    if (!message || loading) return

    setInput('')
    setMessages(prev => [...prev, {
      role: 'user',
      content: message,
      timestamp: new Date()
    }])

    setLoading(true)
    try {
      const { data } = await chatAPI.chat(message, jobId)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(data.timestamp)
      }])
    } catch (err) {
      const errMsg = err.response?.data?.message || 'AI service unavailable. Please try again.'
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ ${errMsg}`,
        timestamp: new Date(),
        error: true
      }])
      toast.error('Chat request failed')
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="glass rounded-2xl glow-border overflow-hidden flex flex-col" style={{ height: '70vh' }}>

      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center">
          🧠
        </div>
        <div>
          <p className="text-bright font-semibold text-sm">AI Sales Analyst</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs">Online · Job {jobId}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                  🤖
                </div>
              )}
              <div className={`max-w-[75%] space-y-1`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-tr-sm'
                    : msg.error
                    ? 'glass border border-rose-500/30 text-rose-300 rounded-tl-sm'
                    : 'glass border border-border text-text rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
                <p className={`text-xs text-muted ${msg.role === 'user' ? 'text-right' : ''}`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                  👤
                </div>
              )}
            </motion.div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm">
                🤖
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm glass border border-border">
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-indigo-400"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Suggested queries */}
      {messages.length <= 2 && (
        <div className="px-6 pb-3">
          <p className="text-muted text-xs mb-2 uppercase tracking-wider">Suggested questions</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUERIES.slice(0, 4).map((q, i) => (
              <motion.button
                key={i}
                onClick={() => sendMessage(q)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="px-3 py-1.5 rounded-lg glass border border-indigo-500/20 text-indigo-400/80 text-xs hover:border-indigo-500/50 hover:text-indigo-400 transition-all duration-200"
                disabled={loading}
              >
                {q}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="px-6 pb-6 pt-2 border-t border-border/50">
        <div className="flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your sales data..."
            className="input-field flex-1 resize-none text-sm"
            rows={2}
            disabled={loading}
          />
          <motion.button
            onClick={() => sendMessage()}
            className={`px-4 rounded-xl font-semibold text-sm flex-shrink-0 transition-all duration-200 ${
              input.trim() && !loading
                ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/20'
                : 'bg-surface text-muted cursor-not-allowed'
            }`}
            disabled={!input.trim() || loading}
            whileHover={input.trim() && !loading ? { scale: 1.02 } : {}}
            whileTap={input.trim() && !loading ? { scale: 0.98 } : {}}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </motion.button>
        </div>
        <p className="text-muted text-xs mt-2">↵ Enter to send · Powered by Groq Llama3</p>
      </div>
    </div>
  )
}
