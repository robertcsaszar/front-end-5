/**
 * Assertion Helper
 * Provides common assertion utilities for tests
 */

const logger = require('./logger');

class AssertionHelper {
  /**
   * Assert GraphQL response is successful
   * @param {Object} response - GraphQL response
   * @param {string} message - Custom error message
   */
  assertGraphQLSuccess(response, message = 'Expected successful GraphQL response') {
    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    expect(response.errors).toBeUndefined();
    expect(response.data).toBeDefined();
    
    if (response.errors) {
      logger.error('GraphQL errors found:', response.errors);
      throw new Error(`${message}: ${JSON.stringify(response.errors)}`);
    }
  }

  /**
   * Assert GraphQL response has errors
   * @param {Object} response - GraphQL response
   * @param {string} expectedError - Expected error message (optional)
   */
  assertGraphQLError(response, expectedError = null) {
    expect(response).toBeDefined();
    expect(response.errors).toBeDefined();
    expect(Array.isArray(response.errors)).toBe(true);
    expect(response.errors.length).toBeGreaterThan(0);
    
    if (expectedError) {
      const hasError = response.errors.some(err => 
        err.message && err.message.includes(expectedError)
      );
      expect(hasError).toBe(true);
    }
  }

  /**
   * Assert entity has required fields
   * @param {Object} entity - Entity to check
   * @param {Array} requiredFields - Array of required field names
   */
  assertHasRequiredFields(entity, requiredFields) {
    expect(entity).toBeDefined();
    expect(typeof entity).toBe('object');
    
    requiredFields.forEach(field => {
      expect(entity).toHaveProperty(field);
      expect(entity[field]).toBeDefined();
    });
  }

  /**
   * Assert pagination response structure
   * @param {Object} response - Response with pagination
   */
  assertPaginationStructure(response) {
    expect(response).toBeDefined();
    expect(response).toHaveProperty('items');
    expect(response).toHaveProperty('pagination');
    expect(Array.isArray(response.items)).toBe(true);
    
    const { pagination } = response;
    expect(pagination).toHaveProperty('total');
    expect(pagination).toHaveProperty('page');
    expect(pagination).toHaveProperty('pageSize');
    expect(typeof pagination.total).toBe('number');
    expect(typeof pagination.page).toBe('number');
    expect(typeof pagination.pageSize).toBe('number');
  }

  /**
   * Assert array contains item matching criteria
   * @param {Array} array - Array to search
   * @param {Function} matcher - Function that returns true if item matches
   * @param {string} message - Custom error message
   */
  assertArrayContains(array, matcher, message = 'Array should contain matching item') {
    expect(Array.isArray(array)).toBe(true);
    const found = array.some(matcher);
    expect(found).toBe(true);
  }

  /**
   * Assert array does not contain item matching criteria
   * @param {Array} array - Array to search
   * @param {Function} matcher - Function that returns true if item matches
   * @param {string} message - Custom error message
   */
  assertArrayNotContains(array, matcher, message = 'Array should not contain matching item') {
    expect(Array.isArray(array)).toBe(true);
    const found = array.some(matcher);
    expect(found).toBe(false);
  }

  /**
   * Assert user structure
   * @param {Object} user - User object
   */
  assertUserStructure(user) {
    this.assertHasRequiredFields(user, [
      'id',
      'email',
      'firstName',
      'lastName',
      'status'
    ]);
    
    expect(typeof user.email).toBe('string');
    expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  }

  /**
   * Assert group structure
   * @param {Object} group - Group object
   */
  assertGroupStructure(group) {
    this.assertHasRequiredFields(group, [
      'id',
      'name',
      'status'
    ]);
    
    expect(typeof group.name).toBe('string');
  }

  /**
   * Assert tenant structure
   * @param {Object} tenant - Tenant object
   */
  assertTenantStructure(tenant) {
    this.assertHasRequiredFields(tenant, [
      'id',
      'name',
      'domain',
      'status'
    ]);
    
    expect(typeof tenant.name).toBe('string');
    expect(typeof tenant.domain).toBe('string');
  }

  /**
   * Assert asset structure
   * @param {Object} asset - Asset object
   */
  assertAssetStructure(asset) {
    this.assertHasRequiredFields(asset, [
      'id',
      'name',
      'type',
      'clientId',
      'status'
    ]);
    
    expect(typeof asset.name).toBe('string');
    expect(typeof asset.clientId).toBe('string');
  }

  /**
   * Assert CSV content
   * @param {string} csvContent - CSV content
   * @param {Object} options - Validation options
   */
  assertCSVContent(csvContent, options = {}) {
    expect(csvContent).toBeDefined();
    expect(typeof csvContent).toBe('string');
    expect(csvContent.length).toBeGreaterThan(0);
    
    const lines = csvContent.split('\n').filter(line => line.trim());
    expect(lines.length).toBeGreaterThan(0);
    
    // Check header row
    const header = lines[0];
    expect(header).toBeDefined();
    
    if (options.expectedHeaders) {
      options.expectedHeaders.forEach(headerName => {
        expect(header).toContain(headerName);
      });
    }
    
    if (options.minRows) {
      expect(lines.length - 1).toBeGreaterThanOrEqual(options.minRows);
    }
  }

  /**
   * Assert status code
   * @param {number} actual - Actual status code
   * @param {number} expected - Expected status code
   * @param {string} message - Custom error message
   */
  assertStatusCode(actual, expected, message = null) {
    const errorMessage = message || `Expected status code ${expected}, got ${actual}`;
    expect(actual).toBe(expected);
  }

  /**
   * Assert response time is acceptable
   * @param {number} responseTime - Response time in milliseconds
   * @param {number} maxTime - Maximum acceptable time
   */
  assertResponseTime(responseTime, maxTime = 5000) {
    expect(responseTime).toBeLessThan(maxTime);
  }

  /**
   * Assert search results contain query
   * @param {Array} results - Search results
   * @param {string} query - Search query
   * @param {string} field - Field to check (default: 'name')
   */
  assertSearchResults(results, query, field = 'name') {
    expect(Array.isArray(results)).toBe(true);
    
    if (results.length > 0) {
      const allMatch = results.every(item => 
        item[field] && 
        item[field].toLowerCase().includes(query.toLowerCase())
      );
      expect(allMatch).toBe(true);
    }
  }

  /**
   * Assert role permissions
   * @param {Object} user - User object with roles
   * @param {string|Array} expectedRoles - Expected role(s)
   */
  assertUserHasRole(user, expectedRoles) {
    expect(user).toHaveProperty('roles');
    expect(Array.isArray(user.roles)).toBe(true);
    
    const roles = Array.isArray(expectedRoles) ? expectedRoles : [expectedRoles];
    
    roles.forEach(role => {
      expect(user.roles).toContain(role);
    });
  }

  /**
   * Assert entity is active
   * @param {Object} entity - Entity with status
   */
  assertEntityActive(entity) {
    expect(entity).toHaveProperty('status');
    expect(entity.status).toBe('active');
  }

  /**
   * Assert entity is inactive/deleted
   * @param {Object} entity - Entity with status
   */
  assertEntityInactive(entity) {
    expect(entity).toHaveProperty('status');
    expect(['inactive', 'deleted', 'disabled']).toContain(entity.status);
  }

  /**
   * Assert timestamps are present
   * @param {Object} entity - Entity with timestamps
   */
  assertHasTimestamps(entity) {
    expect(entity).toHaveProperty('createdAt');
    expect(entity).toHaveProperty('updatedAt');
    
    // Validate timestamp format (ISO 8601)
    expect(new Date(entity.createdAt).toISOString()).toBe(entity.createdAt);
    expect(new Date(entity.updatedAt).toISOString()).toBe(entity.updatedAt);
  }
}

module.exports = new AssertionHelper();
