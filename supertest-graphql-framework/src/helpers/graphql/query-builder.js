/**
 * Query Builder
 * Helper functions for building GraphQL queries and mutations
 */

/**
 * Build a GraphQL query string with fields
 * @param {string} queryName - Name of the query
 * @param {Object} params - Query parameters
 * @param {Array|Object} fields - Fields to return
 * @returns {string} - Complete GraphQL query
 */
function buildQuery(queryName, params = {}, fields = []) {
  const paramString = Object.keys(params).length > 0 
    ? `(${Object.entries(params).map(([key, value]) => `$${key}: ${value}`).join(', ')})`
    : '';
  
  const fieldString = formatFields(fields);
  
  return `
    query${paramString} {
      ${queryName} {
        ${fieldString}
      }
    }
  `.trim();
}

/**
 * Build a GraphQL mutation string
 * @param {string} mutationName - Name of the mutation
 * @param {Object} params - Mutation parameters
 * @param {Array|Object} fields - Fields to return
 * @returns {string} - Complete GraphQL mutation
 */
function buildMutation(mutationName, params = {}, fields = []) {
  const paramString = Object.keys(params).length > 0 
    ? `(${Object.entries(params).map(([key, value]) => `$${key}: ${value}`).join(', ')})`
    : '';
  
  const fieldString = formatFields(fields);
  
  return `
    mutation${paramString} {
      ${mutationName} {
        ${fieldString}
      }
    }
  `.trim();
}

/**
 * Format fields for GraphQL query
 * @param {Array|Object} fields - Fields to format
 * @returns {string} - Formatted field string
 */
function formatFields(fields) {
  if (Array.isArray(fields)) {
    return fields.join('\n');
  }
  
  if (typeof fields === 'object') {
    return Object.entries(fields)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key} { ${formatFields(value)} }`;
        }
        if (typeof value === 'object') {
          return `${key} { ${formatFields(value)} }`;
        }
        return key;
      })
      .join('\n');
  }
  
  return fields;
}

/**
 * Common field sets for reuse
 */
const commonFields = {
  user: [
    'id',
    'email',
    'firstName',
    'lastName',
    'status',
    'roles',
    'createdAt',
    'updatedAt'
  ],
  
  group: [
    'id',
    'name',
    'description',
    'status',
    'memberCount',
    'createdAt',
    'updatedAt'
  ],
  
  tenant: [
    'id',
    'name',
    'domain',
    'status',
    'settings',
    'createdAt',
    'updatedAt'
  ],
  
  asset: [
    'id',
    'name',
    'type',
    'clientId',
    'redirectUris',
    'grantTypes',
    'status',
    'createdAt',
    'updatedAt'
  ],
  
  pagination: [
    'total',
    'page',
    'pageSize',
    'hasMore'
  ],
  
  error: [
    'message',
    'code',
    'field',
    'details'
  ]
};

/**
 * Build a paginated query
 * @param {string} queryName - Name of the query
 * @param {Object} variables - Query variables
 * @param {Array} fields - Fields to return
 * @returns {string} - Paginated GraphQL query
 */
function buildPaginatedQuery(queryName, variables = {}, fields = []) {
  return `
    query($page: Int, $pageSize: Int, $search: String, $filters: FilterInput) {
      ${queryName}(page: $page, pageSize: $pageSize, search: $search, filters: $filters) {
        items {
          ${formatFields(fields)}
        }
        pagination {
          ${formatFields(commonFields.pagination)}
        }
      }
    }
  `.trim();
}

/**
 * Build a create mutation
 * @param {string} entityName - Name of the entity (e.g., 'User', 'Group')
 * @param {Array} fields - Fields to return
 * @returns {string} - Create mutation
 */
function buildCreateMutation(entityName, fields = []) {
  const mutationName = `create${entityName}`;
  const inputName = `${entityName}Input`;
  
  return `
    mutation($input: ${inputName}!) {
      ${mutationName}(input: $input) {
        ${formatFields(fields)}
      }
    }
  `.trim();
}

/**
 * Build an update mutation
 * @param {string} entityName - Name of the entity
 * @param {Array} fields - Fields to return
 * @returns {string} - Update mutation
 */
function buildUpdateMutation(entityName, fields = []) {
  const mutationName = `update${entityName}`;
  const inputName = `Update${entityName}Input`;
  
  return `
    mutation($id: ID!, $input: ${inputName}!) {
      ${mutationName}(id: $id, input: $input) {
        ${formatFields(fields)}
      }
    }
  `.trim();
}

/**
 * Build a delete mutation
 * @param {string} entityName - Name of the entity
 * @returns {string} - Delete mutation
 */
function buildDeleteMutation(entityName) {
  const mutationName = `delete${entityName}`;
  
  return `
    mutation($id: ID!) {
      ${mutationName}(id: $id) {
        success
        message
      }
    }
  `.trim();
}

/**
 * Build a search query
 * @param {string} entityName - Name of the entity
 * @param {Array} fields - Fields to return
 * @returns {string} - Search query
 */
function buildSearchQuery(entityName, fields = []) {
  const queryName = `search${entityName}s`;
  
  return `
    query($search: String!, $page: Int, $pageSize: Int) {
      ${queryName}(search: $search, page: $page, pageSize: $pageSize) {
        items {
          ${formatFields(fields)}
        }
        pagination {
          ${formatFields(commonFields.pagination)}
        }
      }
    }
  `.trim();
}

module.exports = {
  buildQuery,
  buildMutation,
  formatFields,
  commonFields,
  buildPaginatedQuery,
  buildCreateMutation,
  buildUpdateMutation,
  buildDeleteMutation,
  buildSearchQuery
};
