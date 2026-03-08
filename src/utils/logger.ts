type LogLevel = 'INFO' | 'ERROR' | 'DEBUG';

const log = (level: LogLevel, message: string, meta?: unknown): void => {
  const timestamp = new Date().toISOString();

  if (meta !== undefined) {
    // Structured console output for easier filtering in logs.
    console.log(`[${timestamp}] [${level}] ${message}`, meta);
    return;
  }

  console.log(`[${timestamp}] [${level}] ${message}`);
};

export const logger = {
  info: (message: string, meta?: unknown): void => log('INFO', message, meta),
  error: (message: string, meta?: unknown): void => log('ERROR', message, meta),
  debug: (message: string, meta?: unknown): void => log('DEBUG', message, meta),
};
