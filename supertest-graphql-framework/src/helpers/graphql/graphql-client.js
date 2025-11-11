/**
 * GraphQL Client
 * Provides methods for executing GraphQL queries and mutations
 */

const request = require('supertest');
const config = require('../../config/config');
const logger = require('../utils/logger');
const { retryRequest } = require('../utils/retry');

class GraphQLClient {
  constructor(accessToken = null) {
    this.baseUrl = config.api.baseUrl;
    this.endpoint = config.api.graphqlEndpoint;
    this.accessToken = accessToken;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Set or update the access token
   * @param {string} token - Bearer token
   */
  setAccessToken(token) {
    this.accessToken = token;
    logger.debug('Access token updated');
  }

  /**
   * Get headers with authentication
   * @param {Object} additionalHeaders - Additional headers to include
   * @returns {Object} - Complete headers object
   */
  getHeaders(additionalHeaders = {}) {
    const headers = { ...this.defaultHeaders, ...additionalHeaders };
    
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }
    
    return headers;
  }

  /**
   * Execute a GraphQL query
   * @param {string} query - GraphQL query string
   * @param {Object} variables - Query variables
   * @param {Object} options - Additional options (headers, retries, etc.)
   * @returns {Promise<Object>} - Response data
   */
  async query(query, variables = {}, options = {}) {
    const {
      headers = {},
      skipAuth = false,
      retries = config.test.retryAttempts,
      expectedStatus = 200
    } = options;

    const requestHeaders = skipAuth 
      ? { ...this.defaultHeaders, ...headers }
      : this.getHeaders(headers);

    const payload = {
      query,
      variables
    };

    logger.debug('Executing GraphQL query:', {
      query: query.substring(0, 100) + '...',
      variables: Object.keys(variables)
    });

    const executeRequest = async () => {
      const response = await request(this.baseUrl)
        .post(this.endpoint)
        .set(requestHeaders)
        .send(payload)
        .timeout(config.api.timeout);

      return response;
    };

    try {
      const response = retries > 0 
        ? await retryRequest(executeRequest, retries, config.test.retryDelay)
        : await executeRequest();

      // Log response details
      logger.debug('GraphQL response status:', response.status);
      
      if (response.body.errors) {
        logger.warn('GraphQL errors:', response.body.errors);
      }

      // Validate expected status
      if (response.status !== expectedStatus) {
        logger.error(`Expected status ${expectedStatus}, got ${response.status}`);
      }

      return {
        status: response.status,
        headers: response.headers,
        body: response.body,
        data: response.body.data,
        errors: response.body.errors
      };
    } catch (error) {
      logger.error('GraphQL request failed:', error.message);
      throw error;
    }
  }

  /**
   * Execute a GraphQL mutation
   * @param {string} mutation - GraphQL mutation string
   * @param {Object} variables - Mutation variables
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Response data
   */
  async mutate(mutation, variables = {}, options = {}) {
    return this.query(mutation, variables, options);
  }

  /**
   * Execute multiple GraphQL queries in parallel
   * @param {Array} queries - Array of query objects {query, variables, options}
   * @returns {Promise<Array>} - Array of responses
   */
  async batchQuery(queries) {
    logger.debug(`Executing ${queries.length} queries in parallel`);
    
    const promises = queries.map(({ query, variables, options }) =>
      this.query(query, variables, options)
    );

    return Promise.all(promises);
  }

  /**
   * Execute a query and assert successful response
   * @param {string} query - GraphQL query string
   * @param {Object} variables - Query variables
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Response data
   */
  async querySuccess(query, variables = {}, options = {}) {
    const response = await this.query(query, variables, options);
    
    if (response.errors) {
      throw new Error(`GraphQL query failed with errors: ${JSON.stringify(response.errors)}`);
    }
    
    if (!response.data) {
      throw new Error('GraphQL query returned no data');
    }
    
    return response;
  }

  /**
   * Execute a mutation and assert successful response
   * @param {string} mutation - GraphQL mutation string
   * @param {Object} variables - Mutation variables
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Response data
   */
  async mutateSuccess(mutation, variables = {}, options = {}) {
    return this.querySuccess(mutation, variables, options);
  }

  /**
   * Execute a query expecting errors
   * @param {string} query - GraphQL query string
   * @param {Object} variables - Query variables
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Response with errors
   */
  async queryExpectError(query, variables = {}, options = {}) {
    const response = await this.query(query, variables, options);
    
    if (!response.errors || response.errors.length === 0) {
      throw new Error('Expected GraphQL query to return errors, but it succeeded');
    }
    
    return response;
  }
}

module.exports = GraphQLClient;
