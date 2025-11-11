/**
 * Data Generator
 * Generates test data for various entities
 */

const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

class DataGenerator {
  /**
   * Generate random string
   * @param {number} length - Length of string
   * @returns {string} - Random string
   */
  randomString(length = 10) {
    return crypto.randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
  }

  /**
   * Generate random email
   * @param {string} prefix - Email prefix
   * @returns {string} - Random email address
   */
  randomEmail(prefix = 'test') {
    return `${prefix}_${this.randomString(8)}@example.com`;
  }

  /**
   * Generate random integer
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} - Random integer
   */
  randomInt(min = 0, max = 100) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generate random boolean
   * @returns {boolean} - Random boolean
   */
  randomBoolean() {
    return Math.random() >= 0.5;
  }

  /**
   * Pick random item from array
   * @param {Array} array - Array to pick from
   * @returns {*} - Random item
   */
  randomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Generate test user data
   * @param {Object} overrides - Override default values
   * @returns {Object} - User data
   */
  generateUser(overrides = {}) {
    const firstName = overrides.firstName || `User${this.randomString(4)}`;
    const lastName = overrides.lastName || `Test${this.randomString(4)}`;
    
    return {
      email: overrides.email || this.randomEmail('user'),
      firstName,
      lastName,
      password: overrides.password || 'Test@123456',
      status: overrides.status || 'active',
      roles: overrides.roles || ['user'],
      ...overrides
    };
  }

  /**
   * Generate test group data
   * @param {Object} overrides - Override default values
   * @returns {Object} - Group data
   */
  generateGroup(overrides = {}) {
    return {
      name: overrides.name || `Group_${this.randomString(8)}`,
      description: overrides.description || `Test group ${this.randomString(6)}`,
      status: overrides.status || 'active',
      ...overrides
    };
  }

  /**
   * Generate test tenant data
   * @param {Object} overrides - Override default values
   * @returns {Object} - Tenant data
   */
  generateTenant(overrides = {}) {
    const name = overrides.name || `Tenant_${this.randomString(6)}`;
    
    return {
      name,
      domain: overrides.domain || `${name.toLowerCase()}.example.com`,
      status: overrides.status || 'active',
      settings: overrides.settings || {
        maxUsers: 100,
        enableSSO: true
      },
      ...overrides
    };
  }

  /**
   * Generate test asset data (OAuth2 client)
   * @param {Object} overrides - Override default values
   * @returns {Object} - Asset data
   */
  generateAsset(overrides = {}) {
    const name = overrides.name || `Asset_${this.randomString(8)}`;
    
    return {
      name,
      type: overrides.type || this.randomFromArray(['web', 'spa', 'native', 'service']),
      clientId: overrides.clientId || `client_${uuidv4()}`,
      clientSecret: overrides.clientSecret || this.randomString(32),
      redirectUris: overrides.redirectUris || ['http://localhost:3000/callback'],
      grantTypes: overrides.grantTypes || ['authorization_code', 'refresh_token'],
      responseTypes: overrides.responseTypes || ['code'],
      status: overrides.status || 'active',
      ...overrides
    };
  }

  /**
   * Generate PKCE asset data
   * @param {Object} overrides - Override default values
   * @returns {Object} - PKCE asset data
   */
  generatePKCEAsset(overrides = {}) {
    return this.generateAsset({
      grantTypes: ['authorization_code', 'refresh_token'],
      responseTypes: ['code'],
      requirePKCE: true,
      ...overrides
    });
  }

  /**
   * Generate Implicit flow asset data
   * @param {Object} overrides - Override default values
   * @returns {Object} - Implicit asset data
   */
  generateImplicitAsset(overrides = {}) {
    return this.generateAsset({
      grantTypes: ['implicit'],
      responseTypes: ['token', 'id_token'],
      ...overrides
    });
  }

  /**
   * Generate SAML2 asset data
   * @param {Object} overrides - Override default values
   * @returns {Object} - SAML2 asset data
   */
  generateSAML2Asset(overrides = {}) {
    return {
      name: overrides.name || `SAML_${this.randomString(8)}`,
      type: 'saml2',
      entityId: overrides.entityId || `urn:example:${uuidv4()}`,
      acsUrl: overrides.acsUrl || 'https://example.com/saml/acs',
      sloUrl: overrides.sloUrl || 'https://example.com/saml/slo',
      certificate: overrides.certificate || this.generateMockCertificate(),
      status: overrides.status || 'active',
      ...overrides
    };
  }

  /**
   * Generate mock certificate
   * @returns {string} - Mock certificate string
   */
  generateMockCertificate() {
    return `-----BEGIN CERTIFICATE-----\n${this.randomString(64)}\n-----END CERTIFICATE-----`;
  }

  /**
   * Generate search query
   * @param {string} term - Search term
   * @returns {string} - Search query
   */
  generateSearchQuery(term = null) {
    return term || this.randomString(5);
  }

  /**
   * Generate pagination parameters
   * @param {Object} overrides - Override default values
   * @returns {Object} - Pagination parameters
   */
  generatePaginationParams(overrides = {}) {
    return {
      page: overrides.page || 1,
      pageSize: overrides.pageSize || 10,
      ...overrides
    };
  }

  /**
   * Generate CSV export parameters
   * @param {Object} overrides - Override default values
   * @returns {Object} - CSV export parameters
   */
  generateCSVExportParams(overrides = {}) {
    return {
      format: 'csv',
      fields: overrides.fields || ['id', 'name', 'status', 'createdAt'],
      filters: overrides.filters || {},
      ...overrides
    };
  }

  /**
   * Generate bulk user data
   * @param {number} count - Number of users to generate
   * @returns {Array} - Array of user data
   */
  generateBulkUsers(count = 10) {
    return Array.from({ length: count }, () => this.generateUser());
  }

  /**
   * Generate bulk group data
   * @param {number} count - Number of groups to generate
   * @returns {Array} - Array of group data
   */
  generateBulkGroups(count = 5) {
    return Array.from({ length: count }, () => this.generateGroup());
  }

  /**
   * Generate role data
   * @param {string} role - Role name
   * @returns {Object} - Role data
   */
  generateRole(role = 'user') {
    const roles = {
      user: {
        name: 'user',
        permissions: ['read'],
        description: 'Standard user role'
      },
      owner: {
        name: 'owner',
        permissions: ['read', 'write', 'delete', 'manage'],
        description: 'Owner role with full permissions'
      },
      admin: {
        name: 'admin',
        permissions: ['read', 'write', 'delete', 'manage', 'admin'],
        description: 'Administrator role'
      }
    };

    return roles[role] || roles.user;
  }
}

module.exports = new DataGenerator();
