/**
 * Groups Smoke Tests
 * Basic smoke tests for group-related functionality
 */

const GroupService = require('../../services/group-service');
const UserService = require('../../services/user-service');
const authHelper = require('../../helpers/auth/auth-helper');
const dataGenerator = require('../../helpers/utils/data-generator');
const logger = require('../../helpers/utils/logger');

describe('Groups - Smoke Tests', () => {
  let groupService;
  let userService;
  let accessToken;
  let createdGroups = [];
  let createdUsers = [];

  beforeAll(async () => {
    logger.info('Setting up Groups smoke tests');
    accessToken = await authHelper.getOrCreateToken();
    groupService = new GroupService(accessToken);
    userService = new UserService(accessToken);
  });

  afterAll(async () => {
    logger.info('Cleaning up Groups smoke tests');
    
    // Cleanup created groups
    if (createdGroups.length > 0) {
      try {
        await groupService.bulkDelete(createdGroups.map(g => g.id));
      } catch (error) {
        logger.warn('Failed to cleanup groups:', error.message);
      }
    }

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
    test('Should create a new group', async () => {
      const groupData = dataGenerator.generateGroup();

      const group = await groupService.create(groupData);

      expect(group).toBeDefined();
      groupService.assertStructure(group);
      expect(group.name).toBe(groupData.name);
      expect(group.status).toBe('active');

      createdGroups.push(group);
    });

    test('Should retrieve group by ID', async () => {
      const groupData = dataGenerator.generateGroup();
      const createdGroup = await groupService.create(groupData);
      createdGroups.push(createdGroup);

      const group = await groupService.getById(createdGroup.id);

      expect(group).toBeDefined();
      expect(group.id).toBe(createdGroup.id);
      expect(group.name).toBe(groupData.name);
    });

    test('Should list all groups with pagination', async () => {
      const result = await groupService.getAll({ page: 1, pageSize: 10 });

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.pagination).toBeDefined();
    });

    test('Should update group information', async () => {
      const groupData = dataGenerator.generateGroup();
      const createdGroup = await groupService.create(groupData);
      createdGroups.push(createdGroup);

      const updateData = {
        name: `Updated_${groupData.name}`,
        description: 'Updated description'
      };

      const updatedGroup = await groupService.update(createdGroup.id, updateData);

      expect(updatedGroup).toBeDefined();
      expect(updatedGroup.id).toBe(createdGroup.id);
      expect(updatedGroup.name).toBe(updateData.name);
    });

    test('Should delete a group', async () => {
      const groupData = dataGenerator.generateGroup();
      const createdGroup = await groupService.create(groupData);

      const result = await groupService.delete(createdGroup.id);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('Search Functionality', () => {
    test('Should search groups by name', async () => {
      const groupData = dataGenerator.generateGroup({
        name: `SearchTest_${Date.now()}`
      });
      const createdGroup = await groupService.create(groupData);
      createdGroups.push(createdGroup);

      const searchTerm = groupData.name.substring(0, 10);
      const result = await groupService.search(searchTerm, { page: 1, pageSize: 10 });

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
    });
  });

  describe('Member Management', () => {
    test('Should add members to group', async () => {
      const groupData = dataGenerator.generateGroup();
      const createdGroup = await groupService.create(groupData);
      createdGroups.push(createdGroup);

      const userData = dataGenerator.generateUser();
      const createdUser = await userService.create(userData);
      createdUsers.push(createdUser);

      const result = await groupService.addMembers(createdGroup.id, [createdUser.id]);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.count).toBe(1);
    });

    test('Should get group members', async () => {
      const groupData = dataGenerator.generateGroup();
      const createdGroup = await groupService.create(groupData);
      createdGroups.push(createdGroup);

      const userData = dataGenerator.generateUser();
      const createdUser = await userService.create(userData);
      createdUsers.push(createdUser);

      await groupService.addMembers(createdGroup.id, [createdUser.id]);

      const result = await groupService.getMembers(createdGroup.id, { page: 1, pageSize: 10 });

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.items.length).toBeGreaterThan(0);
    });

    test('Should remove members from group', async () => {
      const groupData = dataGenerator.generateGroup();
      const createdGroup = await groupService.create(groupData);
      createdGroups.push(createdGroup);

      const userData = dataGenerator.generateUser();
      const createdUser = await userService.create(userData);
      createdUsers.push(createdUser);

      await groupService.addMembers(createdGroup.id, [createdUser.id]);

      const result = await groupService.removeMembers(createdGroup.id, [createdUser.id]);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    test('Should get member count', async () => {
      const groupData = dataGenerator.generateGroup();
      const createdGroup = await groupService.create(groupData);
      createdGroups.push(createdGroup);

      const count = await groupService.getMemberCount(createdGroup.id);

      expect(count).toBeDefined();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('CSV Export', () => {
    test('Should export groups to CSV', async () => {
      const result = await groupService.exportToCSV({
        fields: ['id', 'name', 'description', 'status', 'memberCount']
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.filename).toBeDefined();
    });
  });

  describe('Bulk Operations', () => {
    test('Should bulk create groups', async () => {
      const groupsData = dataGenerator.generateBulkGroups(3);

      const groups = await groupService.bulkCreate(groupsData);

      expect(groups).toBeDefined();
      expect(Array.isArray(groups)).toBe(true);
      expect(groups.length).toBe(3);

      groups.forEach(group => {
        groupService.assertStructure(group);
        createdGroups.push(group);
      });
    });
  });
});
