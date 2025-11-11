# Architecture Guide

## Overview

This framework follows a layered architecture pattern with clear separation of concerns:

```
┌─────────────────────────────────────┐
│         Test Layer                  │
│  (smoke, integration, e2e tests)    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Service Layer                  │
│  (User, Group, Tenant services)     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    GraphQL Client Layer             │
│   (query execution, batching)       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Helper Layer                   │
│ (auth, utils, data generation)      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    Configuration Layer              │
│  (env vars, constants, setup)       │
└─────────────────────────────────────┘
```

## Core Principles

### 1. **DRY (Don't Repeat Yourself)**
- Base classes for common functionality
- Reusable helpers and utilities
- Shared test fixtures and data generators

### 2. **Modularity**
- Independent, self-contained modules
- Clear interfaces between layers
- Easy to extend and maintain

### 3. **Testability**
- Parallel test execution safe
- Isolated test data
- Proper cleanup mechanisms

### 4. **Scalability**
- Can handle large test suites
- Efficient resource usage
- Configurable parallelization

## Layer Details

### Test Layer

Tests are organized by type:

- **Smoke Tests**: Quick validation of critical paths
- **Integration Tests**: Test interactions between components
- **E2E Tests**: Complete user workflows

Each test file:
- Sets up required services
- Generates test data
- Executes operations
- Asserts results
- Cleans up test data

### Service Layer (Page Objects)

Services provide high-level APIs for business operations:

```javascript
class UserService extends BaseService {
  async create(userData) { }
  async getById(id) { }
  async update(id, data) { }
  async delete(id) { }
  // ... specific user operations
}
```

Benefits:
- Abstracts GraphQL complexity
- Provides domain-specific methods
- Handles common patterns (CRUD, search, export)
- Includes built-in assertions

### GraphQL Client Layer

Handles all GraphQL communication:

```javascript
class GraphQLClient {
  async query(query, variables) { }
  async mutate(mutation, variables) { }
  async batchQuery(queries) { }
  // ... with retry, timeout, auth
}
```

Features:
- Automatic authentication
- Retry logic
- Error handling
- Request/response logging
- Batch operations

### Helper Layer

Provides utilities for:

#### Authentication
- PKCE flow implementation
- Well-known endpoint discovery
- Token management and caching
- Multiple auth flow support

#### Data Generation
- Consistent test data
- Random data generation
- Entity-specific generators
- Bulk data creation

#### Assertions
- GraphQL-specific assertions
- Entity structure validation
- Custom matchers
- Reusable validations

#### Utilities
- Logging
- Retry logic
- Polling mechanisms
- CSV parsing

### Configuration Layer

Centralized configuration management:

- Environment-based settings
- Validation and defaults
- Feature flags
- Test lifecycle hooks

## Data Flow

### Test Execution Flow

```
1. Test starts
   ↓
2. Global setup runs
   ↓
3. Test file setup
   ↓
4. Get/create access token (cached)
   ↓
5. Initialize services with token
   ↓
6. Generate test data
   ↓
7. Execute service methods
   ↓
8. Service calls GraphQL client
   ↓
9. Client executes GraphQL request
   ↓
10. Response processed and returned
    ↓
11. Assertions performed
    ↓
12. Test cleanup
    ↓
13. Test file teardown
    ↓
14. Global teardown
```

### Authentication Flow

```
1. Test needs access token
   ↓
2. Check token cache
   ↓
3. If cached and valid → return cached token
   ↓
4. If not cached:
   ↓
5. Fetch well-known config
   ↓
6. Generate PKCE parameters
   ↓
7. Exchange credentials for token
   ↓
8. Cache token
   ↓
9. Return token
```

## Parallel Execution

### How It Works

```
Main Process
    │
    ├─── Worker 1
    │      └─── Test file A
    │
    ├─── Worker 2
    │      └─── Test file B
    │
    ├─── Worker 3
    │      └─── Test file C
    │
    └─── Worker 4
           └─── Test file D
```

### Safety Mechanisms

1. **Isolated Test Data**: Each test creates unique data
2. **Random Identifiers**: Prevent naming collisions
3. **Proper Cleanup**: Each test cleans its own data
4. **Token Caching**: Per-worker token cache
5. **No Shared State**: Tests don't depend on each other

## Extension Points

### Adding New Services

1. Create service class extending `BaseService`
2. Define entity-specific methods
3. Add custom assertions if needed
4. Create test file in appropriate folder

```javascript
// src/services/custom-service.js
const BaseService = require('./base-service');

class CustomService extends BaseService {
  constructor(accessToken) {
    super('Custom', defaultFields, accessToken);
  }
  
  async customMethod() {
    // Implementation
  }
}

module.exports = CustomService;
```

### Adding New Helpers

1. Create helper file in appropriate subfolder
2. Export singleton or class
3. Document usage
4. Add tests if complex logic

```javascript
// src/helpers/utils/custom-helper.js
class CustomHelper {
  doSomething() {
    // Implementation
  }
}

module.exports = new CustomHelper();
```

### Adding Custom Assertions

```javascript
// In jest.setup.js
expect.extend({
  toBeCustomAssertion(received) {
    const pass = // your logic
    
    if (pass) {
      return {
        message: () => `expected ${received} not to pass`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to pass`,
        pass: false
      };
    }
  }
});
```

## Performance Optimization

### 1. Token Caching
- Tokens cached per user
- Reduces IDP calls
- Checks expiration automatically

### 2. Parallel Execution
- Tests run concurrently
- Configurable worker count
- Automatic load balancing

### 3. Request Batching
- Batch related queries
- Reduces network overhead
- `batchQuery()` method available

### 4. Efficient Cleanup
- Bulk delete operations
- Try-catch for resilience
- Non-blocking when possible

## Error Handling

### Levels of Error Handling

1. **GraphQL Client Level**
   - Catches network errors
   - Handles timeouts
   - Retry logic
   - Logs all errors

2. **Service Level**
   - Validates responses
   - Provides context
   - Propagates meaningful errors

3. **Test Level**
   - Assertions fail descriptively
   - Cleanup in afterAll
   - Screenshots/logs on failure

### Error Recovery

```javascript
// Automatic retry
await retryRequest(
  () => apiCall(),
  maxRetries,
  delay
);

// Conditional retry
await retryWithCondition(
  () => apiCall(),
  (result) => shouldRetry(result),
  maxRetries,
  delay
);

// Polling for eventual consistency
await pollUntil(
  () => checkStatus(),
  (result) => result.ready,
  { timeout, interval }
);
```

## Best Practices

### Code Organization

```
✅ Group related functionality
✅ One service per domain entity
✅ Helpers for cross-cutting concerns
✅ Tests organized by feature/type
✅ Clear naming conventions
```

### Test Writing

```
✅ Use services, not direct API calls
✅ Generate data, don't hardcode
✅ Clean up test data
✅ Use descriptive test names
✅ Group related tests
✅ Handle async properly
✅ Use proper assertions
```

### Maintenance

```
✅ Keep services in sync with API
✅ Update helpers when patterns change
✅ Maintain documentation
✅ Review and refactor regularly
✅ Monitor test execution times
✅ Keep dependencies updated
```

## Troubleshooting Architecture Issues

### High Memory Usage
- Check for memory leaks in services
- Verify proper cleanup
- Reduce parallel workers
- Check token cache size

### Slow Test Execution
- Review serial vs parallel
- Check for unnecessary retries
- Optimize data generation
- Review API response times

### Flaky Tests
- Check test isolation
- Review shared state
- Verify cleanup logic
- Check for race conditions
- Review retry/polling logic

### Authentication Issues
- Verify IDP configuration
- Check token cache
- Review well-known endpoint
- Validate credentials
- Check token expiration logic

## Metrics and Monitoring

### Key Metrics

- Test execution time
- Success/failure rates
- API response times
- Token generation time
- Memory usage
- Parallel worker efficiency

### Logging

- All API requests logged
- Authentication flows logged
- Errors logged with context
- Test lifecycle events logged

### Reports

- HTML test report
- Allure detailed report
- JUnit XML for CI
- Coverage reports
- Custom reporters supported
