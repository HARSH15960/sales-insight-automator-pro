import { useState, useEffect, useRef, useCallback } from 'react'
import { statusAPI } from '../services/api'

export const useJobPoller = () => {
  const [jobId, setJobId] = useState(null)
  const [status, setStatus] = useState(null)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)

  const startPolling = useCallback((id) => {
    setJobId(id)
    setStatus('waiting')
    setProgress(0)
    setResult(null)
    setError(null)
  }, [])

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const resetJob = useCallback(() => {
    stopPolling()
    setJobId(null)
    setStatus(null)
    setProgress(0)
    setResult(null)
    setError(null)
  }, [stopPolling])

  useEffect(() => {
    if (!jobId) return

    const poll = async () => {
      try {
        const { data } = await statusAPI.getStatus(jobId)
        setStatus(data.status)
        setProgress(data.progress || 0)

        if (data.status === 'completed') {
          setResult(data.result)
          stopPolling()
        } else if (data.status === 'failed') {
          setError(data.error || 'Processing failed')
          stopPolling()
        }
      } catch (err) {
        console.error('Polling error:', err)
        if (err.response?.status !== 404) {
          setError('Failed to check job status')
          stopPolling()
        }
      }
    }

    poll() // Immediate first poll
    intervalRef.current = setInterval(poll, 2500)

    return () => stopPolling()
  }, [jobId, stopPolling])

  const isProcessing = status === 'waiting' || status === 'active'
  const isComplete = status === 'completed'
  const isFailed = status === 'failed'

  return {
    jobId,
    status,
    progress,
    result,
    error,
    isProcessing,
    isComplete,
    isFailed,
    startPolling,
    resetJob
  }
}
