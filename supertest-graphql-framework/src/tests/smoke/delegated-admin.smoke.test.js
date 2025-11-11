/**
 * Delegated Admin Smoke Tests
 * Basic smoke tests for delegated administration functionality
 */

const DelegatedAdminService = require('../../services/delegated-admin-service');
const UserService = require('../../services/user-service');
const authHelper = require('../../helpers/auth/auth-helper');
const dataGenerator = require('../../helpers/utils/data-generator');
const logger = require('../../helpers/utils/logger');

describe('Delegated Admin - Smoke Tests', () => {
  let delegatedAdminService;
  let userService;
  let accessToken;
  let createdUsers = [];
  let createdDelegations = [];

  beforeAll(async () => {
    logger.info('Setting up Delegated Admin smoke tests');
    accessToken = await authHelper.getOrCreateToken();
    delegatedAdminService = new DelegatedAdminService(accessToken);
    userService = new UserService(accessToken);
  });

  afterAll(async () => {
    logger.info('Cleaning up Delegated Admin smoke tests');
    
    // Cleanup delegations
    if (createdDelegations.length > 0) {
      try {
        for (const delegation of createdDelegations) {
          await delegatedAdminService.revokeDelegation(delegation.id);
        }
      } catch (error) {
        logger.warn('Failed to cleanup delegations:', error.message);
      }
    }

    // Cleanup users
    if (createdUsers.length > 0) {
      try {
        await userService.bulkDelete(createdUsers.map(u => u.id));
      } catch (error) {
        logger.warn('Failed to cleanup users:', error.message);
      }
    }
  });

  describe('Delegation Operations', () => {
    test('Should delegate permissions to admin user', async () => {
      // Create admin and target users
      const adminUser = await userService.create(dataGenerator.generateUser());
      const targetUser = await userService.create(dataGenerator.generateUser());
      createdUsers.push(adminUser, targetUser);

      const delegationData = {
        adminUserId: adminUser.id,
        targetUserId: targetUser.id,
        permissions: ['read', 'write', 'manage'],
        scope: 'user_management',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      const delegation = await delegatedAdminService.delegatePermissions(delegationData);

      expect(delegation).toBeDefined();
      expect(delegation).toHaveProperty('id');
      expect(delegation.adminUserId).toBe(adminUser.id);
      expect(delegation.targetUserId).toBe(targetUser.id);
      expect(delegation.permissions).toEqual(expect.arrayContaining(['read', 'write', 'manage']));

      createdDelegations.push(delegation);
    });

    test('Should get delegated admins list', async () => {
      const result = await delegatedAdminService.getDelegatedAdmins({
        page: 1,
        pageSize: 10
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.items)).toBe(true);
    });

    test('Should get user delegations', async () => {
      const adminUser = await userService.create(dataGenerator.generateUser());
      const targetUser = await userService.create(dataGenerator.generateUser());
      createdUsers.push(adminUser, targetUser);

      const delegationData = {
        adminUserId: adminUser.id,
        targetUserId: targetUser.id,
        permissions: ['read'],
        scope: 'reports'
      };

      const delegation = await delegatedAdminService.delegatePermissions(delegationData);
      createdDelegations.push(delegation);

      const delegations = await delegatedAdminService.getUserDelegations(adminUser.id);

      expect(delegations).toBeDefined();
      expect(Array.isArray(delegations)).toBe(true);
      expect(delegations.length).toBeGreaterThan(0);
    });

    test('Should update delegation permissions', async () => {
      const adminUser = await userService.create(dataGenerator.generateUser());
      const targetUser = await userService.create(dataGenerator.generateUser());
      createdUsers.push(adminUser, targetUser);

      const delegationData = {
        adminUserId: adminUser.id,
        targetUserId: targetUser.id,
        permissions: ['read'],
        scope: 'user_management'
      };

      const delegation = await delegatedAdminService.delegatePermissions(delegationData);
      createdDelegations.push(delegation);

      const newPermissions = ['read', 'write'];
      const updated = await delegatedAdminService.updateDelegationPermissions(
        delegation.id,
        newPermissions
      );

      expect(updated).toBeDefined();
      expect(updated.permissions).toEqual(expect.arrayContaining(newPermissions));
    });

    test('Should revoke delegation', async () => {
      const adminUser = await userService.create(dataGenerator.generateUser());
      const targetUser = await userService.create(dataGenerator.generateUser());
      createdUsers.push(adminUser, targetUser);

      const delegationData = {
        adminUserId: adminUser.id,
        targetUserId: targetUser.id,
        permissions: ['read'],
        scope: 'user_management'
      };

      const delegation = await delegatedAdminService.delegatePermissions(delegationData);

      const result = await delegatedAdminService.revokeDelegation(delegation.id);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);

      // Remove from cleanup list
      createdDelegations = createdDelegations.filter(d => d.id !== delegation.id);
    });
  });

  describe('Permission Validation', () => {
    test('Should validate delegation permissions', async () => {
      const adminUser = await userService.create(dataGenerator.generateUser());
      const targetUser = await userService.create(dataGenerator.generateUser());
      createdUsers.push(adminUser, targetUser);

      const delegationData = {
        adminUserId: adminUser.id,
        targetUserId: targetUser.id,
        permissions: ['read', 'write'],
        scope: 'user_management'
      };

      const delegation = await delegatedAdminService.delegatePermissions(delegationData);
      createdDelegations.push(delegation);

      const validation = await delegatedAdminService.validatePermissions(
        delegation.id,
        'user_read'
      );

      expect(validation).toBeDefined();
      expect(validation).toHaveProperty('allowed');
      expect(typeof validation.allowed).toBe('boolean');
    });
  });

  describe('Delegation History', () => {
    test('Should get delegation history', async () => {
      const result = await delegatedAdminService.getDelegationHistory({
        page: 1,
        pageSize: 10
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.items)).toBe(true);
    });

    test('Should get delegation history for specific user', async () => {
      const adminUser = await userService.create(dataGenerator.generateUser());
      createdUsers.push(adminUser);

      const result = await delegatedAdminService.getDelegationHistory({
        userId: adminUser.id,
        page: 1,
        pageSize: 10
      });

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
    });
  });

  describe('Filtered Queries', () => {
    test('Should get active delegated admins', async () => {
      const result = await delegatedAdminService.getDelegatedAdmins({
        status: 'active',
        page: 1,
        pageSize: 10
      });

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      
      if (result.items.length > 0) {
        result.items.forEach(item => {
          expect(item.status).toBe('active');
        });
      }
    });
  });
});
