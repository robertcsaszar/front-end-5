/**
 * User-Group Integration Test
 * Tests the complete flow of user and group interactions
 */

const UserService = require('../../services/user-service');
const GroupService = require('../../services/group-service');
const authHelper = require('../../helpers/auth/auth-helper');
const dataGenerator = require('../../helpers/utils/data-generator');
const logger = require('../../helpers/utils/logger');

describe('User-Group Integration', () => {
  let userService;
  let groupService;
  let accessToken;
  let createdUsers = [];
  let createdGroups = [];

  beforeAll(async () => {
    logger.info('Setting up User-Group integration tests');
    accessToken = await authHelper.getOrCreateToken();
    userService = new UserService(accessToken);
    groupService = new GroupService(accessToken);
  });

  afterAll(async () => {
    logger.info('Cleaning up User-Group integration tests');
    
    if (createdGroups.length > 0) {
      try {
        await groupService.bulkDelete(createdGroups.map(g => g.id));
      } catch (error) {
        logger.warn('Failed to cleanup groups:', error.message);
      }
    }

    if (createdUsers.length > 0) {
      try {
        await userService.bulkDelete(createdUsers.map(u => u.id));
      } catch (error) {
        logger.warn('Failed to cleanup users:', error.message);
      }
    }
  });

  test('Complete user-group workflow', async () => {
    // Step 1: Create multiple users
    logger.info('Step 1: Creating users');
    const usersData = dataGenerator.generateBulkUsers(3);
    const users = await userService.bulkCreate(usersData);
    
    expect(users).toHaveLength(3);
    users.forEach(user => {
      userService.assertStructure(user);
      createdUsers.push(user);
    });

    // Step 2: Create a group
    logger.info('Step 2: Creating group');
    const groupData = dataGenerator.generateGroup({
      name: `IntegrationTestGroup_${Date.now()}`
    });
    const group = await groupService.create(groupData);
    
    groupService.assertStructure(group);
    createdGroups.push(group);

    // Step 3: Add users to group
    logger.info('Step 3: Adding users to group');
    const userIds = users.map(u => u.id);
    const addResult = await groupService.addMembers(group.id, userIds);
    
    expect(addResult.success).toBe(true);
    expect(addResult.count).toBe(3);

    // Step 4: Verify group membership
    logger.info('Step 4: Verifying group membership');
    const members = await groupService.getMembers(group.id, { page: 1, pageSize: 10 });
    
    expect(members.items).toHaveLength(3);
    userIds.forEach(userId => {
      const found = members.items.some(member => member.id === userId);
      expect(found).toBe(true);
    });

    // Step 5: Update user roles
    logger.info('Step 5: Updating user roles');
    const updatedUser = await userService.updateRoles(users[0].id, ['user', 'owner']);
    
    expect(updatedUser.roles).toContain('user');
    expect(updatedUser.roles).toContain('owner');

    // Step 6: Search for users
    logger.info('Step 6: Searching users');
    const searchTerm = usersData[0].email.substring(0, 10);
    const searchResults = await userService.search(searchTerm, { page: 1, pageSize: 10 });
    
    expect(searchResults.items).toBeDefined();

    // Step 7: Remove one user from group
    logger.info('Step 7: Removing user from group');
    const removeResult = await groupService.removeMembers(group.id, [users[0].id]);
    
    expect(removeResult.success).toBe(true);

    // Step 8: Verify updated membership
    logger.info('Step 8: Verifying updated membership');
    const updatedMembers = await groupService.getMembers(group.id, { page: 1, pageSize: 10 });
    
    expect(updatedMembers.items).toHaveLength(2);
    const stillInGroup = updatedMembers.items.some(member => member.id === users[0].id);
    expect(stillInGroup).toBe(false);

    // Step 9: Get member count
    logger.info('Step 9: Getting member count');
    const memberCount = await groupService.getMemberCount(group.id);
    
    expect(memberCount).toBe(2);

    // Step 10: Export users to CSV
    logger.info('Step 10: Exporting users to CSV');
    const csvExport = await userService.exportToCSV({
      fields: ['id', 'email', 'firstName', 'lastName', 'status']
    });
    
    expect(csvExport.content).toBeDefined();
    expect(csvExport.filename).toMatch(/\.csv$/);

    logger.info('Integration test completed successfully');
  });

  test('Should handle user assignment across multiple groups', async () => {
    // Create one user
    const userData = dataGenerator.generateUser();
    const user = await userService.create(userData);
    createdUsers.push(user);

    // Create multiple groups
    const groupsData = dataGenerator.generateBulkGroups(3);
    const groups = await groupService.bulkCreate(groupsData);
    createdGroups.push(...groups);

    // Add user to all groups
    for (const group of groups) {
      await groupService.addMembers(group.id, [user.id]);
    }

    // Verify user is in all groups
    for (const group of groups) {
      const members = await groupService.getMembers(group.id);
      const found = members.items.some(member => member.id === user.id);
      expect(found).toBe(true);
    }

    // Remove user from first group only
    await groupService.removeMembers(groups[0].id, [user.id]);

    // Verify removal
    const firstGroupMembers = await groupService.getMembers(groups[0].id);
    const stillInFirst = firstGroupMembers.items.some(member => member.id === user.id);
    expect(stillInFirst).toBe(false);

    // Verify still in other groups
    const secondGroupMembers = await groupService.getMembers(groups[1].id);
    const inSecond = secondGroupMembers.items.some(member => member.id === user.id);
    expect(inSecond).toBe(true);
  });

  test('Should handle concurrent operations', async () => {
    // Create resources
    const user = await userService.create(dataGenerator.generateUser());
    const group = await groupService.create(dataGenerator.generateGroup());
    createdUsers.push(user);
    createdGroups.push(group);

    // Perform concurrent operations
    const operations = [
      userService.getById(user.id),
      groupService.getById(group.id),
      userService.getAll({ page: 1, pageSize: 5 }),
      groupService.getAll({ page: 1, pageSize: 5 })
    ];

    const results = await Promise.all(operations);

    // Verify all operations succeeded
    expect(results[0].id).toBe(user.id);
    expect(results[1].id).toBe(group.id);
    expect(results[2].items).toBeDefined();
    expect(results[3].items).toBeDefined();
  });
});
