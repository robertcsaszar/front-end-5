/**
 * Group Service
 * Handles all group-related operations
 */

const BaseService = require('./base-service');
const { commonFields } = require('../helpers/graphql/query-builder');
const logger = require('../helpers/utils/logger');
const assertionHelper = require('../helpers/utils/assertion-helper');

class GroupService extends BaseService {
  constructor(accessToken = null) {
    super('Group', commonFields.group, accessToken);
  }

  /**
   * Get group members
   * @param {string} groupId - Group ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Group members
   */
  async getMembers(groupId, params = {}) {
    const query = `
      query($groupId: ID!, $page: Int, $pageSize: Int) {
        groupMembers(groupId: $groupId, page: $page, pageSize: $pageSize) {
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

    logger.info('Fetching members for group:', groupId);
    const response = await this.client.querySuccess(query, { groupId, ...params });
    return response.data.groupMembers;
  }

  /**
   * Add members to group
   * @param {string} groupId - Group ID
   * @param {Array} userIds - Array of user IDs
   * @returns {Promise<Object>} - Result
   */
  async addMembers(groupId, userIds) {
    const mutation = `
      mutation($groupId: ID!, $userIds: [ID!]!) {
        addGroupMembers(groupId: $groupId, userIds: $userIds) {
          success
          count
          message
        }
      }
    `;

    logger.info(`Adding ${userIds.length} members to group ${groupId}`);
    const response = await this.client.mutateSuccess(mutation, { groupId, userIds });
    return response.data.addGroupMembers;
  }

  /**
   * Remove members from group
   * @param {string} groupId - Group ID
   * @param {Array} userIds - Array of user IDs
   * @returns {Promise<Object>} - Result
   */
  async removeMembers(groupId, userIds) {
    const mutation = `
      mutation($groupId: ID!, $userIds: [ID!]!) {
        removeGroupMembers(groupId: $groupId, userIds: $userIds) {
          success
          count
          message
        }
      }
    `;

    logger.info(`Removing ${userIds.length} members from group ${groupId}`);
    const response = await this.client.mutateSuccess(mutation, { groupId, userIds });
    return response.data.removeGroupMembers;
  }

  /**
   * Assign group to tenant
   * @param {string} groupId - Group ID
   * @param {string} tenantId - Tenant ID
   * @returns {Promise<Object>} - Result
   */
  async assignToTenant(groupId, tenantId) {
    const mutation = `
      mutation($groupId: ID!, $tenantId: ID!) {
        assignGroupToTenant(groupId: $groupId, tenantId: $tenantId) {
          success
          message
          group {
            id
            name
            tenants {
              id
              name
            }
          }
        }
      }
    `;

    logger.info(`Assigning group ${groupId} to tenant ${tenantId}`);
    const response = await this.client.mutateSuccess(mutation, { groupId, tenantId });
    return response.data.assignGroupToTenant;
  }

  /**
   * Remove group from tenant
   * @param {string} groupId - Group ID
   * @param {string} tenantId - Tenant ID
   * @returns {Promise<Object>} - Result
   */
  async removeFromTenant(groupId, tenantId) {
    const mutation = `
      mutation($groupId: ID!, $tenantId: ID!) {
        removeGroupFromTenant(groupId: $groupId, tenantId: $tenantId) {
          success
          message
        }
      }
    `;

    logger.info(`Removing group ${groupId} from tenant ${tenantId}`);
    const response = await this.client.mutateSuccess(mutation, { groupId, tenantId });
    return response.data.removeGroupFromTenant;
  }

  /**
   * Get group tenants
   * @param {string} groupId - Group ID
   * @returns {Promise<Array>} - Group's tenants
   */
  async getGroupTenants(groupId) {
    const query = `
      query($groupId: ID!) {
        group(id: $groupId) {
          id
          tenants {
            id
            name
            domain
            status
          }
        }
      }
    `;

    logger.info('Fetching tenants for group:', groupId);
    const response = await this.client.querySuccess(query, { groupId });
    return response.data.group.tenants;
  }

  /**
   * Assert group structure
   * @param {Object} group - Group object
   */
  assertStructure(group) {
    assertionHelper.assertGroupStructure(group);
  }

  /**
   * Get member count
   * @param {string} groupId - Group ID
   * @returns {Promise<number>} - Member count
   */
  async getMemberCount(groupId) {
    const query = `
      query($groupId: ID!) {
        group(id: $groupId) {
          id
          memberCount
        }
      }
    `;

    logger.info('Fetching member count for group:', groupId);
    const response = await this.client.querySuccess(query, { groupId });
    return response.data.group.memberCount;
  }
}

module.exports = GroupService;
