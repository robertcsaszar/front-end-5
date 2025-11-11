/**
 * Retry Utility
 * Provides retry logic for failed requests
 */

const logger = require('./logger');

/**
 * Retry a request function with exponential backoff
 * @param {Function} requestFn - Function that returns a promise
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} delay - Initial delay in milliseconds
 * @param {number} backoffMultiplier - Multiplier for exponential backoff
 * @returns {Promise} - Result of successful request
 */
async function retryRequest(
  requestFn,
  maxRetries = 3,
  delay = 1000,
  backoffMultiplier = 2
) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await requestFn();
      
      if (attempt > 0) {
        logger.info(`Request succeeded on attempt ${attempt + 1}`);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const waitTime = delay * Math.pow(backoffMultiplier, attempt);
        logger.warn(`Request failed (attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${waitTime}ms...`);
        await sleep(waitTime);
      }
    }
  }
  
  logger.error(`Request failed after ${maxRetries + 1} attempts`);
  throw lastError;
}

/**
 * Retry with custom condition
 * @param {Function} requestFn - Function that returns a promise
 * @param {Function} shouldRetry - Function that determines if retry should happen
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} delay - Initial delay in milliseconds
 * @returns {Promise} - Result of successful request
 */
async function retryWithCondition(
  requestFn,
  shouldRetry,
  maxRetries = 3,
  delay = 1000
) {
  let lastResult;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      lastResult = await requestFn();
      
      if (!shouldRetry(lastResult)) {
        return lastResult;
      }
      
      if (attempt < maxRetries) {
        logger.warn(`Retry condition met (attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    } catch (error) {
      if (attempt < maxRetries) {
        logger.warn(`Request failed (attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${delay}ms...`);
        await sleep(delay);
      } else {
        throw error;
      }
    }
  }
  
  return lastResult;
}

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after delay
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Poll a function until a condition is met
 * @param {Function} pollFn - Function to poll
 * @param {Function} condition - Function that checks if condition is met
 * @param {Object} options - Polling options
 * @returns {Promise} - Result when condition is met
 */
async function pollUntil(
  pollFn,
  condition,
  options = {}
) {
  const {
    timeout = 30000,
    interval = 1000,
    timeoutError = 'Polling timeout exceeded'
  } = options;
  
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      const result = await pollFn();
      
      if (condition(result)) {
        logger.debug('Polling condition met');
        return result;
      }
    } catch (error) {
      logger.debug('Polling attempt failed:', error.message);
    }
    
    await sleep(interval);
  }
  
  throw new Error(timeoutError);
}

module.exports = {
  retryRequest,
  retryWithCondition,
  sleep,
  pollUntil
};
