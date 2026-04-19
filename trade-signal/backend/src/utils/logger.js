// src/utils/logger.js - Wrapper console con timestamp e livello
const levels = ['debug', 'info', 'warn', 'error'];

function ts() {
  return new Date().toISOString();
}

function fmt(level, args) {
  return [`[${ts()}]`, `[${level.toUpperCase()}]`, ...args];
}

export const logger = {
  debug: (...args) => console.debug(...fmt('debug', args)),
  info: (...args) => console.log(...fmt('info', args)),
  warn: (...args) => console.warn(...fmt('warn', args)),
  error: (...args) => console.error(...fmt('error', args))
};

export default logger;
