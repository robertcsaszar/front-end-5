/**
 * Delegated Admin Service
 * Handles delegated administration operations
 */

const GraphQLClient = require('../helpers/graphql/graphql-client');
const logger = require('../helpers/utils/logger');

class DelegatedAdminService {
  constructor(accessToken = null) {
    this.client = new GraphQLClient(accessToken);
  }

  /**
   * Set access token
   * @param {string} token - Access token
   */
  setAccessToken(token) {
    this.client.setAccessToken(token);
  }

  /**
   * Delegate admin permissions
   * @param {Object} delegationData - Delegation configuration
   * @returns {Promise<Object>} - Delegation result
   */
  async delegatePermissions(delegationData) {
    const mutation = `
      mutation($input: DelegatePermissionsInput!) {
        delegatePermissions(input: $input) {
          id
          adminUserId
          targetUserId
          permissions
          scope
          expiresAt
          status
        }
      }
    `;

    logger.info('Delegating permissions');
    const response = await this.client.mutateSuccess(mutation, { input: delegationData });
    return response.data.delegatePermissions;
  }

  /**
   * Revoke delegation
   * @param {string} delegationId - Delegation ID
   * @returns {Promise<Object>} - Revocation result
   */
  async revokeDelegation(delegationId) {
    const mutation = `
      mutation($delegationId: ID!) {
        revokeDelegation(delegationId: $delegationId) {
          success
          message
        }
      }
    `;

    logger.info('Revoking delegation:', delegationId);
    const response = await this.client.mutateSuccess(mutation, { delegationId });
    return response.data.revokeDelegation;
  }

  /**
   * Get delegated admins
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Delegated admins
   */
  async getDelegatedAdmins(params = {}) {
    const query = `
      query($page: Int, $pageSize: Int, $status: String) {
        delegatedAdmins(page: $page, pageSize: $pageSize, status: $status) {
          items {
            id
            adminUserId
            adminUser {
              id
              email
              firstName
              lastName
            }
            targetUserId
            targetUser {
              id
              email
              firstName
              lastName
            }
            permissions
            scope
            expiresAt
            status
            createdAt
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

    logger.info('Fetching delegated admins');
    const response = await this.client.querySuccess(query, params);
    return response.data.delegatedAdmins;
  }

  /**
   * Get user's delegations
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - User's delegations
   */
  async getUserDelegations(userId) {
    const query = `
      query($userId: ID!) {
        userDelegations(userId: $userId) {
          id
          adminUserId
          targetUserId
          permissions
          scope
          expiresAt
          status
        }
      }
    `;

    logger.info('Fetching delegations for user:', userId);
    const response = await this.client.querySuccess(query, { userId });
    return response.data.userDelegations;
  }

  /**
   * Update delegation permissions
   * @param {string} delegationId - Delegation ID
   * @param {Array} permissions - New permissions
   * @returns {Promise<Object>} - Updated delegation
   */
  async updateDelegationPermissions(delegationId, permissions) {
    const mutation = `
      mutation($delegationId: ID!, $permissions: [String!]!) {
        updateDelegationPermissions(delegationId: $delegationId, permissions: $permissions) {
          id
          permissions
          updatedAt
        }
      }
    `;

    logger.info('Updating delegation permissions:', delegationId);
    const response = await this.client.mutateSuccess(mutation, { delegationId, permissions });
    return response.data.updateDelegationPermissions;
  }

  /**
   * Get delegation history
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Delegation history
   */
  async getDelegationHistory(params = {}) {
    const query = `
      query($userId: ID, $page: Int, $pageSize: Int) {
        delegationHistory(userId: $userId, page: $page, pageSize: $pageSize) {
          items {
            id
            action
            delegationId
            performedBy
            performedAt
            details
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

    logger.info('Fetching delegation history');
    const response = await this.client.querySuccess(query, params);
    return response.data.delegationHistory;
  }

  /**
   * Validate delegation permissions
   * @param {string} delegationId - Delegation ID
   * @param {string} action - Action to validate
   * @returns {Promise<Object>} - Validation result
   */
  async validatePermissions(delegationId, action) {
    const query = `
      query($delegationId: ID!, $action: String!) {
        validateDelegationPermissions(delegationId: $delegationId, action: $action) {
          allowed
          reason
          missingPermissions
        }
      }
    `;

    logger.info('Validating delegation permissions');
    const response = await this.client.querySuccess(query, { delegationId, action });
    return response.data.validateDelegationPermissions;
  }
}

module.exports = DelegatedAdminService;
