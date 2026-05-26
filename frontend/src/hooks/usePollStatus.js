/**
 * usePollStatus hook — polls /api/v1/github/status every 5s.
 * Stops polling when the run completes or an error occurs.
 */
import { useState, useEffect, useRef } from 'react'
import { pollStatus } from '../api/github.js'

export function usePollStatus(runId, repoUrl) {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!runId || !repoUrl) return

    let cancelled = false

    async function fetchStatus() {
      setLoading(true)
      try {
        const result = await pollStatus(runId, repoUrl)
        if (!cancelled) {
          setStatus(result.data)
          setError(null)

          // Stop polling if completed
          if (result.data?.status === 'completed') {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to fetch status.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    // Initial fetch
    fetchStatus()

    // Poll every 5 seconds
    intervalRef.current = setInterval(fetchStatus, 5000)

    return () => {
      cancelled = true
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [runId, repoUrl])

  return { status, loading, error }
}
