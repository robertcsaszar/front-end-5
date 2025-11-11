/**
 * PKCE Helper
 * Handles PKCE (Proof Key for Code Exchange) authentication flow
 */

const crypto = require('crypto');
const config = require('../../config/config');
const logger = require('../utils/logger');

class PKCEHelper {
  /**
   * Generate a random code verifier
   * @param {number} length - Length of the code verifier
   * @returns {string} - Base64 URL encoded code verifier
   */
  generateCodeVerifier(length = config.pkce.codeVerifierLength) {
    const buffer = crypto.randomBytes(length);
    return this.base64UrlEncode(buffer);
  }

  /**
   * Generate code challenge from code verifier
   * @param {string} codeVerifier - Code verifier string
   * @param {string} method - Challenge method (S256 or plain)
   * @returns {string} - Code challenge
   */
  generateCodeChallenge(codeVerifier, method = config.pkce.codeChallengeMethod) {
    if (method === 'plain') {
      return codeVerifier;
    }
    
    if (method === 'S256') {
      const hash = crypto
        .createHash('sha256')
        .update(codeVerifier)
        .digest();
      return this.base64UrlEncode(hash);
    }
    
    throw new Error(`Unsupported code challenge method: ${method}`);
  }

  /**
   * Base64 URL encode a buffer
   * @param {Buffer} buffer - Buffer to encode
   * @returns {string} - Base64 URL encoded string
   */
  base64UrlEncode(buffer) {
    return buffer
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Generate PKCE parameters
   * @returns {Object} - Object containing code_verifier and code_challenge
   */
  generatePKCEParams() {
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = this.generateCodeChallenge(codeVerifier);
    
    logger.debug('Generated PKCE parameters', {
      codeVerifierLength: codeVerifier.length,
      codeChallengeLength: codeChallenge.length
    });
    
    return {
      code_verifier: codeVerifier,
      code_challenge: codeChallenge,
      code_challenge_method: config.pkce.codeChallengeMethod
    };
  }

  /**
   * Generate random state parameter
   * @returns {string} - Random state string
   */
  generateState() {
    const buffer = crypto.randomBytes(32);
    return this.base64UrlEncode(buffer);
  }

  /**
   * Generate random nonce parameter
   * @returns {string} - Random nonce string
   */
  generateNonce() {
    const buffer = crypto.randomBytes(32);
    return this.base64UrlEncode(buffer);
  }

  /**
   * Build authorization URL with PKCE parameters
   * @param {Object} params - Authorization parameters
   * @returns {Object} - URL and PKCE params
   */
  buildAuthorizationUrl(params = {}) {
    const pkceParams = this.generatePKCEParams();
    const state = this.generateState();
    const nonce = this.generateNonce();
    
    const {
      authorizationEndpoint,
      clientId = config.idp.clientId,
      redirectUri,
      scope = 'openid profile email',
      responseType = 'code',
      ...additionalParams
    } = params;
    
    const queryParams = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: responseType,
      scope: scope,
      state: state,
      nonce: nonce,
      code_challenge: pkceParams.code_challenge,
      code_challenge_method: pkceParams.code_challenge_method,
      ...additionalParams
    });
    
    const url = `${authorizationEndpoint}?${queryParams.toString()}`;
    
    return {
      url,
      codeVerifier: pkceParams.code_verifier,
      state,
      nonce
    };
  }
}

module.exports = new PKCEHelper();
