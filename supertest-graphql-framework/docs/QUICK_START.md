# Quick Start Guide

## 5-Minute Setup

### Step 1: Install Dependencies (1 min)

```bash
cd supertest-graphql-framework
npm install
```

### Step 2: Configure Environment (2 min)

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Minimum required configuration
API_BASE_URL=https://api.example.com
IDP_BASE_URL=https://idp.example.com
IDP_CLIENT_ID=your-client-id
IDP_WELL_KNOWN_URL=https://idp.example.com/.well-known/openid-configuration
TEST_USER_EMAIL=testuser@example.com
TEST_USER_PASSWORD=YourPassword123!
```

### Step 3: Run Your First Test (2 min)

```bash
# Run smoke tests
npm run test:smoke
```

## Your First Custom Test

### Create a Simple Test

Create `src/tests/smoke/my-first-test.js`:

```javascript
const UserService = require('../../services/user-service');
const authHelper = require('../../helpers/auth/auth-helper');
const dataGenerator = require('../../helpers/utils/data-generator');

describe('My First Test', () => {
  let userService;
  let accessToken;

  beforeAll(async () => {
    // Get authenticated
    accessToken = await authHelper.getOrCreateToken();
    
    // Initialize service
    userService = new UserService(accessToken);
  });

  test('Should create and retrieve a user', async () => {
    // Generate test data
    const userData = dataGenerator.generateUser();

    // Create user
    const createdUser = await userService.create(userData);
    
    // Assert creation
    expect(createdUser).toBeDefined();
    expect(createdUser.email).toBe(userData.email);

    // Retrieve user
    const retrievedUser = await userService.getById(createdUser.id);
    
    // Assert retrieval
    expect(retrievedUser.id).toBe(createdUser.id);

    // Cleanup
    await userService.delete(createdUser.id);
  });
});
```

### Run Your Test

```bash
npm test -- my-first-test.js
```

## Common Operations

### Create a User

```javascript
const userData = dataGenerator.generateUser({
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User'
});

const user = await userService.create(userData);
```

### Search

```javascript
const results = await userService.search('john', {
  page: 1,
  pageSize: 10
});
```

### Update

```javascript
const updated = await userService.update(userId, {
  firstName: 'NewName'
});
```

### Delete

```javascript
await userService.delete(userId);
```

### Export to CSV

```javascript
const csv = await userService.exportToCSV({
  fields: ['id', 'email', 'status']
});
```

## Available Services

```javascript
// Users
const userService = new UserService(accessToken);

// Groups
const groupService = new GroupService(accessToken);

// Tenants
const tenantService = new TenantService(accessToken);

// Assets (OAuth2/SAML)
const assetService = new AssetService(accessToken);

// Reports
const reportService = new ReportService(accessToken);

// Delegated Admin
const delegatedAdminService = new DelegatedAdminService(accessToken);
```

## Useful Commands

```bash
# Run all tests
npm test

# Run in parallel (faster)
npm run test:parallel

# Run specific test file
npm test -- users.smoke.test.js

# Run with coverage
npm run test:coverage

# Watch mode (re-run on changes)
npm run test:watch

# Generate HTML report
open reports/test-report.html
```

## Next Steps

1. **Explore Examples**: Check `docs/EXAMPLES.md` for more examples
2. **Read Architecture**: Understanding `docs/ARCHITECTURE.md` helps with advanced usage
3. **Customize**: Add your own services and tests
4. **CI/CD**: Integrate with your pipeline (see README.md)

## Common Issues

### "Authentication failed"

Check your `.env` configuration:
- `IDP_BASE_URL` is correct
- `IDP_CLIENT_ID` is valid
- `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` are correct

### "Connection refused"

Check:
- `API_BASE_URL` is accessible
- Network/VPN connection
- Firewall settings

### "Timeout"

Increase timeout in `.env`:
```env
TEST_TIMEOUT=120000
API_TIMEOUT=60000
```

## Need Help?

- Check `README.md` for full documentation
- Review `docs/EXAMPLES.md` for code examples
- Look at existing smoke tests for patterns
