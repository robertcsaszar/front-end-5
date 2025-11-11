# SuperTest GraphQL Framework

A modular, production-ready testing framework for GraphQL APIs with full support for OAuth2/OIDC authentication flows including PKCE, IDP integration, and well-known endpoints.

## 🚀 Features

- **Modular Architecture**: Service-based design with reusable components
- **Parallel Test Execution**: Run tests concurrently for faster feedback
- **Zero Code Duplication**: DRY principles with base classes and helpers
- **GraphQL Native**: Built specifically for GraphQL API testing
- **Complete Auth Support**: PKCE, Authorization Code, Implicit, Password, SAML2
- **IDP Integration**: Fetch endpoints from well-known configuration
- **Comprehensive Helpers**: Data generation, assertions, retry logic, logging
- **Easy Test Creation**: Simple service-based API for writing tests
- **Rich Reporting**: HTML, Allure, JUnit, and coverage reports
- **CSV Export Testing**: Built-in support for CSV export validation
- **Well Documented**: Extensive documentation and examples

## 📋 Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Authentication](#authentication)
- [Writing Tests](#writing-tests)
- [Running Tests](#running-tests)
- [Services](#services)
- [Helpers](#helpers)
- [Best Practices](#best-practices)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## 🔧 Installation

1. **Clone or copy the framework to your project**

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

```bash
cp .env.example .env
# Edit .env with your configuration
```

## 🚀 Quick Start

### 1. Configure Your Environment

Edit `.env` file with your API and IDP settings:

```env
API_BASE_URL=https://api.example.com
IDP_BASE_URL=https://idp.example.com
IDP_CLIENT_ID=your-client-id
TEST_USER_EMAIL=testuser@example.com
TEST_USER_PASSWORD=password123
```

### 2. Run Your First Test

```bash
# Run all smoke tests
npm run test:smoke

# Run specific test file
npm test -- users.smoke.test.js

# Run tests in parallel
npm run test:parallel
```

### 3. View Reports

```bash
# Open HTML report
open reports/test-report.html

# Generate Allure report
npm run report
```

## 📁 Project Structure

```
supertest-graphql-framework/
├── src/
│   ├── config/                    # Configuration files
│   │   ├── config.js             # Main configuration
│   │   ├── jest.setup.js         # Jest setup
│   │   ├── global.setup.js       # Global test setup
│   │   └── global.teardown.js    # Global test cleanup
│   │
│   ├── helpers/                   # Helper utilities
│   │   ├── auth/                 # Authentication helpers
│   │   │   ├── auth-helper.js    # Main auth logic
│   │   │   ├── pkce-helper.js    # PKCE implementation
│   │   │   └── well-known-helper.js # OIDC discovery
│   │   │
│   │   ├── graphql/              # GraphQL utilities
│   │   │   ├── graphql-client.js # GraphQL client
│   │   │   └── query-builder.js  # Query builder
│   │   │
│   │   └── utils/                # General utilities
│   │       ├── logger.js         # Logging utility
│   │       ├── retry.js          # Retry logic
│   │       ├── data-generator.js # Test data generator
│   │       └── assertion-helper.js # Assertion utilities
│   │
│   ├── services/                  # Service layer (Page Objects)
│   │   ├── base-service.js       # Base service class
│   │   ├── user-service.js       # User operations
│   │   ├── group-service.js      # Group operations
│   │   ├── tenant-service.js     # Tenant operations
│   │   ├── asset-service.js      # Asset operations
│   │   ├── report-service.js     # Report operations
│   │   └── delegated-admin-service.js # Delegated admin
│   │
│   └── tests/                     # Test files
│       ├── smoke/                # Smoke tests
│       ├── integration/          # Integration tests
│       └── e2e/                  # End-to-end tests
│
├── docs/                          # Documentation
├── logs/                          # Test logs
├── reports/                       # Test reports
├── .env.example                   # Environment template
├── package.json                   # Dependencies and scripts
└── README.md                      # This file
```

## ⚙️ Configuration

### Environment Variables

All configuration is managed through environment variables in `.env` file:

#### API Configuration
- `API_BASE_URL`: Base URL of your GraphQL API
- `GRAPHQL_ENDPOINT`: GraphQL endpoint path (default: `/graphql`)
- `API_TIMEOUT`: Request timeout in milliseconds (default: `30000`)

#### IDP Configuration
- `IDP_BASE_URL`: Identity provider base URL
- `IDP_REALM`: IDP realm/tenant
- `IDP_CLIENT_ID`: OAuth2 client ID
- `IDP_CLIENT_SECRET`: OAuth2 client secret (if required)
- `IDP_WELL_KNOWN_URL`: OIDC well-known configuration URL

#### Test Configuration
- `RUN_PARALLEL`: Enable parallel test execution (default: `true`)
- `MAX_WORKERS`: Number of parallel workers (default: `4`)
- `TEST_TIMEOUT`: Test timeout in milliseconds (default: `60000`)

See `.env.example` for complete configuration options.

## 🔐 Authentication

### PKCE Flow (Recommended)

The framework automatically handles PKCE authentication:

```javascript
const authHelper = require('./helpers/auth/auth-helper');

// Get access token with PKCE
const accessToken = await authHelper.getOrCreateToken({
  email: 'user@example.com',
  password: 'password123'
});
```

### Well-Known Discovery

Automatically fetch IDP endpoints:

```javascript
const wellKnownHelper = require('./helpers/auth/well-known-helper');

// Get all endpoints
const endpoints = await wellKnownHelper.getAllEndpoints();

// Get specific endpoint
const tokenEndpoint = await wellKnownHelper.getTokenEndpoint();
```

### Token Caching

Tokens are automatically cached to improve performance:

```javascript
// First call fetches token from IDP
const token1 = await authHelper.getOrCreateToken();

// Subsequent calls use cached token
const token2 = await authHelper.getOrCreateToken();

// Clear cache if needed
authHelper.clearTokenCache();
```

## ✍️ Writing Tests

### Using Services (Recommended)

Services provide a clean, reusable API for interacting with your GraphQL API:

```javascript
const UserService = require('../../services/user-service');
const authHelper = require('../../helpers/auth/auth-helper');
const dataGenerator = require('../../helpers/utils/data-generator');

describe('User Management', () => {
  let userService;
  let accessToken;

  beforeAll(async () => {
    accessToken = await authHelper.getOrCreateToken();
    userService = new UserService(accessToken);
  });

  test('Should create a new user', async () => {
    const userData = dataGenerator.generateUser();
    
    const user = await userService.create(userData);
    
    expect(user).toBeDefined();
    expect(user.email).toBe(userData.email);
    userService.assertStructure(user);
  });

  test('Should search users', async () => {
    const result = await userService.search('john', { page: 1, pageSize: 10 });
    
    expect(result.items).toBeDefined();
    expect(Array.isArray(result.items)).toBe(true);
  });
});
```

### Direct GraphQL Client

For custom queries:

```javascript
const GraphQLClient = require('../../helpers/graphql/graphql-client');

test('Custom GraphQL query', async () => {
  const client = new GraphQLClient(accessToken);
  
  const query = `
    query {
      customEndpoint {
        id
        name
      }
    }
  `;
  
  const response = await client.querySuccess(query);
  expect(response.data.customEndpoint).toBeDefined();
});
```

### Test Data Generation

Use the data generator for consistent test data:

```javascript
const dataGenerator = require('../../helpers/utils/data-generator');

// Generate user
const user = dataGenerator.generateUser({
  email: 'specific@example.com',
  roles: ['admin']
});

// Generate multiple users
const users = dataGenerator.generateBulkUsers(10);

// Generate group
const group = dataGenerator.generateGroup();

// Generate tenant
const tenant = dataGenerator.generateTenant();

// Generate PKCE asset
const asset = dataGenerator.generatePKCEAsset();
```

## 🏃 Running Tests

### Basic Commands

```bash
# Run all tests (sequential)
npm test

# Run tests in parallel (faster)
npm run test:parallel

# Run smoke tests only
npm run test:smoke

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Debug mode
npm run test:debug
```

### Run Specific Tests

```bash
# Run specific test file
npm test -- users.smoke.test.js

# Run tests matching pattern
npm test -- --testNamePattern="Should create"

# Run tests in specific folder
npm test -- tests/smoke/
```

### Parallel Execution

Tests are designed to run in parallel safely:

```bash
# Use 4 workers (default)
npm run test:parallel

# Use custom number of workers
jest --maxWorkers=8

# Run sequentially when needed
npm test -- --runInBand
```

## 🛠️ Services

### UserService

Handles all user operations:

```javascript
const userService = new UserService(accessToken);

// CRUD
await userService.create(userData);
await userService.getById(userId);
await userService.update(userId, updateData);
await userService.delete(userId);
await userService.getAll({ page: 1, pageSize: 10 });

// Search
await userService.search('query', { page: 1, pageSize: 10 });

// Roles
await userService.updateRoles(userId, ['user', 'admin']);
await userService.getByRole('admin');

// Actions
await userService.resendActivationEmail(userId);
await userService.resetPassword(userId);

// Groups
await userService.assignToGroup(userId, groupId);
await userService.removeFromGroup(userId, groupId);

// Bulk operations
await userService.bulkCreate([user1, user2, user3]);
await userService.bulkDelete([id1, id2, id3]);

// CSV Export
await userService.exportToCSV({ fields: ['id', 'email'] });
```

### GroupService

Handles group operations:

```javascript
const groupService = new GroupService(accessToken);

// CRUD operations
await groupService.create(groupData);
await groupService.getById(groupId);
await groupService.update(groupId, updateData);
await groupService.delete(groupId);

// Members
await groupService.getMembers(groupId);
await groupService.addMembers(groupId, [userId1, userId2]);
await groupService.removeMembers(groupId, [userId1]);
await groupService.getMemberCount(groupId);

// Tenants
await groupService.assignToTenant(groupId, tenantId);
await groupService.removeFromTenant(groupId, tenantId);
await groupService.getGroupTenants(groupId);
```

### TenantService

Handles tenant operations:

```javascript
const tenantService = new TenantService(accessToken);

// CRUD operations
await tenantService.create(tenantData);
await tenantService.getById(tenantId);
await tenantService.update(tenantId, updateData);
await tenantService.delete(tenantId);

// Settings
await tenantService.updateSettings(tenantId, settings);
await tenantService.enable(tenantId);
await tenantService.disable(tenantId);

// Related entities
await tenantService.getGroups(tenantId);
await tenantService.getUsers(tenantId);

// Statistics
await tenantService.getStatistics(tenantId);
```

### AssetService

Handles OAuth2/SAML2 assets:

```javascript
const assetService = new AssetService(accessToken);

// CRUD operations
await assetService.create(assetData);
await assetService.getById(assetId);
await assetService.update(assetId, updateData);
await assetService.delete(assetId);

// By type
await assetService.getByType('pkce');
await assetService.createPKCEAsset(data);
await assetService.createImplicitAsset(data);
await assetService.createSAML2Asset(data);

// Configuration
await assetService.regenerateSecret(assetId);
await assetService.updateGrantTypes(assetId, ['authorization_code']);
await assetService.updateRedirectUris(assetId, ['http://localhost:3000']);
await assetService.enablePKCE(assetId);
await assetService.disablePKCE(assetId);

// Statistics
await assetService.getStatistics(assetId);
```

### ReportService

Handles reporting:

```javascript
const reportService = new ReportService(accessToken);

// Available reports
await reportService.getAvailableReports();

// Generate reports
await reportService.getUserActivityReport({ dateFrom, dateTo });
await reportService.getLoginReport({ dateFrom, dateTo });
await reportService.getGroupMembershipReport();
await reportService.getAssetUsageReport({ dateFrom, dateTo });

// Export
await reportService.exportReportToCSV(reportId);

// Schedule
await reportService.scheduleReport(scheduleData);

// History
await reportService.getReportHistory({ page: 1, pageSize: 10 });
```

### DelegatedAdminService

Handles delegated administration:

```javascript
const delegatedAdminService = new DelegatedAdminService(accessToken);

// Delegate permissions
await delegatedAdminService.delegatePermissions({
  adminUserId,
  targetUserId,
  permissions: ['read', 'write'],
  scope: 'user_management'
});

// Manage delegations
await delegatedAdminService.getDelegatedAdmins();
await delegatedAdminService.getUserDelegations(userId);
await delegatedAdminService.updateDelegationPermissions(delegationId, permissions);
await delegatedAdminService.revokeDelegation(delegationId);

// Validation
await delegatedAdminService.validatePermissions(delegationId, action);

// History
await delegatedAdminService.getDelegationHistory();
```

## 🔧 Helpers

### Data Generator

```javascript
const dataGenerator = require('./helpers/utils/data-generator');

// Basic generators
dataGenerator.randomString(10);
dataGenerator.randomEmail('prefix');
dataGenerator.randomInt(1, 100);
dataGenerator.randomBoolean();
dataGenerator.randomFromArray(['a', 'b', 'c']);

// Entity generators
dataGenerator.generateUser();
dataGenerator.generateGroup();
dataGenerator.generateTenant();
dataGenerator.generateAsset();
dataGenerator.generatePKCEAsset();
dataGenerator.generateSAML2Asset();

// Bulk generators
dataGenerator.generateBulkUsers(10);
dataGenerator.generateBulkGroups(5);

// Other
dataGenerator.generateRole('admin');
dataGenerator.generatePaginationParams();
dataGenerator.generateCSVExportParams();
```

### Assertion Helper

```javascript
const assertionHelper = require('./helpers/utils/assertion-helper');

// GraphQL assertions
assertionHelper.assertGraphQLSuccess(response);
assertionHelper.assertGraphQLError(response, 'error message');

// Structure assertions
assertionHelper.assertHasRequiredFields(entity, ['id', 'name']);
assertionHelper.assertUserStructure(user);
assertionHelper.assertGroupStructure(group);
assertionHelper.assertTenantStructure(tenant);
assertionHelper.assertAssetStructure(asset);

// Pagination assertions
assertionHelper.assertPaginationStructure(response);

// Array assertions
assertionHelper.assertArrayContains(array, item => item.id === 'test');
assertionHelper.assertArrayNotContains(array, item => item.deleted);

// CSV assertions
assertionHelper.assertCSVContent(csvString, {
  expectedHeaders: ['id', 'name'],
  minRows: 1
});

// Other assertions
assertionHelper.assertStatusCode(200, 200);
assertionHelper.assertResponseTime(responseTime, 5000);
assertionHelper.assertSearchResults(results, 'query');
assertionHelper.assertUserHasRole(user, 'admin');
assertionHelper.assertEntityActive(entity);
assertionHelper.assertHasTimestamps(entity);
```

### Logger

```javascript
const logger = require('./helpers/utils/logger');

logger.error('Error message', { details: 'data' });
logger.warn('Warning message');
logger.info('Info message');
logger.debug('Debug message');
```

### Retry Logic

```javascript
const { retryRequest, pollUntil, sleep } = require('./helpers/utils/retry');

// Retry a request
await retryRequest(
  () => apiCall(),
  3,  // max retries
  1000  // delay ms
);

// Retry with condition
await retryWithCondition(
  () => apiCall(),
  (result) => result.status !== 'ready',
  3,
  1000
);

// Poll until condition
await pollUntil(
  () => checkStatus(),
  (result) => result.status === 'complete',
  { timeout: 30000, interval: 1000 }
);

// Sleep
await sleep(1000);
```

## 📊 Best Practices

### 1. Use Services for Consistency

Always use service classes instead of direct API calls:

```javascript
// ✅ Good
const user = await userService.create(userData);

// ❌ Avoid
const response = await request(baseUrl).post('/users').send(userData);
```

### 2. Clean Up Test Data

Always clean up created test data:

```javascript
let createdUsers = [];

afterAll(async () => {
  if (createdUsers.length > 0) {
    await userService.bulkDelete(createdUsers.map(u => u.id));
  }
});
```

### 3. Use Data Generator

Generate test data consistently:

```javascript
// ✅ Good
const userData = dataGenerator.generateUser();

// ❌ Avoid
const userData = {
  email: 'test@example.com',
  firstName: 'Test',
  // ... hardcoded data
};
```

### 4. Handle Authentication Properly

Reuse tokens and handle caching:

```javascript
let accessToken;

beforeAll(async () => {
  accessToken = await authHelper.getOrCreateToken();
  userService = new UserService(accessToken);
});
```

### 5. Use Assertions Properly

Use specific assertion helpers:

```javascript
// ✅ Good
userService.assertStructure(user);
assertionHelper.assertUserHasRole(user, 'admin');

// ❌ Avoid
expect(user.id).toBeDefined();
expect(user.email).toBeDefined();
// ... many individual assertions
```

### 6. Write Descriptive Test Names

```javascript
// ✅ Good
test('Should create user with admin role and verify permissions', async () => {

// ❌ Avoid
test('test1', async () => {
```

### 7. Group Related Tests

```javascript
describe('User Management', () => {
  describe('CRUD Operations', () => {
    test('Should create user', ...);
    test('Should update user', ...);
  });
  
  describe('Role Management', () => {
    test('Should assign role', ...);
  });
});
```

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:parallel
        env:
          API_BASE_URL: ${{ secrets.API_BASE_URL }}
          IDP_CLIENT_ID: ${{ secrets.IDP_CLIENT_ID }}
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
      
      - name: Generate report
        if: always()
        run: npm run report
      
      - name: Upload reports
        if: always()
        uses: actions/upload-artifact@v2
        with:
          name: test-reports
          path: reports/
```

## 🐛 Troubleshooting

### Common Issues

#### Authentication Failures

```bash
# Enable debug logging
LOG_LEVEL=debug npm test
```

#### Timeout Errors

```javascript
// Increase timeout in test
test('slow operation', async () => {
  // test code
}, 120000); // 120 seconds

// Or globally in .env
TEST_TIMEOUT=120000
```

#### Parallel Test Conflicts

```bash
# Run sequentially
npm test -- --runInBand

# Or reduce workers
jest --maxWorkers=2
```

### Debug Mode

```bash
# Run with Node debugger
npm run test:debug

# Then attach debugger to port 9229
```

### Verbose Logging

```bash
# Enable verbose output
npm test -- --verbose

# Enable debug logs
LOG_LEVEL=debug npm test
```

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please follow the existing code structure and patterns.

## 📧 Support

For issues and questions, please check the documentation or create an issue in the repository.
