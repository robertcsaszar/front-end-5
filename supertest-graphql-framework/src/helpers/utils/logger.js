/**
 * Logger Utility
 * Provides structured logging with different levels
 */

const fs = require('fs');
const path = require('path');
const config = require('../../config/config');

class Logger {
  constructor() {
    this.logLevels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    
    this.currentLevel = this.logLevels[config.logging.level] || this.logLevels.info;
    this.logToFile = config.logging.toFile;
    this.logDir = config.logging.dir;
    
    if (this.logToFile && !fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Format log message
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   * @returns {string} - Formatted log message
   */
  formatMessage(level, message, data) {
    const timestamp = new Date().toISOString();
    const dataString = data ? `\n${JSON.stringify(data, null, 2)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${dataString}`;
  }

  /**
   * Write log to file
   * @param {string} level - Log level
   * @param {string} message - Formatted message
   */
  writeToFile(level, message) {
    if (!this.logToFile) return;
    
    const date = new Date().toISOString().split('T')[0];
    const filename = `test-${date}.log`;
    const filepath = path.join(this.logDir, filename);
    
    fs.appendFileSync(filepath, message + '\n');
  }

  /**
   * Log error message
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   */
  error(message, data) {
    if (this.currentLevel >= this.logLevels.error) {
      const formatted = this.formatMessage('error', message, data);
      console.error(formatted);
      this.writeToFile('error', formatted);
    }
  }

  /**
   * Log warning message
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   */
  warn(message, data) {
    if (this.currentLevel >= this.logLevels.warn) {
      const formatted = this.formatMessage('warn', message, data);
      console.warn(formatted);
      this.writeToFile('warn', formatted);
    }
  }

  /**
   * Log info message
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   */
  info(message, data) {
    if (this.currentLevel >= this.logLevels.info) {
      const formatted = this.formatMessage('info', message, data);
      console.log(formatted);
      this.writeToFile('info', formatted);
    }
  }

  /**
   * Log debug message
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   */
  debug(message, data) {
    if (this.currentLevel >= this.logLevels.debug) {
      const formatted = this.formatMessage('debug', message, data);
      console.log(formatted);
      this.writeToFile('debug', formatted);
    }
  }
}

module.exports = new Logger();
