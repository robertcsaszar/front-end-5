/**
 * Asset Service
 * Handles all asset-related operations (OAuth2 clients, SAML2, etc.)
 */

const BaseService = require('./base-service');
const { commonFields } = require('../helpers/graphql/query-builder');
const logger = require('../helpers/utils/logger');
const assertionHelper = require('../helpers/utils/assertion-helper');

class AssetService extends BaseService {
  constructor(accessToken = null) {
    super('Asset', commonFields.asset, accessToken);
  }

  /**
   * Get assets by type
   * @param {string} type - Asset type (pkce, implicit, auth_code, saml2)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Assets of specified type
   */
  async getByType(type, params = {}) {
    const query = `
      query($type: String!, $page: Int, $pageSize: Int) {
        assetsByType(type: $type, page: $page, pageSize: $pageSize) {
          items {
            ${this.defaultFields.join('\n')}
          }
          pagination {
            total
            page
            pageSize
            hasMore
          }
        }
      }
    `;

    logger.info('Fetching assets by type:', type);
    const response = await this.client.querySuccess(query, { type, ...params });
    return response.data.assetsByType;
  }

  /**
   * Regenerate client secret
   * @param {string} assetId - Asset ID
   * @returns {Promise<Object>} - Updated asset with new secret
   */
  async regenerateSecret(assetId) {
    const mutation = `
      mutation($assetId: ID!) {
        regenerateAssetSecret(assetId: $assetId) {
          id
          clientId
          clientSecret
          message
        }
      }
    `;

    logger.info('Regenerating secret for asset:', assetId);
    const response = await this.client.mutateSuccess(mutation, { assetId });
    return response.data.regenerateAssetSecret;
  }

  /**
   * Update grant types
   * @param {string} assetId - Asset ID
   * @param {Array} grantTypes - Array of grant type names
   * @returns {Promise<Object>} - Updated asset
   */
  async updateGrantTypes(assetId, grantTypes) {
    const mutation = `
      mutation($assetId: ID!, $grantTypes: [String!]!) {
        updateAssetGrantTypes(assetId: $assetId, grantTypes: $grantTypes) {
          id
          name
          grantTypes
          responseTypes
        }
      }
    `;

    logger.info(`Updating grant types for asset ${assetId}`);
    const response = await this.client.mutateSuccess(mutation, { assetId, grantTypes });
    return response.data.updateAssetGrantTypes;
  }

  /**
   * Update redirect URIs
   * @param {string} assetId - Asset ID
   * @param {Array} redirectUris - Array of redirect URIs
   * @returns {Promise<Object>} - Updated asset
   */
  async updateRedirectUris(assetId, redirectUris) {
    const mutation = `
      mutation($assetId: ID!, $redirectUris: [String!]!) {
        updateAssetRedirectUris(assetId: $assetId, redirectUris: $redirectUris) {
          id
          name
          redirectUris
        }
      }
    `;

    logger.info(`Updating redirect URIs for asset ${assetId}`);
    const response = await this.client.mutateSuccess(mutation, { assetId, redirectUris });
    return response.data.updateAssetRedirectUris;
  }

  /**
   * Enable PKCE for asset
   * @param {string} assetId - Asset ID
   * @returns {Promise<Object>} - Updated asset
   */
  async enablePKCE(assetId) {
    const mutation = `
      mutation($assetId: ID!) {
        enableAssetPKCE(assetId: $assetId) {
          id
          name
          requirePKCE
          grantTypes
        }
      }
    `;

    logger.info('Enabling PKCE for asset:', assetId);
    const response = await this.client.mutateSuccess(mutation, { assetId });
    return response.data.enableAssetPKCE;
  }

  /**
   * Disable PKCE for asset
   * @param {string} assetId - Asset ID
   * @returns {Promise<Object>} - Updated asset
   */
  async disablePKCE(assetId) {
    const mutation = `
      mutation($assetId: ID!) {
        disableAssetPKCE(assetId: $assetId) {
          id
          name
          requirePKCE
        }
      }
    `;

    logger.info('Disabling PKCE for asset:', assetId);
    const response = await this.client.mutateSuccess(mutation, { assetId });
    return response.data.disableAssetPKCE;
  }

  /**
   * Get asset statistics
   * @param {string} assetId - Asset ID
   * @returns {Promise<Object>} - Asset statistics
   */
  async getStatistics(assetId) {
    const query = `
      query($assetId: ID!) {
        assetStatistics(assetId: $assetId) {
          totalAuthorizations
          activeTokens
          lastUsed
          errorRate
        }
      }
    `;

    logger.info('Fetching statistics for asset:', assetId);
    const response = await this.client.querySuccess(query, { assetId });
    return response.data.assetStatistics;
  }

  /**
   * Create PKCE asset
   * @param {Object} input - Asset input data
   * @returns {Promise<Object>} - Created asset
   */
  async createPKCEAsset(input) {
    const assetInput = {
      ...input,
      grantTypes: ['authorization_code', 'refresh_token'],
      responseTypes: ['code'],
      requirePKCE: true
    };

    logger.info('Creating PKCE asset');
    return this.create(assetInput);
  }

  /**
   * Create Implicit flow asset
   * @param {Object} input - Asset input data
   * @returns {Promise<Object>} - Created asset
   */
  async createImplicitAsset(input) {
    const assetInput = {
      ...input,
      grantTypes: ['implicit'],
      responseTypes: ['token', 'id_token']
    };

    logger.info('Creating Implicit flow asset');
    return this.create(assetInput);
  }

  /**
   * Create SAML2 asset
   * @param {Object} input - Asset input data
   * @returns {Promise<Object>} - Created asset
   */
  async createSAML2Asset(input) {
    const assetInput = {
      ...input,
      type: 'saml2'
    };

    logger.info('Creating SAML2 asset');
    return this.create(assetInput);
  }

  /**
   * Assert asset structure
   * @param {Object} asset - Asset object
   */
  assertStructure(asset) {
    assertionHelper.assertAssetStructure(asset);
  }

  /**
   * Validate PKCE asset configuration
   * @param {Object} asset - Asset object
   */
  assertPKCEConfiguration(asset) {
    this.assertStructure(asset);
    expect(asset.requirePKCE).toBe(true);
    expect(asset.grantTypes).toContain('authorization_code');
    expect(asset.responseTypes).toContain('code');
  }
}

module.exports = AssetService;
