/**
 * Production-ready Structured Logger Utility
 */
const logger = {
  info: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.log(JSON.stringify({ timestamp, level: 'INFO', message, ...meta }));
  },
  warn: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.warn(JSON.stringify({ timestamp, level: 'WARN', message, ...meta }));
  },
  error: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.error(JSON.stringify({ timestamp, level: 'ERROR', message, ...meta }));
  },
  audit: (action, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.log(JSON.stringify({ timestamp, level: 'AUDIT', action, ...meta }));
  },
};

module.exports = logger;
