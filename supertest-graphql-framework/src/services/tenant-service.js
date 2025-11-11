/**
 * Tenant Service
 * Handles all tenant-related operations
 */

const BaseService = require('./base-service');
const { commonFields } = require('../helpers/graphql/query-builder');
const logger = require('../helpers/utils/logger');
const assertionHelper = require('../helpers/utils/assertion-helper');

class TenantService extends BaseService {
  constructor(accessToken = null) {
    super('Tenant', commonFields.tenant, accessToken);
  }

  /**
   * Get tenant groups
   * @param {string} tenantId - Tenant ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Tenant groups
   */
  async getGroups(tenantId, params = {}) {
    const query = `
      query($tenantId: ID!, $page: Int, $pageSize: Int) {
        tenantGroups(tenantId: $tenantId, page: $page, pageSize: $pageSize) {
          items {
            id
            name
            description
            status
            memberCount
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

    logger.info('Fetching groups for tenant:', tenantId);
    const response = await this.client.querySuccess(query, { tenantId, ...params });
    return response.data.tenantGroups;
  }

  /**
   * Get tenant users
   * @param {string} tenantId - Tenant ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Tenant users
   */
  async getUsers(tenantId, params = {}) {
    const query = `
      query($tenantId: ID!, $page: Int, $pageSize: Int) {
        tenantUsers(tenantId: $tenantId, page: $page, pageSize: $pageSize) {
          items {
            id
            email
            firstName
            lastName
            status
            roles
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

    logger.info('Fetching users for tenant:', tenantId);
    const response = await this.client.querySuccess(query, { tenantId, ...params });
    return response.data.tenantUsers;
  }

  /**
   * Update tenant settings
   * @param {string} tenantId - Tenant ID
   * @param {Object} settings - Settings object
   * @returns {Promise<Object>} - Updated tenant
   */
  async updateSettings(tenantId, settings) {
    const mutation = `
      mutation($tenantId: ID!, $settings: JSON!) {
        updateTenantSettings(tenantId: $tenantId, settings: $settings) {
          id
          name
          domain
          status
          settings
        }
      }
    `;

    logger.info(`Updating settings for tenant ${tenantId}`);
    const response = await this.client.mutateSuccess(mutation, { tenantId, settings });
    return response.data.updateTenantSettings;
  }

  /**
   * Enable tenant
   * @param {string} tenantId - Tenant ID
   * @returns {Promise<Object>} - Updated tenant
   */
  async enable(tenantId) {
    const mutation = `
      mutation($tenantId: ID!) {
        enableTenant(tenantId: $tenantId) {
          id
          name
          status
        }
      }
    `;

    logger.info('Enabling tenant:', tenantId);
    const response = await this.client.mutateSuccess(mutation, { tenantId });
    return response.data.enableTenant;
  }

  /**
   * Disable tenant
   * @param {string} tenantId - Tenant ID
   * @returns {Promise<Object>} - Updated tenant
   */
  async disable(tenantId) {
    const mutation = `
      mutation($tenantId: ID!) {
        disableTenant(tenantId: $tenantId) {
          id
          name
          status
        }
      }
    `;

    logger.info('Disabling tenant:', tenantId);
    const response = await this.client.mutateSuccess(mutation, { tenantId });
    return response.data.disableTenant;
  }

  /**
   * Get tenant statistics
   * @param {string} tenantId - Tenant ID
   * @returns {Promise<Object>} - Tenant statistics
   */
  async getStatistics(tenantId) {
    const query = `
      query($tenantId: ID!) {
        tenantStatistics(tenantId: $tenantId) {
          userCount
          groupCount
          activeUserCount
          inactiveUserCount
          assetCount
        }
      }
    `;

    logger.info('Fetching statistics for tenant:', tenantId);
    const response = await this.client.querySuccess(query, { tenantId });
    return response.data.tenantStatistics;
  }

  /**
   * Assert tenant structure
   * @param {Object} tenant - Tenant object
   */
  assertStructure(tenant) {
    assertionHelper.assertTenantStructure(tenant);
  }
}

module.exports = TenantService;
