# Usage Examples

## Complete Test Examples

### Example 1: User CRUD Operations

```javascript
const UserService = require('../../services/user-service');
const authHelper = require('../../helpers/auth/auth-helper');
const dataGenerator = require('../../helpers/utils/data-generator');

describe('User CRUD Operations', () => {
  let userService;
  let accessToken;
  let testUser;

  beforeAll(async () => {
    // Get authenticated access token
    accessToken = await authHelper.getOrCreateToken();
    userService = new UserService(accessToken);
  });

  afterAll(async () => {
    // Cleanup
    if (testUser) {
      await userService.delete(testUser.id);
    }
  });

  test('Complete user lifecycle', async () => {
    // 1. Create user
    const userData = dataGenerator.generateUser({
      email: 'lifecycle@example.com',
      roles: ['user']
    });

    testUser = await userService.create(userData);
    expect(testUser).toBeDefined();
    expect(testUser.email).toBe(userData.email);

    // 2. Read user
    const fetchedUser = await userService.getById(testUser.id);
    expect(fetchedUser.id).toBe(testUser.id);

    // 3. Update user
    const updatedUser = await userService.update(testUser.id, {
      firstName: 'UpdatedName'
    });
    expect(updatedUser.firstName).toBe('UpdatedName');

    // 4. Add role
    const userWithRole = await userService.updateRoles(testUser.id, ['user', 'owner']);
    expect(userWithRole.roles).toContain('owner');

    // 5. Verify in list
    const allUsers = await userService.getAll({ page: 1, pageSize: 100 });
    const foundInList = allUsers.items.some(u => u.id === testUser.id);
    expect(foundInList).toBe(true);

    // 6. Delete user
    const deleteResult = await userService.delete(testUser.id);
    expect(deleteResult.success).toBe(true);
    
    testUser = null; // Prevent double delete in cleanup
  });
});
```

### Example 2: Group and User Assignment

```javascript
const GroupService = require('../../services/group-service');
const UserService = require('../../services/user-service');
const authHelper = require('../../helpers/auth/auth-helper');
const dataGenerator = require('../../helpers/utils/data-generator');

describe('Group-User Assignment', () => {
  let groupService;
  let userService;
  let accessToken;
  let testGroup;
  let testUsers = [];

  beforeAll(async () => {
    accessToken = await authHelper.getOrCreateToken();
    groupService = new GroupService(accessToken);
    userService = new UserService(accessToken);
  });

  afterAll(async () => {
    if (testGroup) {
      await groupService.delete(testGroup.id);
    }
    if (testUsers.length > 0) {
      await userService.bulkDelete(testUsers.map(u => u.id));
    }
  });

  test('Should manage group membership', async () => {
    // 1. Create a group
    testGroup = await groupService.create(dataGenerator.generateGroup({
      name: 'TestGroup_Members'
    }));

    // 2. Create multiple users
    const userData = dataGenerator.generateBulkUsers(5);
    testUsers = await userService.bulkCreate(userData);
    
    // 3. Add users to group
    const addResult = await groupService.addMembers(
      testGroup.id,
      testUsers.map(u => u.id)
    );
    expect(addResult.success).toBe(true);
    expect(addResult.count).toBe(5);

    // 4. Verify members
    const members = await groupService.getMembers(testGroup.id, {
      page: 1,
      pageSize: 10
    });
    expect(members.items.length).toBe(5);

    // 5. Check member count
    const count = await groupService.getMemberCount(testGroup.id);
    expect(count).toBe(5);

    // 6. Remove some members
    const removeResult = await groupService.removeMembers(
      testGroup.id,
      [testUsers[0].id, testUsers[1].id]
    );
    expect(removeResult.success).toBe(true);

    // 7. Verify updated count
    const newCount = await groupService.getMemberCount(testGroup.id);
    expect(newCount).toBe(3);
  });
});
```

### Example 3: Tenant, Group, and User Hierarchy

```javascript
const TenantService = require('../../services/tenant-service');
const GroupService = require('../../services/group-service');
const UserService = require('../../services/user-service');
const authHelper = require('../../helpers/auth/auth-helper');
const dataGenerator = require('../../helpers/utils/data-generator');

describe('Tenant Hierarchy', () => {
  let tenantService;
  let groupService;
  let userService;
  let accessToken;
  let testTenant;
  let testGroup;
  let testUser;

  beforeAll(async () => {
    accessToken = await authHelper.getOrCreateToken();
    tenantService = new TenantService(accessToken);
    groupService = new GroupService(accessToken);
    userService = new UserService(accessToken);
  });

  afterAll(async () => {
    if (testTenant) await tenantService.delete(testTenant.id);
    if (testGroup) await groupService.delete(testGroup.id);
    if (testUser) await userService.delete(testUser.id);
  });

  test('Should create complete tenant hierarchy', async () => {
    // 1. Create tenant
    testTenant = await tenantService.create(dataGenerator.generateTenant({
      name: 'TestCorp',
      domain: 'testcorp.example.com'
    }));

    // 2. Create group
    testGroup = await groupService.create(dataGenerator.generateGroup({
      name: 'TestCorp_Admins'
    }));

    // 3. Assign group to tenant
    const assignResult = await groupService.assignToTenant(
      testGroup.id,
      testTenant.id
    );
    expect(assignResult.success).toBe(true);

    // 4. Create user
    testUser = await userService.create(dataGenerator.generateUser({
      email: 'admin@testcorp.example.com',
      roles: ['user', 'owner']
    }));

    // 5. Add user to group
    await groupService.addMembers(testGroup.id, [testUser.id]);

    // 6. Verify tenant has group
    const tenantGroups = await tenantService.getGroups(testTenant.id);
    expect(tenantGroups.items).toBeDefined();
    expect(tenantGroups.items.some(g => g.id === testGroup.id)).toBe(true);

    // 7. Verify user in group
    const groupMembers = await groupService.getMembers(testGroup.id);
    expect(groupMembers.items.some(u => u.id === testUser.id)).toBe(true);

    // 8. Get tenant statistics
    const stats = await tenantService.getStatistics(testTenant.id);
    expect(stats.groupCount).toBeGreaterThanOrEqual(1);
    expect(stats.userCount).toBeGreaterThanOrEqual(1);
  });
});
```

### Example 4: OAuth2 Asset Creation and Configuration

```javascript
const AssetService = require('../../services/asset-service');
const authHelper = require('../../helpers/auth/auth-helper');
const dataGenerator = require('../../helpers/utils/data-generator');

describe('OAuth2 Asset Management', () => {
  let assetService;
  let accessToken;
  let pkceAsset;
  let implicitAsset;
  let samlAsset;

  beforeAll(async () => {
    accessToken = await authHelper.getOrCreateToken();
    assetService = new AssetService(accessToken);
  });

  afterAll(async () => {
    const assets = [pkceAsset, implicitAsset, samlAsset].filter(a => a);
    if (assets.length > 0) {
      await assetService.bulkDelete(assets.map(a => a.id));
    }
  });

  test('Should create and configure different asset types', async () => {
    // 1. Create PKCE asset
    pkceAsset = await assetService.createPKCEAsset(
      dataGenerator.generatePKCEAsset({
        name: 'Mobile App',
        redirectUris: ['myapp://callback']
      })
    );
    
    assetService.assertPKCEConfiguration(pkceAsset);
    expect(pkceAsset.requirePKCE).toBe(true);

    // 2. Create Implicit flow asset
    implicitAsset = await assetService.createImplicitAsset(
      dataGenerator.generateImplicitAsset({
        name: 'Legacy SPA',
        redirectUris: ['http://localhost:3000/callback']
      })
    );
    
    expect(implicitAsset.grantTypes).toContain('implicit');
    expect(implicitAsset.responseTypes).toContain('token');

    // 3. Create SAML2 asset
    samlAsset = await assetService.createSAML2Asset(
      dataGenerator.generateSAML2Asset({
        name: 'Enterprise SSO',
        entityId: 'urn:enterprise:testapp'
      })
    );
    
    expect(samlAsset.type).toBe('saml2');
    expect(samlAsset.entityId).toBeDefined();

    // 4. Update PKCE asset configuration
    const updated = await assetService.updateRedirectUris(pkceAsset.id, [
      'myapp://callback',
      'myapp://oauth/callback'
    ]);
    expect(updated.redirectUris.length).toBe(2);

    // 5. Regenerate secret
    const regenerated = await assetService.regenerateSecret(pkceAsset.id);
    expect(regenerated.clientSecret).toBeDefined();
    expect(regenerated.clientSecret).not.toBe(pkceAsset.clientSecret);

    // 6. Get statistics
    const stats = await assetService.getStatistics(pkceAsset.id);
    expect(stats).toHaveProperty('totalAuthorizations');
    expect(stats).toHaveProperty('activeTokens');
  });

  test('Should manage asset types', async () => {
    // Get all PKCE assets
    const pkceAssets = await assetService.getByType('pkce', {
      page: 1,
      pageSize: 10
    });
    expect(pkceAssets.items).toBeDefined();

    // Toggle PKCE requirement
    const asset = await assetService.create(dataGenerator.generateAsset());
    
    await assetService.enablePKCE(asset.id);
    let updated = await assetService.getById(asset.id);
    expect(updated.requirePKCE).toBe(true);

    await assetService.disablePKCE(asset.id);
    updated = await assetService.getById(asset.id);
    expect(updated.requirePKCE).toBe(false);

    await assetService.delete(asset.id);
  });
});
```

### Example 5: Report Generation and Export

```javascript
const ReportService = require('../../services/report-service');
const authHelper = require('../../helpers/auth/auth-helper');
const assertionHelper = require('../../helpers/utils/assertion-helper');

describe('Report Generation', () => {
  let reportService;
  let accessToken;

  beforeAll(async () => {
    accessToken = await authHelper.getOrCreateToken();
    reportService = new ReportService(accessToken);
  });

  test('Should generate and export reports', async () => {
    const dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const dateTo = new Date().toISOString();

    // 1. Generate user activity report
    const userReport = await reportService.getUserActivityReport({
      dateFrom,
      dateTo
    });
    
    expect(userReport).toBeDefined();
    expect(userReport.type).toBe('user_activity');
    expect(userReport.data).toBeDefined();

    // 2. Export report to CSV
    const csvExport = await reportService.exportReportToCSV(userReport.id);
    
    assertionHelper.assertCSVContent(csvExport.content, {
      minRows: 0 // May be empty in test environment
    });
    expect(csvExport.format).toBe('csv');
    expect(csvExport.filename).toContain('.csv');

    // 3. Generate login report
    const loginReport = await reportService.getLoginReport({
      dateFrom,
      dateTo
    });
    
    expect(loginReport.type).toBe('login_activity');

    // 4. Schedule recurring report
    const scheduled = await reportService.scheduleReport({
      reportType: 'user_activity',
      schedule: 'weekly',
      recipients: ['admin@example.com'],
      parameters: {
        dateRange: 'last_7_days',
        includeInactive: false
      }
    });
    
    expect(scheduled).toBeDefined();
    expect(scheduled.schedule).toBe('weekly');
    expect(scheduled.status).toBeDefined();

    // 5. Get report history
    const history = await reportService.getReportHistory({
      reportType: 'user_activity',
      page: 1,
      pageSize: 10
    });
    
    expect(history.items).toBeDefined();
    assertionHelper.assertPaginationStructure(history);
  });

  test('Should get all available reports', async () => {
    const reports = await reportService.getAvailableReports();
    
    expect(Array.isArray(reports)).toBe(true);
    
    if (reports.length > 0) {
      const report = reports[0];
      expect(report).toHaveProperty('id');
      expect(report).toHaveProperty('name');
      expect(report).toHaveProperty('description');
      expect(report).toHaveProperty('category');
    }
  });
});
```

### Example 6: Delegated Administration

```javascript
const DelegatedAdminService = require('../../services/delegated-admin-service');
const UserService = require('../../services/user-service');
const authHelper = require('../../helpers/auth/auth-helper');
const dataGenerator = require('../../helpers/utils/data-generator');

describe('Delegated Administration', () => {
  let delegatedAdminService;
  let userService;
  let accessToken;
  let adminUser;
  let targetUser;
  let delegation;

  beforeAll(async () => {
    accessToken = await authHelper.getOrCreateToken();
    delegatedAdminService = new DelegatedAdminService(accessToken);
    userService = new UserService(accessToken);
  });

  afterAll(async () => {
    if (delegation) {
      await delegatedAdminService.revokeDelegation(delegation.id);
    }
    const users = [adminUser, targetUser].filter(u => u);
    if (users.length > 0) {
      await userService.bulkDelete(users.map(u => u.id));
    }
  });

  test('Complete delegation workflow', async () => {
    // 1. Create admin user
    adminUser = await userService.create(dataGenerator.generateUser({
      email: 'delegator@example.com',
      roles: ['admin']
    }));

    // 2. Create target user
    targetUser = await userService.create(dataGenerator.generateUser({
      email: 'delegate@example.com',
      roles: ['user']
    }));

    // 3. Delegate permissions
    delegation = await delegatedAdminService.delegatePermissions({
      adminUserId: adminUser.id,
      targetUserId: targetUser.id,
      permissions: ['read', 'write', 'manage'],
      scope: 'user_management',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });

    expect(delegation).toBeDefined();
    expect(delegation.adminUserId).toBe(adminUser.id);
    expect(delegation.permissions).toContain('read');
    expect(delegation.permissions).toContain('write');

    // 4. Validate permissions
    const validation = await delegatedAdminService.validatePermissions(
      delegation.id,
      'user_read'
    );
    
    expect(validation.allowed).toBeDefined();

    // 5. Update permissions
    const updated = await delegatedAdminService.updateDelegationPermissions(
      delegation.id,
      ['read', 'write'] // Remove 'manage'
    );
    
    expect(updated.permissions).toHaveLength(2);
    expect(updated.permissions).not.toContain('manage');

    // 6. Get user's delegations
    const userDelegations = await delegatedAdminService.getUserDelegations(adminUser.id);
    
    expect(userDelegations).toBeDefined();
    expect(userDelegations.some(d => d.id === delegation.id)).toBe(true);

    // 7. Get delegation history
    const history = await delegatedAdminService.getDelegationHistory({
      userId: adminUser.id,
      page: 1,
      pageSize: 10
    });
    
    expect(history.items).toBeDefined();

    // 8. Revoke delegation
    const revoked = await delegatedAdminService.revokeDelegation(delegation.id);
    
    expect(revoked.success).toBe(true);
    delegation = null;
  });
});
```

### Example 7: CSV Export Validation

```javascript
const UserService = require('../../services/user-service');
const authHelper = require('../../helpers/auth/auth-helper');
const dataGenerator = require('../../helpers/utils/data-generator');
const assertionHelper = require('../../helpers/utils/assertion-helper');
const { parse } = require('csv-parse/sync');

describe('CSV Export', () => {
  let userService;
  let accessToken;
  let testUsers = [];

  beforeAll(async () => {
    accessToken = await authHelper.getOrCreateToken();
    userService = new UserService(accessToken);

    // Create test users for export
    const usersData = dataGenerator.generateBulkUsers(5);
    testUsers = await userService.bulkCreate(usersData);
  });

  afterAll(async () => {
    if (testUsers.length > 0) {
      await userService.bulkDelete(testUsers.map(u => u.id));
    }
  });

  test('Should export users to CSV and validate content', async () => {
    // 1. Export users
    const exportResult = await userService.exportToCSV({
      fields: ['id', 'email', 'firstName', 'lastName', 'status', 'createdAt']
    });

    // 2. Basic validation
    expect(exportResult).toBeDefined();
    expect(exportResult.content).toBeDefined();
    expect(exportResult.filename).toMatch(/\.csv$/);
    
    // 3. Validate CSV structure
    assertionHelper.assertCSVContent(exportResult.content, {
      expectedHeaders: ['id', 'email', 'firstName', 'lastName', 'status'],
      minRows: 5
    });

    // 4. Parse and validate content
    const records = parse(exportResult.content, {
      columns: true,
      skip_empty_lines: true
    });

    expect(records.length).toBeGreaterThanOrEqual(5);

    // 5. Verify test users in export
    testUsers.forEach(user => {
      const found = records.some(record => record.email === user.email);
      expect(found).toBe(true);
    });

    // 6. Validate data types and formats
    records.slice(0, 1).forEach(record => {
      expect(record.id).toBeDefined();
      expect(record.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect(['active', 'inactive', 'pending']).toContain(record.status);
    });
  });

  test('Should export with filters', async () => {
    const exportResult = await userService.exportToCSV({
      fields: ['id', 'email', 'status'],
      filters: {
        status: 'active'
      }
    });

    const records = parse(exportResult.content, {
      columns: true,
      skip_empty_lines: true
    });

    records.forEach(record => {
      expect(record.status).toBe('active');
    });
  });
});
```

### Example 8: Search Functionality

```javascript
const UserService = require('../../services/user-service');
const GroupService = require('../../services/group-service');
const authHelper = require('../../helpers/auth/auth-helper');
const dataGenerator = require('../../helpers/utils/data-generator');
const assertionHelper = require('../../helpers/utils/assertion-helper');

describe('Search Functionality', () => {
  let userService;
  let groupService;
  let accessToken;
  let testData = [];

  beforeAll(async () => {
    accessToken = await authHelper.getOrCreateToken();
    userService = new UserService(accessToken);
    groupService = new GroupService(accessToken);

    // Create searchable test data
    const searchableUser = await userService.create(dataGenerator.generateUser({
      email: 'searchable_unique_test@example.com',
      firstName: 'SearchableFirst',
      lastName: 'SearchableLast'
    }));

    const searchableGroup = await groupService.create(dataGenerator.generateGroup({
      name: 'Searchable_Unique_Group_Test',
      description: 'Test group for search'
    }));

    testData.push(
      { type: 'user', id: searchableUser.id },
      { type: 'group', id: searchableGroup.id }
    );
  });

  afterAll(async () => {
    for (const item of testData) {
      try {
        if (item.type === 'user') {
          await userService.delete(item.id);
        } else if (item.type === 'group') {
          await groupService.delete(item.id);
        }
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  test('Should search users by email', async () => {
    const searchTerm = 'searchable_unique';
    
    const result = await userService.search(searchTerm, {
      page: 1,
      pageSize: 10
    });

    expect(result).toBeDefined();
    expect(result.items).toBeDefined();
    
    assertionHelper.assertPaginationStructure(result);
    assertionHelper.assertSearchResults(result.items, searchTerm, 'email');
  });

  test('Should search groups by name', async () => {
    const searchTerm = 'Searchable_Unique';
    
    const result = await groupService.search(searchTerm, {
      page: 1,
      pageSize: 10
    });

    expect(result).toBeDefined();
    expect(result.items).toBeDefined();
    
    const foundGroup = result.items.find(g => 
      g.name.includes('Searchable_Unique_Group_Test')
    );
    expect(foundGroup).toBeDefined();
  });

  test('Should handle pagination in search', async () => {
    // Search with small page size
    const page1 = await userService.search('test', {
      page: 1,
      pageSize: 2
    });

    expect(page1.pagination.page).toBe(1);
    expect(page1.pagination.pageSize).toBe(2);
    
    if (page1.pagination.hasMore) {
      const page2 = await userService.search('test', {
        page: 2,
        pageSize: 2
      });

      expect(page2.pagination.page).toBe(2);
      
      // Ensure different results
      const page1Ids = page1.items.map(u => u.id);
      const page2Ids = page2.items.map(u => u.id);
      const overlap = page1Ids.filter(id => page2Ids.includes(id));
      expect(overlap.length).toBe(0);
    }
  });

  test('Should return empty results for non-existent search', async () => {
    const searchTerm = 'nonexistent_xyz_123456789';
    
    const result = await userService.search(searchTerm, {
      page: 1,
      pageSize: 10
    });

    expect(result.items).toBeDefined();
    expect(result.items.length).toBe(0);
    expect(result.pagination.total).toBe(0);
  });
});
```

## Tips and Tricks

### Reusing Test Data

```javascript
let sharedTestData;

beforeAll(async () => {
  sharedTestData = {
    user: await userService.create(dataGenerator.generateUser()),
    group: await groupService.create(dataGenerator.generateGroup())
  };
});

// Use in multiple tests
test('test 1', async () => {
  const user = sharedTestData.user;
  // ...
});

test('test 2', async () => {
  const user = sharedTestData.user;
  // ...
});
```

### Custom Matchers

```javascript
// In jest.setup.js or test file
expect.extend({
  toHaveValidEmail(received) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    
    return {
      pass,
      message: () => pass 
        ? `expected ${received} not to be a valid email`
        : `expected ${received} to be a valid email`
    };
  }
});

// Usage
test('user has valid email', async () => {
  const user = await userService.create(userData);
  expect(user.email).toHaveValidEmail();
});
```

### Performance Testing

```javascript
test('bulk operation performance', async () => {
  const startTime = Date.now();
  
  const usersData = dataGenerator.generateBulkUsers(100);
  const users = await userService.bulkCreate(usersData);
  
  const duration = Date.now() - startTime;
  
  expect(users.length).toBe(100);
  expect(duration).toBeLessThan(30000); // 30 seconds
  
  await userService.bulkDelete(users.map(u => u.id));
});
```
