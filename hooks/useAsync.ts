import { useState, useCallback, useEffect } from 'react'
import { useNotifications } from '@/components/notifications/NotificationProvider'

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export function useAsync<T = any>() {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null
  })

  const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
    setState({ data: null, loading: true, error: null })
    try {
      const data = await asyncFunction()
      setState({ data, loading: false, error: null })
      return data
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error })
      throw error
    }
  }, [])

  return { ...state, execute }
}

export function useAsyncEffect<T = any>(
  asyncFunction: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }))
      try {
        const data = await asyncFunction()
        if (!cancelled) {
          setState({ data, loading: false, error: null })
        }
      } catch (error) {
        if (!cancelled) {
          setState({ data: null, loading: false, error: error as Error })
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, deps)

  return state
}

export function useAsyncWithNotification<T = any>() {
  const { showNotification } = useNotifications()
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null
  })

  const execute = useCallback(async (
    asyncFunction: () => Promise<T>,
    options?: {
      loadingMessage?: string
      successMessage?: string
      errorMessage?: string | ((error: Error) => string)
    }
  ) => {
    setState({ data: null, loading: true, error: null })

    let loadingNotificationId: string | undefined
    if (options?.loadingMessage) {
      const notification = {
        type: 'info' as const,
        title: 'Loading',
        message: options.loadingMessage,
        duration: 0
      }
      showNotification(notification)
    }

    try {
      const data = await asyncFunction()
      setState({ data, loading: false, error: null })

      if (options?.successMessage) {
        showNotification({
          type: 'success',
          title: 'Success',
          message: options.successMessage
        })
      }

      return data
    } catch (error) {
      const err = error as Error
      setState({ data: null, loading: false, error: err })

      if (options?.errorMessage) {
        const message = typeof options.errorMessage === 'function'
          ? options.errorMessage(err)
          : options.errorMessage

        showNotification({
          type: 'error',
          title: 'Error',
          message: message || err.message
        })
      }

      throw error
    }
  }, [showNotification])

  return { ...state, execute }
}

// Retry logic for failed operations
export function useRetry<T = any>(
  asyncFunction: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
) {
  const [retryCount, setRetryCount] = useState(0)
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null
  })

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null })

    let lastError: Error | null = null

    for (let i = 0; i <= maxRetries; i++) {
      try {
        const data = await asyncFunction()
        setState({ data, loading: false, error: null })
        setRetryCount(0)
        return data
      } catch (error) {
        lastError = error as Error
        setRetryCount(i)

        if (i < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
        }
      }
    }

    setState({ data: null, loading: false, error: lastError })
    throw lastError
  }, [asyncFunction, maxRetries, delay])

  return { ...state, execute, retryCount }
}