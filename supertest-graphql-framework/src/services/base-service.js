/**
 * Base Service
 * Base class for all service classes providing common CRUD operations
 */

const GraphQLClient = require('../helpers/graphql/graphql-client');
const { 
  buildCreateMutation,
  buildUpdateMutation,
  buildDeleteMutation,
  buildPaginatedQuery,
  buildSearchQuery,
  formatFields
} = require('../helpers/graphql/query-builder');
const logger = require('../helpers/utils/logger');
const assertionHelper = require('../helpers/utils/assertion-helper');

class BaseService {
  /**
   * Constructor
   * @param {string} entityName - Name of the entity (e.g., 'User', 'Group')
   * @param {Array} defaultFields - Default fields to fetch
   * @param {string} accessToken - Access token for authentication
   */
  constructor(entityName, defaultFields, accessToken = null) {
    this.entityName = entityName;
    this.entityNameLower = entityName.toLowerCase();
    this.entityNamePlural = `${entityName}s`;
    this.entityNamePluralLower = `${this.entityNameLower}s`;
    this.defaultFields = defaultFields;
    this.client = new GraphQLClient(accessToken);
  }

  /**
   * Set access token
   * @param {string} token - Access token
   */
  setAccessToken(token) {
    this.client.setAccessToken(token);
  }

  /**
   * Get entity by ID
   * @param {string} id - Entity ID
   * @param {Array} fields - Fields to fetch (optional)
   * @returns {Promise<Object>} - Entity data
   */
  async getById(id, fields = null) {
    const queryFields = fields || this.defaultFields;
    const query = `
      query {
        ${this.entityNameLower}(id: "${id}") {
          ${formatFields(queryFields)}
        }
      }
    `;

    logger.info(`Fetching ${this.entityName} by ID:`, id);
    const response = await this.client.querySuccess(query);
    return response.data[this.entityNameLower];
  }

  /**
   * Get all entities with pagination
   * @param {Object} params - Query parameters (page, pageSize, search, filters)
   * @param {Array} fields - Fields to fetch (optional)
   * @returns {Promise<Object>} - Paginated results
   */
  async getAll(params = {}, fields = null) {
    const queryFields = fields || this.defaultFields;
    const query = buildPaginatedQuery(this.entityNamePluralLower, params, queryFields);

    logger.info(`Fetching all ${this.entityNamePlural}`);
    const response = await this.client.querySuccess(query, params);
    return response.data[this.entityNamePluralLower];
  }

  /**
   * Search entities
   * @param {string} searchTerm - Search term
   * @param {Object} params - Additional parameters
   * @param {Array} fields - Fields to fetch (optional)
   * @returns {Promise<Object>} - Search results
   */
  async search(searchTerm, params = {}, fields = null) {
    const queryFields = fields || this.defaultFields;
    const query = buildSearchQuery(this.entityName, queryFields);
    const variables = {
      search: searchTerm,
      ...params
    };

    logger.info(`Searching ${this.entityNamePlural}:`, searchTerm);
    const response = await this.client.querySuccess(query, variables);
    return response.data[`search${this.entityNamePlural}`];
  }

  /**
   * Create entity
   * @param {Object} input - Entity input data
   * @param {Array} fields - Fields to return (optional)
   * @returns {Promise<Object>} - Created entity
   */
  async create(input, fields = null) {
    const returnFields = fields || this.defaultFields;
    const mutation = buildCreateMutation(this.entityName, returnFields);
    const variables = { input };

    logger.info(`Creating ${this.entityName}:`, Object.keys(input));
    const response = await this.client.mutateSuccess(mutation, variables);
    return response.data[`create${this.entityName}`];
  }

  /**
   * Update entity
   * @param {string} id - Entity ID
   * @param {Object} input - Update data
   * @param {Array} fields - Fields to return (optional)
   * @returns {Promise<Object>} - Updated entity
   */
  async update(id, input, fields = null) {
    const returnFields = fields || this.defaultFields;
    const mutation = buildUpdateMutation(this.entityName, returnFields);
    const variables = { id, input };

    logger.info(`Updating ${this.entityName}:`, id);
    const response = await this.client.mutateSuccess(mutation, variables);
    return response.data[`update${this.entityName}`];
  }

  /**
   * Delete entity
   * @param {string} id - Entity ID
   * @returns {Promise<Object>} - Deletion result
   */
  async delete(id) {
    const mutation = buildDeleteMutation(this.entityName);
    const variables = { id };

    logger.info(`Deleting ${this.entityName}:`, id);
    const response = await this.client.mutateSuccess(mutation, variables);
    return response.data[`delete${this.entityName}`];
  }

  /**
   * Export to CSV
   * @param {Object} params - Export parameters (filters, fields)
   * @returns {Promise<string>} - CSV content
   */
  async exportToCSV(params = {}) {
    const query = `
      query($filters: FilterInput, $fields: [String!]) {
        export${this.entityNamePlural}(filters: $filters, fields: $fields, format: "csv") {
          content
          filename
        }
      }
    `;

    logger.info(`Exporting ${this.entityNamePlural} to CSV`);
    const response = await this.client.querySuccess(query, params);
    return response.data[`export${this.entityNamePlural}`];
  }

  /**
   * Bulk create entities
   * @param {Array} inputs - Array of entity inputs
   * @returns {Promise<Array>} - Array of created entities
   */
  async bulkCreate(inputs) {
    logger.info(`Bulk creating ${inputs.length} ${this.entityNamePlural}`);
    
    const promises = inputs.map(input => this.create(input));
    return Promise.all(promises);
  }

  /**
   * Bulk delete entities
   * @param {Array} ids - Array of entity IDs
   * @returns {Promise<Array>} - Array of deletion results
   */
  async bulkDelete(ids) {
    logger.info(`Bulk deleting ${ids.length} ${this.entityNamePlural}`);
    
    const promises = ids.map(id => this.delete(id));
    return Promise.all(promises);
  }

  /**
   * Assert entity structure
   * @param {Object} entity - Entity to validate
   */
  assertStructure(entity) {
    assertionHelper.assertHasRequiredFields(entity, ['id', 'status']);
  }

  /**
   * Wait for entity to be created/updated
   * @param {string} id - Entity ID
   * @param {Function} condition - Condition function
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<Object>} - Entity when condition is met
   */
  async waitForCondition(id, condition, timeout = 30000) {
    const { pollUntil } = require('../helpers/utils/retry');
    
    return pollUntil(
      () => this.getById(id),
      condition,
      { timeout, interval: 1000 }
    );
  }
}

module.exports = BaseService;
