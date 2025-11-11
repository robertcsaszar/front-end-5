/**
 * Users Smoke Tests
 * Basic smoke tests for user-related functionality
 */

const UserService = require('../../services/user-service');
const authHelper = require('../../helpers/auth/auth-helper');
const dataGenerator = require('../../helpers/utils/data-generator');
const logger = require('../../helpers/utils/logger');

describe('Users - Smoke Tests', () => {
  let userService;
  let accessToken;
  let createdUsers = [];

  beforeAll(async () => {
    logger.info('Setting up Users smoke tests');
    // Get access token
    accessToken = await authHelper.getOrCreateToken();
    userService = new UserService(accessToken);
  });

  afterAll(async () => {
    logger.info('Cleaning up Users smoke tests');
    // Cleanup created users
    if (createdUsers.length > 0) {
      try {
        await userService.bulkDelete(createdUsers.map(u => u.id));
      } catch (error) {
        logger.warn('Failed to cleanup users:', error.message);
      }
    }
  });

  describe('CRUD Operations', () => {
    test('Should create a new user', async () => {
      const userData = dataGenerator.generateUser();

      const user = await userService.create(userData);

      expect(user).toBeDefined();
      userService.assertStructure(user);
      expect(user.email).toBe(userData.email);
      expect(user.firstName).toBe(userData.firstName);
      expect(user.status).toBe('active');

      createdUsers.push(user);
    });

    test('Should retrieve user by ID', async () => {
      const userData = dataGenerator.generateUser();
      const createdUser = await userService.create(userData);
      createdUsers.push(createdUser);

      const user = await userService.getById(createdUser.id);

      expect(user).toBeDefined();
      expect(user.id).toBe(createdUser.id);
      expect(user.email).toBe(userData.email);
    });

    test('Should list all users with pagination', async () => {
      const result = await userService.getAll({ page: 1, pageSize: 10 });

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.total).toBeGreaterThanOrEqual(0);
    });

    test('Should update user information', async () => {
      const userData = dataGenerator.generateUser();
      const createdUser = await userService.create(userData);
      createdUsers.push(createdUser);

      const updateData = {
        firstName: 'UpdatedFirstName',
        lastName: 'UpdatedLastName'
      };

      const updatedUser = await userService.update(createdUser.id, updateData);

      expect(updatedUser).toBeDefined();
      expect(updatedUser.id).toBe(createdUser.id);
      expect(updatedUser.firstName).toBe(updateData.firstName);
      expect(updatedUser.lastName).toBe(updateData.lastName);
    });

    test('Should delete a user', async () => {
      const userData = dataGenerator.generateUser();
      const createdUser = await userService.create(userData);

      const result = await userService.delete(createdUser.id);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);

      // Remove from cleanup list
      createdUsers = createdUsers.filter(u => u.id !== createdUser.id);
    });
  });

  describe('Search Functionality', () => {
    test('Should search users by email', async () => {
      const userData = dataGenerator.generateUser({
        email: `searchtest_${Date.now()}@example.com`
      });
      const createdUser = await userService.create(userData);
      createdUsers.push(createdUser);

      const searchTerm = userData.email.substring(0, 10);
      const result = await userService.search(searchTerm, { page: 1, pageSize: 10 });

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
    });
  });

  describe('Role Management', () => {
    test('Should update user roles', async () => {
      const userData = dataGenerator.generateUser({ roles: ['user'] });
      const createdUser = await userService.create(userData);
      createdUsers.push(createdUser);

      const updatedUser = await userService.updateRoles(createdUser.id, ['user', 'owner']);

      expect(updatedUser).toBeDefined();
      expect(updatedUser.roles).toContain('user');
      expect(updatedUser.roles).toContain('owner');
    });

    test('Should get users by role', async () => {
      const result = await userService.getByRole('user', { page: 1, pageSize: 10 });

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
    });
  });

  describe('User Actions', () => {
    test('Should resend activation email', async () => {
      const userData = dataGenerator.generateUser();
      const createdUser = await userService.create(userData);
      createdUsers.push(createdUser);

      const result = await userService.resendActivationEmail(createdUser.id);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
    });

    test('Should reset user password', async () => {
      const userData = dataGenerator.generateUser();
      const createdUser = await userService.create(userData);
      createdUsers.push(createdUser);

      const result = await userService.resetPassword(createdUser.id);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.temporaryPassword).toBeDefined();
    });
  });

  describe('CSV Export', () => {
    test('Should export users to CSV', async () => {
      const result = await userService.exportToCSV({
        fields: ['id', 'email', 'firstName', 'lastName', 'status']
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.filename).toBeDefined();
      expect(typeof result.content).toBe('string');
    });
  });

  describe('Bulk Operations', () => {
    test('Should bulk create users', async () => {
      const usersData = dataGenerator.generateBulkUsers(3);

      const users = await userService.bulkCreate(usersData);

      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBe(3);

      users.forEach(user => {
        userService.assertStructure(user);
        createdUsers.push(user);
      });
    });

    test('Should bulk delete users', async () => {
      const usersData = dataGenerator.generateBulkUsers(2);
      const users = await userService.bulkCreate(usersData);

      const userIds = users.map(u => u.id);
      const results = await userService.bulkDelete(userIds);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });
  });
});
