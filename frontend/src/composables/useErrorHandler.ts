import { ref, onErrorCaptured } from 'vue'
import { useUIStore } from '@/stores/ui'

interface ErrorInfo {
  message: string
  stack?: string
  timestamp: Date
  context?: string
}

// Singleton instance
let globalErrorHandlerInstance: ReturnType<typeof createErrorHandler> | null = null

/**
 * Creates an error handler with the specified context.
 *
 * @param context - The context in which the error handler is being used
 * @returns An object containing error handling functions and state
 */
function createErrorHandler(context = 'Unknown') {
  const uiStore = useUIStore()
  const errors = ref<ErrorInfo[]>([])
  const hasError = ref(false)

  // Capture Vue component errors
  onErrorCaptured((error: unknown, _instance, info) => {
    handleError(error, `Vue Component - ${info}`)
    return false // Prevent error from propagating up
  })

  /**
   * Handles an error by logging it and showing a user-friendly message.
   *
   * @param error - The error to handle
   * @param errorContext - Optional context for the error
   */
  function handleError(error: unknown, errorContext?: string) {
    const errorInfo: ErrorInfo = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date(),
      context: errorContext || context,
    }

    errors.value.push(errorInfo)
    hasError.value = true

    // Log to console in development
    if (import.meta.env.DEV) {
      console.group(`🚨 Error in ${errorInfo.context}`)
      console.error('Message:', errorInfo.message)
      if (errorInfo.stack) {
        console.error('Stack:', errorInfo.stack)
      }
      console.error('Timestamp:', errorInfo.timestamp)
      console.groupEnd()
    }

    // Show user-friendly error message
    showUserError(errorInfo)
  }

  /**
   * Wraps a promise to handle any errors that occur during its execution.
   *
   * @param promise - The promise to wrap
   * @param errorContext - Optional context for the error
   * @returns The wrapped promise
   */
  function handleAsyncError(promise: Promise<any>, errorContext?: string) {
    return promise.catch(error => {
      handleError(error, errorContext)
      throw error // Re-throw to allow caller to handle if needed
    })
  }

  /**
   * Handles WebSocket-specific errors.
   *
   * @param error - The socket error
   * @param operation - The operation that failed
   */
  function handleSocketError(error: any, operation: string) {
    const message = `Socket operation failed: ${operation}`
    const fullError = new Error(message)
    if (error.message) {
      fullError.message += ` - ${error.message}`
    }
    handleError(fullError, 'WebSocket')
  }

  /**
   * Shows a user-friendly error message in a modal.
   *
   * @param errorInfo - The error information to display
   */
  function showUserError(errorInfo: ErrorInfo) {
    // Determine user-friendly message based on error type
    let userMessage = 'An unexpected error occurred'

    if (errorInfo.message.includes('Connection')) {
      userMessage = 'Connection lost. Please check your internet connection and try again.'
    } else if (errorInfo.message.includes('timeout')) {
      userMessage = 'Operation timed out. Please try again.'
    } else if (errorInfo.message.includes('Socket')) {
      userMessage = 'Connection error. Please refresh the page and try again.'
    } else if (errorInfo.context?.includes('WebSocket')) {
      userMessage = 'Network error. Please check your connection.'
    }

    uiStore.showModal('error', {
      message: userMessage,
      technical: import.meta.env.DEV ? errorInfo.message : undefined,
    })
  }

  /**
   * Clears all stored errors and resets the error state.
   */
  function clearErrors() {
    errors.value = []
    hasError.value = false
  }

  /**
   * Retries a function with exponential backoff.
   *
   * @param fn - The function to retry
   * @param maxRetries - Maximum number of retry attempts
   * @returns A promise that resolves with the function result or rejects after max retries
   */
  function retry(fn: () => Promise<any>, maxRetries = 3): Promise<any> {
    return new Promise((resolve, reject) => {
      let attempts = 0

      const attemptFunction = async () => {
        try {
          const result = await fn()
          resolve(result)
        } catch (error) {
          attempts++
          if (attempts >= maxRetries) {
            handleError(error, 'Retry failed')
            reject(error)
          } else {
            // Exponential backoff
            setTimeout(attemptFunction, Math.pow(2, attempts) * 1000)
          }
        }
      }

      attemptFunction()
    })
  }

  return {
    errors,
    hasError,
    handleError,
    handleAsyncError,
    handleSocketError,
    clearErrors,
    retry,
  }
}

/**
 * Returns a singleton error handler instance to ensure consistent UI store usage.
 *
 * @param context - The context in which the error handler is being used
 * @returns The singleton error handler instance
 */
export function useErrorHandler(context = 'Unknown') {
  if (!globalErrorHandlerInstance) {
    globalErrorHandlerInstance = createErrorHandler(context)
  }
  return globalErrorHandlerInstance
}

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason)

  // Use the singleton error handler instance
  const errorHandler = useErrorHandler('Global')
  errorHandler.handleError(event.reason, 'Unhandled Promise Rejection')

  // Prevent the default console error
  event.preventDefault()
})
