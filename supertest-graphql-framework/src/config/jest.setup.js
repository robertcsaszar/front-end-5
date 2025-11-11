/**
 * Jest Setup
 * Runs before each test file
 */

const config = require('./config');
const logger = require('../helpers/utils/logger');

// Set test timeout
jest.setTimeout(config.test.timeout);

// Global test hooks
beforeAll(() => {
  logger.info('Starting test suite execution');
});

afterAll(() => {
  logger.info('Test suite execution completed');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Promise Rejection:', error);
});

// Custom matchers
expect.extend({
  toBeValidGraphQLResponse(received) {
    const pass = 
      received && 
      typeof received === 'object' &&
      (received.data !== undefined || received.errors !== undefined);
    
    if (pass) {
      return {
        message: () => `expected ${JSON.stringify(received)} not to be a valid GraphQL response`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to be a valid GraphQL response with data or errors field`,
        pass: false
      };
    }
  },
  
  toBeSuccessfulGraphQLResponse(received) {
    const pass = 
      received && 
      typeof received === 'object' &&
      received.data !== undefined &&
      !received.errors;
    
    if (pass) {
      return {
        message: () => `expected ${JSON.stringify(received)} not to be a successful GraphQL response`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to be a successful GraphQL response without errors`,
        pass: false
      };
    }
  },
  
  toHaveGraphQLError(received, errorMessage) {
    const hasErrors = received && received.errors && Array.isArray(received.errors);
    const hasMessage = hasErrors && received.errors.some(err => 
      err.message && err.message.includes(errorMessage)
    );
    
    if (hasMessage) {
      return {
        message: () => `expected GraphQL response not to have error containing "${errorMessage}"`,
        pass: true
      };
    } else {
      return {
        message: () => `expected GraphQL response to have error containing "${errorMessage}"`,
        pass: false
      };
    }
  }
});

module.exports = {};
