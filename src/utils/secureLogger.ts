/**
 * Secure logger utility to replace console.log statements
 * Prevents sensitive data exposure in production
 */

interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn', 
  INFO: 'info',
  DEBUG: 'debug'
};

class SecureLogger {
  private isDevelopment = import.meta.env.DEV;
  private isProduction = import.meta.env.PROD;

  private sanitizeData(data: any): any {
    if (typeof data === 'string') {
      // Remove potential sensitive patterns
      return data
        .replace(/password[s]?[:\s=]+[^\s]+/gi, 'password: [REDACTED]')
        .replace(/token[s]?[:\s=]+[^\s]+/gi, 'token: [REDACTED]')
        .replace(/key[s]?[:\s=]+[^\s]+/gi, 'key: [REDACTED]')
        .replace(/secret[s]?[:\s=]+[^\s]+/gi, 'secret: [REDACTED]')
        .replace(/auth[:\s=]+[^\s]+/gi, 'auth: [REDACTED]');
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized = { ...data };
      
      // Remove sensitive keys
      const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth', 'authorization'];
      sensitiveKeys.forEach(key => {
        if (key in sanitized) {
          sanitized[key] = '[REDACTED]';
        }
      });
      
      return sanitized;
    }
    
    return data;
  }

  private shouldLog(level: string): boolean {
    if (this.isProduction) {
      // In production, only log errors and warnings
      return level === LOG_LEVELS.ERROR || level === LOG_LEVELS.WARN;
    }
    return true; // Log everything in development
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog(LOG_LEVELS.ERROR)) {
      const sanitizedArgs = args.map(arg => this.sanitizeData(arg));
      console.error(`[ERROR] ${message}`, ...sanitizedArgs);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LOG_LEVELS.WARN)) {
      const sanitizedArgs = args.map(arg => this.sanitizeData(arg));
      console.warn(`[WARN] ${message}`, ...sanitizedArgs);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LOG_LEVELS.INFO)) {
      const sanitizedArgs = args.map(arg => this.sanitizeData(arg));
      console.info(`[INFO] ${message}`, ...sanitizedArgs);
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LOG_LEVELS.DEBUG)) {
      const sanitizedArgs = args.map(arg => this.sanitizeData(arg));
      console.log(`[DEBUG] ${message}`, ...sanitizedArgs);
    }
  }

  // For tracking events without exposing sensitive data
  track(event: string, data?: any): void {
    if (this.isDevelopment) {
      const sanitizedData = data ? this.sanitizeData(data) : undefined;
      console.log(`[TRACK] ${event}`, sanitizedData);
    }
  }
}

export const secureLogger = new SecureLogger();