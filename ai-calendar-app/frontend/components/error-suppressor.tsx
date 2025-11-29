'use client'

import { useEffect } from 'react'

export function ErrorSuppressor() {
  useEffect(() => {
    // Suppress console errors for network failures
    const originalError = console.error
    const originalWarn = console.warn
    
    console.error = function(...args: any[]) {
      const message = String(args.join(' '))
      // Suppress all network-related errors
      if (
        message.includes('Failed to fetch') ||
        message.includes('NetworkError') ||
        message.includes('Network request failed') ||
        message.includes('AuthRetryableFetchError') ||
        message.includes('TypeError') && message.includes('fetch') ||
        message.includes('fetch failed') ||
        message.includes('ERR_NETWORK') ||
        message.includes('ERR_INTERNET_DISCONNECTED')
      ) {
        return // Don't log these errors
      }
      originalError.apply(console, args)
    }
    
    console.warn = function(...args: any[]) {
      const message = String(args.join(' '))
      // Suppress network-related warnings
      if (
        message.includes('AuthRetryableFetchError') ||
        message.includes('Failed to fetch') ||
        message.includes('NetworkError') ||
        (message.includes('fetch') && message.includes('retry'))
      ) {
        return // Don't log these warnings
      }
      originalWarn.apply(console, args)
    }

    // Also suppress unhandled promise rejections for network errors
    const originalUnhandledRejection = window.onunhandledrejection
    window.addEventListener('unhandledrejection', (event) => {
      const message = String(event.reason?.message || event.reason || '')
      if (
        message.includes('Failed to fetch') ||
        message.includes('NetworkError') ||
        message.includes('AuthRetryableFetchError') ||
        (message.includes('TypeError') && message.includes('fetch'))
      ) {
        event.preventDefault() // Suppress the error
        return
      }
    })

    // Cleanup on unmount
    return () => {
      console.error = originalError
      console.warn = originalWarn
    }
  }, [])

  return null
}

