/**
 * User Service
 * Handles all user-related operations
 */

const BaseService = require('./base-service');
const { commonFields } = require('../helpers/graphql/query-builder');
const logger = require('../helpers/utils/logger');
const assertionHelper = require('../helpers/utils/assertion-helper');

class UserService extends BaseService {
  constructor(accessToken = null) {
    super('User', commonFields.user, accessToken);
  }

  /**
   * Resend activation email
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Result
   */
  async resendActivationEmail(userId) {
    const mutation = `
      mutation($userId: ID!) {
        resendActivationEmail(userId: $userId) {
          success
          message
        }
      }
    `;

    logger.info('Resending activation email for user:', userId);
    const response = await this.client.mutateSuccess(mutation, { userId });
    return response.data.resendActivationEmail;
  }

  /**
   * Reset user password
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Result
   */
  async resetPassword(userId) {
    const mutation = `
      mutation($userId: ID!) {
        resetUserPassword(userId: $userId) {
          success
          message
          temporaryPassword
        }
      }
    `;

    logger.info('Resetting password for user:', userId);
    const response = await this.client.mutateSuccess(mutation, { userId });
    return response.data.resetUserPassword;
  }

  /**
   * Assign user to group
   * @param {string} userId - User ID
   * @param {string} groupId - Group ID
   * @returns {Promise<Object>} - Result
   */
  async assignToGroup(userId, groupId) {
    const mutation = `
      mutation($userId: ID!, $groupId: ID!) {
        assignUserToGroup(userId: $userId, groupId: $groupId) {
          success
          message
          user {
            id
            email
            groups {
              id
              name
            }
          }
        }
      }
    `;

    logger.info(`Assigning user ${userId} to group ${groupId}`);
    const response = await this.client.mutateSuccess(mutation, { userId, groupId });
    return response.data.assignUserToGroup;
  }

  /**
   * Remove user from group
   * @param {string} userId - User ID
   * @param {string} groupId - Group ID
   * @returns {Promise<Object>} - Result
   */
  async removeFromGroup(userId, groupId) {
    const mutation = `
      mutation($userId: ID!, $groupId: ID!) {
        removeUserFromGroup(userId: $userId, groupId: $groupId) {
          success
          message
        }
      }
    `;

    logger.info(`Removing user ${userId} from group ${groupId}`);
    const response = await this.client.mutateSuccess(mutation, { userId, groupId });
    return response.data.removeUserFromGroup;
  }

  /**
   * Update user roles
   * @param {string} userId - User ID
   * @param {Array} roles - Array of role names
   * @returns {Promise<Object>} - Updated user
   */
  async updateRoles(userId, roles) {
    const mutation = `
      mutation($userId: ID!, $roles: [String!]!) {
        updateUserRoles(userId: $userId, roles: $roles) {
          id
          email
          roles
        }
      }
    `;

    logger.info(`Updating roles for user ${userId}:`, roles);
    const response = await this.client.mutateSuccess(mutation, { userId, roles });
    return response.data.updateUserRoles;
  }

  /**
   * Get users by role
   * @param {string} role - Role name
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Users with specified role
   */
  async getByRole(role, params = {}) {
    const query = `
      query($role: String!, $page: Int, $pageSize: Int) {
        usersByRole(role: $role, page: $page, pageSize: $pageSize) {
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

    logger.info('Fetching users by role:', role);
    const response = await this.client.querySuccess(query, { role, ...params });
    return response.data.usersByRole;
  }

  /**
   * Get user groups
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - User's groups
   */
  async getUserGroups(userId) {
    const query = `
      query($userId: ID!) {
        user(id: $userId) {
          id
          groups {
            id
            name
            description
            status
          }
        }
      }
    `;

    logger.info('Fetching groups for user:', userId);
    const response = await this.client.querySuccess(query, { userId });
    return response.data.user.groups;
  }

  /**
   * Assert user structure
   * @param {Object} user - User object
   */
  assertStructure(user) {
    assertionHelper.assertUserStructure(user);
  }

  /**
   * Assert user has specific role
   * @param {Object} user - User object
   * @param {string|Array} expectedRoles - Expected role(s)
   */
  assertHasRole(user, expectedRoles) {
    assertionHelper.assertUserHasRole(user, expectedRoles);
  }

  /**
   * Bulk activate users
   * @param {Array} userIds - Array of user IDs
   * @returns {Promise<Object>} - Result
   */
  async bulkActivate(userIds) {
    const mutation = `
      mutation($userIds: [ID!]!) {
        bulkActivateUsers(userIds: $userIds) {
          success
          count
          message
        }
      }
    `;

    logger.info(`Bulk activating ${userIds.length} users`);
    const response = await this.client.mutateSuccess(mutation, { userIds });
    return response.data.bulkActivateUsers;
  }

  /**
   * Bulk deactivate users
   * @param {Array} userIds - Array of user IDs
   * @returns {Promise<Object>} - Result
   */
  async bulkDeactivate(userIds) {
    const mutation = `
      mutation($userIds: [ID!]!) {
        bulkDeactivateUsers(userIds: $userIds) {
          success
          count
          message
        }
      }
    `;

    logger.info(`Bulk deactivating ${userIds.length} users`);
    const response = await this.client.mutateSuccess(mutation, { userIds });
    return response.data.bulkDeactivateUsers;
  }
}

module.exports = UserService;
