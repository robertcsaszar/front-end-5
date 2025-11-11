/**
 * Well-Known Helper
 * Handles OpenID Connect well-known configuration discovery
 */

const axios = require('axios');
const config = require('../../config/config');
const logger = require('../utils/logger');
const { retryRequest } = require('../utils/retry');

class WellKnownHelper {
  constructor() {
    this.cachedConfig = null;
    this.cacheTimestamp = null;
    this.cacheDuration = 3600000; // 1 hour in milliseconds
  }

  /**
   * Fetch OpenID Connect well-known configuration
   * @param {string} wellKnownUrl - URL to well-known configuration
   * @param {boolean} useCache - Whether to use cached configuration
   * @returns {Promise<Object>} - Well-known configuration
   */
  async fetchWellKnownConfig(wellKnownUrl = config.idp.wellKnownUrl, useCache = true) {
    // Return cached config if valid
    if (useCache && this.isCacheValid()) {
      logger.debug('Returning cached well-known configuration');
      return this.cachedConfig;
    }

    logger.info('Fetching well-known configuration from:', wellKnownUrl);

    const fetchConfig = async () => {
      try {
        const response = await axios.get(wellKnownUrl, {
          timeout: config.api.timeout,
          headers: {
            'Accept': 'application/json'
          }
        });

        return response.data;
      } catch (error) {
        logger.error('Failed to fetch well-known configuration:', error.message);
        throw error;
      }
    };

    const configData = await retryRequest(fetchConfig, 3, 1000);

    // Cache the configuration
    this.cachedConfig = configData;
    this.cacheTimestamp = Date.now();

    logger.debug('Well-known configuration cached');

    return configData;
  }

  /**
   * Check if cached configuration is still valid
   * @returns {boolean} - Whether cache is valid
   */
  isCacheValid() {
    if (!this.cachedConfig || !this.cacheTimestamp) {
      return false;
    }

    const age = Date.now() - this.cacheTimestamp;
    return age < this.cacheDuration;
  }

  /**
   * Clear cached configuration
   */
  clearCache() {
    this.cachedConfig = null;
    this.cacheTimestamp = null;
    logger.debug('Well-known configuration cache cleared');
  }

  /**
   * Get specific endpoint from well-known configuration
   * @param {string} endpointName - Name of the endpoint
   * @returns {Promise<string>} - Endpoint URL
   */
  async getEndpoint(endpointName) {
    const config = await this.fetchWellKnownConfig();
    const endpoint = config[endpointName];

    if (!endpoint) {
      throw new Error(`Endpoint '${endpointName}' not found in well-known configuration`);
    }

    return endpoint;
  }

  /**
   * Get authorization endpoint
   * @returns {Promise<string>} - Authorization endpoint URL
   */
  async getAuthorizationEndpoint() {
    return this.getEndpoint('authorization_endpoint');
  }

  /**
   * Get token endpoint
   * @returns {Promise<string>} - Token endpoint URL
   */
  async getTokenEndpoint() {
    return this.getEndpoint('token_endpoint');
  }

  /**
   * Get userinfo endpoint
   * @returns {Promise<string>} - Userinfo endpoint URL
   */
  async getUserInfoEndpoint() {
    return this.getEndpoint('userinfo_endpoint');
  }

  /**
   * Get end session endpoint
   * @returns {Promise<string>} - End session endpoint URL
   */
  async getEndSessionEndpoint() {
    return this.getEndpoint('end_session_endpoint');
  }

  /**
   * Get JWKS URI
   * @returns {Promise<string>} - JWKS URI
   */
  async getJwksUri() {
    return this.getEndpoint('jwks_uri');
  }

  /**
   * Get issuer
   * @returns {Promise<string>} - Issuer URL
   */
  async getIssuer() {
    return this.getEndpoint('issuer');
  }

  /**
   * Get supported grant types
   * @returns {Promise<Array<string>>} - Array of supported grant types
   */
  async getSupportedGrantTypes() {
    const config = await this.fetchWellKnownConfig();
    return config.grant_types_supported || [];
  }

  /**
   * Get supported response types
   * @returns {Promise<Array<string>>} - Array of supported response types
   */
  async getSupportedResponseTypes() {
    const config = await this.fetchWellKnownConfig();
    return config.response_types_supported || [];
  }

  /**
   * Get supported scopes
   * @returns {Promise<Array<string>>} - Array of supported scopes
   */
  async getSupportedScopes() {
    const config = await this.fetchWellKnownConfig();
    return config.scopes_supported || [];
  }

  /**
   * Check if PKCE is supported
   * @returns {Promise<boolean>} - Whether PKCE is supported
   */
  async isPKCESupported() {
    const config = await this.fetchWellKnownConfig();
    const methods = config.code_challenge_methods_supported || [];
    return methods.length > 0;
  }

  /**
   * Get all endpoints as an object
   * @returns {Promise<Object>} - Object containing all endpoints
   */
  async getAllEndpoints() {
    const config = await this.fetchWellKnownConfig();

    return {
      authorization: config.authorization_endpoint,
      token: config.token_endpoint,
      userinfo: config.userinfo_endpoint,
      endSession: config.end_session_endpoint,
      jwks: config.jwks_uri,
      issuer: config.issuer,
      registration: config.registration_endpoint,
      introspection: config.introspection_endpoint,
      revocation: config.revocation_endpoint
    };
  }
}

module.exports = new WellKnownHelper();
