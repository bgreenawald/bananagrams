type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: Date
  context?: string
  data?: any
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 100
  private isDevelopment = import.meta.env.DEV

  private log(level: LogLevel, message: string, context?: string, data?: any) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      data,
    }

    // Add to internal log storage
    this.logs.push(entry)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // Console output in development or for important messages
    if (this.isDevelopment || level === 'error' || level === 'warn') {
      const prefix = context ? `[${context}]` : ''
      const timestamp = entry.timestamp.toISOString()

      switch (level) {
        case 'debug':
          if (this.isDevelopment) {
            console.debug(`🐛 ${timestamp} ${prefix} ${message}`, data || '')
          }
          break
        case 'info':
          console.info(`ℹ️ ${timestamp} ${prefix} ${message}`, data || '')
          break
        case 'warn':
          console.warn(`⚠️ ${timestamp} ${prefix} ${message}`, data || '')
          break
        case 'error':
          console.error(`❌ ${timestamp} ${prefix} ${message}`, data || '')
          break
      }
    }
  }

  debug(message: string, context?: string, data?: any) {
    this.log('debug', message, context, data)
  }

  info(message: string, context?: string, data?: any) {
    this.log('info', message, context, data)
  }

  warn(message: string, context?: string, data?: any) {
    this.log('warn', message, context, data)
  }

  error(message: string, context?: string, data?: any) {
    this.log('error', message, context, data)
  }

  // Socket-specific logging helpers
  socketEvent(eventName: string, data?: any) {
    this.debug(`Socket event: ${eventName}`, 'WebSocket', data)
  }

  socketError(error: any, operation: string) {
    this.error(`Socket operation failed: ${operation}`, 'WebSocket', error)
  }

  // Tile-specific logging helpers
  tileUpdate(message: string, data?: any) {
    this.debug(message, 'Tile System', data)
  }

  // Game-specific logging helpers
  gameEvent(event: string, data?: any) {
    this.info(`Game event: ${event}`, 'Game', data)
  }

  // Get recent logs for debugging
  getRecentLogs(count = 50): LogEntry[] {
    return this.logs.slice(-count)
  }

  // Clear logs
  clearLogs() {
    this.logs = []
  }

  // Export logs for debugging
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }
}

// Create singleton instance
export const logger = new Logger()

// Convenience functions for direct import
export const logDebug = (message: string, context?: string, data?: any) =>
  logger.debug(message, context, data)

export const logInfo = (message: string, context?: string, data?: any) =>
  logger.info(message, context, data)

export const logWarn = (message: string, context?: string, data?: any) =>
  logger.warn(message, context, data)

export const logError = (message: string, context?: string, data?: any) =>
  logger.error(message, context, data)
