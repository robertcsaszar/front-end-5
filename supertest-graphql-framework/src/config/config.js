/**
 * Configuration Module
 * Loads and manages all environment configurations
 */

require('dotenv').config();

const config = {
  api: {
    baseUrl: process.env.API_BASE_URL || 'https://api.example.com',
    graphqlEndpoint: process.env.GRAPHQL_ENDPOINT || '/graphql',
    timeout: parseInt(process.env.API_TIMEOUT) || 30000
  },
  
  idp: {
    baseUrl: process.env.IDP_BASE_URL || 'https://idp.example.com',
    realm: process.env.IDP_REALM || 'your-realm',
    clientId: process.env.IDP_CLIENT_ID || 'your-client-id',
    clientSecret: process.env.IDP_CLIENT_SECRET || '',
    wellKnownUrl: process.env.IDP_WELL_KNOWN_URL || 'https://idp.example.com/.well-known/openid-configuration'
  },
  
  pkce: {
    codeVerifierLength: parseInt(process.env.PKCE_CODE_VERIFIER_LENGTH) || 128,
    codeChallengeMethod: process.env.PKCE_CODE_CHALLENGE_METHOD || 'S256'
  },
  
  testUsers: {
    user: {
      email: process.env.TEST_USER_EMAIL || 'testuser@example.com',
      password: process.env.TEST_USER_PASSWORD || 'TestPassword123!'
    },
    admin: {
      email: process.env.TEST_ADMIN_EMAIL || 'admin@example.com',
      password: process.env.TEST_ADMIN_PASSWORD || 'AdminPassword123!'
    }
  },
  
  test: {
    runParallel: process.env.RUN_PARALLEL === 'true',
    maxWorkers: parseInt(process.env.MAX_WORKERS) || 4,
    timeout: parseInt(process.env.TEST_TIMEOUT) || 60000,
    retryAttempts: parseInt(process.env.RETRY_ATTEMPTS) || 3,
    retryDelay: parseInt(process.env.RETRY_DELAY) || 1000
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    toFile: process.env.LOG_TO_FILE === 'true',
    dir: process.env.LOG_DIR || './logs'
  },
  
  reporting: {
    dir: process.env.REPORT_DIR || './reports',
    generateHtml: process.env.GENERATE_HTML_REPORT === 'true',
    generateAllure: process.env.GENERATE_ALLURE_REPORT === 'true'
  },
  
  csv: {
    downloadTimeout: parseInt(process.env.CSV_DOWNLOAD_TIMEOUT) || 30000,
    tempDir: process.env.CSV_TEMP_DIR || './temp/csv'
  },
  
  features: {
    users: process.env.TEST_USERS !== 'false',
    groups: process.env.TEST_GROUPS !== 'false',
    tenants: process.env.TEST_TENANTS !== 'false',
    assets: process.env.TEST_ASSETS !== 'false',
    delegatedAdmin: process.env.TEST_DELEGATED_ADMIN !== 'false',
    reports: process.env.TEST_REPORTS !== 'false',
    csvExport: process.env.TEST_CSV_EXPORT !== 'false',
    search: process.env.TEST_SEARCH !== 'false'
  }
};

module.exports = config;
