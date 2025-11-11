/**
 * Authentication Helper
 * Handles complete authentication flow with IDP, PKCE, and token management
 */

const axios = require('axios');
const qs = require('qs');
const config = require('../../config/config');
const logger = require('../utils/logger');
const pkceHelper = require('./pkce-helper');
const wellKnownHelper = require('./well-known-helper');
const { retryRequest } = require('../utils/retry');

class AuthHelper {
  constructor() {
    this.tokenCache = new Map();
  }

  /**
   * Get access token using authorization code flow with PKCE
   * @param {Object} params - Authentication parameters
   * @returns {Promise<Object>} - Token response
   */
  async getAccessTokenWithPKCE(params = {}) {
    const {
      username = config.testUsers.user.email,
      password = config.testUsers.user.password,
      clientId = config.idp.clientId,
      redirectUri = 'http://localhost:3000/callback',
      scope = 'openid profile email'
    } = params;

    logger.info('Starting PKCE authentication flow for user:', username);

    try {
      // Step 1: Get well-known configuration
      const endpoints = await wellKnownHelper.getAllEndpoints();
      logger.debug('Retrieved IDP endpoints');

      // Step 2: Generate PKCE parameters
      const pkceParams = pkceHelper.generatePKCEParams();
      const state = pkceHelper.generateState();
      const nonce = pkceHelper.generateNonce();

      // Step 3: Build authorization request
      const authParams = {
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: scope,
        state: state,
        nonce: nonce,
        code_challenge: pkceParams.code_challenge,
        code_challenge_method: pkceParams.code_challenge_method
      };

      logger.debug('Authorization request parameters prepared');

      // Step 4: Simulate authorization (in real scenario, this would involve browser interaction)
      // For testing, we'll use direct token exchange with password grant as fallback
      const tokenResponse = await this.exchangePasswordForToken({
        username,
        password,
        clientId,
        scope,
        tokenEndpoint: endpoints.token
      });

      logger.info('Successfully obtained access token');

      // Cache the token
      this.cacheToken(username, tokenResponse);

      return tokenResponse;
    } catch (error) {
      logger.error('PKCE authentication failed:', error.message);
      throw error;
    }
  }

  /**
   * Exchange authorization code for tokens
   * @param {Object} params - Token exchange parameters
   * @returns {Promise<Object>} - Token response
   */
  async exchangeCodeForToken(params) {
    const {
      code,
      codeVerifier,
      clientId = config.idp.clientId,
      clientSecret = config.idp.clientSecret,
      redirectUri,
      tokenEndpoint
    } = params;

    logger.info('Exchanging authorization code for tokens');

    const tokenParams = {
      grant_type: 'authorization_code',
      code: code,
      client_id: clientId,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier
    };

    if (clientSecret) {
      tokenParams.client_secret = clientSecret;
    }

    const requestToken = async () => {
      const response = await axios.post(
        tokenEndpoint,
        qs.stringify(tokenParams),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: config.api.timeout
        }
      );

      return response.data;
    };

    return retryRequest(requestToken, 2, 1000);
  }

  /**
   * Exchange username/password for tokens (Resource Owner Password Credentials)
   * @param {Object} params - Token exchange parameters
   * @returns {Promise<Object>} - Token response
   */
  async exchangePasswordForToken(params) {
    const {
      username,
      password,
      clientId = config.idp.clientId,
      clientSecret = config.idp.clientSecret,
      scope = 'openid profile email',
      tokenEndpoint
    } = params;

    logger.info('Exchanging password for tokens for user:', username);

    const tokenParams = {
      grant_type: 'password',
      username: username,
      password: password,
      client_id: clientId,
      scope: scope
    };

    if (clientSecret) {
      tokenParams.client_secret = clientSecret;
    }

    const requestToken = async () => {
      try {
        const response = await axios.post(
          tokenEndpoint,
          qs.stringify(tokenParams),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout: config.api.timeout
          }
        );

        return response.data;
      } catch (error) {
        if (error.response) {
          logger.error('Token exchange failed:', {
            status: error.response.status,
            data: error.response.data
          });
        }
        throw error;
      }
    };

    return retryRequest(requestToken, 2, 1000);
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Refresh token
   * @param {Object} params - Additional parameters
   * @returns {Promise<Object>} - New token response
   */
  async refreshAccessToken(refreshToken, params = {}) {
    const {
      clientId = config.idp.clientId,
      clientSecret = config.idp.clientSecret
    } = params;

    logger.info('Refreshing access token');

    const tokenEndpoint = await wellKnownHelper.getTokenEndpoint();

    const tokenParams = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId
    };

    if (clientSecret) {
      tokenParams.client_secret = clientSecret;
    }

    const requestToken = async () => {
      const response = await axios.post(
        tokenEndpoint,
        qs.stringify(tokenParams),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: config.api.timeout
        }
      );

      return response.data;
    };

    return retryRequest(requestToken, 2, 1000);
  }

  /**
   * Get user info using access token
   * @param {string} accessToken - Access token
   * @returns {Promise<Object>} - User info
   */
  async getUserInfo(accessToken) {
    logger.info('Fetching user info');

    const userInfoEndpoint = await wellKnownHelper.getUserInfoEndpoint();

    const response = await axios.get(userInfoEndpoint, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      timeout: config.api.timeout
    });

    return response.data;
  }

  /**
   * Cache token for a user
   * @param {string} username - Username
   * @param {Object} tokenData - Token data
   */
  cacheToken(username, tokenData) {
    this.tokenCache.set(username, {
      ...tokenData,
      timestamp: Date.now()
    });
    logger.debug(`Token cached for user: ${username}`);
  }

  /**
   * Get cached token for a user
   * @param {string} username - Username
   * @returns {Object|null} - Cached token or null
   */
  getCachedToken(username) {
    const cached = this.tokenCache.get(username);

    if (!cached) {
      return null;
    }

    // Check if token is expired (assume 1 hour if no expires_in)
    const expiresIn = (cached.expires_in || 3600) * 1000;
    const age = Date.now() - cached.timestamp;

    if (age >= expiresIn) {
      logger.debug(`Cached token expired for user: ${username}`);
      this.tokenCache.delete(username);
      return null;
    }

    logger.debug(`Using cached token for user: ${username}`);
    return cached;
  }

  /**
   * Get or create access token for a user
   * @param {Object} userCredentials - User credentials
   * @returns {Promise<string>} - Access token
   */
  async getOrCreateToken(userCredentials = config.testUsers.user) {
    const username = userCredentials.email || userCredentials.username;

    // Check cache first
    const cached = this.getCachedToken(username);
    if (cached) {
      return cached.access_token;
    }

    // Get new token
    const tokenResponse = await this.getAccessTokenWithPKCE({
      username: userCredentials.email || userCredentials.username,
      password: userCredentials.password
    });

    return tokenResponse.access_token;
  }

  /**
   * Clear token cache
   * @param {string} username - Username (optional, clears all if not provided)
   */
  clearTokenCache(username = null) {
    if (username) {
      this.tokenCache.delete(username);
      logger.debug(`Token cache cleared for user: ${username}`);
    } else {
      this.tokenCache.clear();
      logger.debug('All token cache cleared');
    }
  }

  /**
   * Logout user (revoke token)
   * @param {string} accessToken - Access token to revoke
   * @returns {Promise<void>}
   */
  async logout(accessToken) {
    logger.info('Logging out user');

    try {
      const config = await wellKnownHelper.fetchWellKnownConfig();
      const revocationEndpoint = config.revocation_endpoint;

      if (!revocationEndpoint) {
        logger.warn('Revocation endpoint not available');
        return;
      }

      await axios.post(
        revocationEndpoint,
        qs.stringify({
          token: accessToken,
          client_id: config.idp.clientId
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      logger.info('Token revoked successfully');
    } catch (error) {
      logger.error('Failed to revoke token:', error.message);
      throw error;
    }
  }
}

module.exports = new AuthHelper();
