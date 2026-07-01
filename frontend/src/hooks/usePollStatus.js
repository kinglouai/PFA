/**
 * usePollStatus hook — polls /api/v1/github/status every 5s.
 * Stops polling when the run completes, an error occurs, or a timeout is reached.
 *
 * For "latest" run IDs (where the run hasn't started yet), the hook will
 * give up after MAX_LATEST_POLLS attempts and set a "timed out" status
 * so the UI can show a meaningful result instead of spinning forever.
 */
import { useState, useEffect, useRef } from 'react'
import { pollStatus } from '../api/github.js'

const POLL_INTERVAL_MS = 5000
const MAX_LATEST_POLLS = 12   // 12 × 5s = 60 seconds max wait

export function usePollStatus(runId, repoUrl) {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [timedOut, setTimedOut] = useState(false)
  const intervalRef = useRef(null)
  const pollCountRef = useRef(0)

  useEffect(() => {
    if (!runId || !repoUrl) return

    let cancelled = false
    pollCountRef.current = 0

    async function fetchStatus() {
      setLoading(true)
      try {
        const result = await pollStatus(runId, repoUrl)
        if (cancelled) return

        if (result.data) {
          // We got actual run data — reset counter and show it
          setStatus(result.data)
          setError(null)
          setTimedOut(false)

          // Stop polling if completed
          if (result.data?.status === 'completed') {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
        } else {
          // data is null → run hasn't started yet
          pollCountRef.current += 1

          if (runId === 'latest' && pollCountRef.current >= MAX_LATEST_POLLS) {
            // Timed out waiting for the run to start
            clearInterval(intervalRef.current)
            intervalRef.current = null
            setTimedOut(true)
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to fetch status.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    // Initial fetch
    fetchStatus()

    // Poll every 5 seconds
    intervalRef.current = setInterval(fetchStatus, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [runId, repoUrl])

  return { status, loading, error, timedOut }
}
