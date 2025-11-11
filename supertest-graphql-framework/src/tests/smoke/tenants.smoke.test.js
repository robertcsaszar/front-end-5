/**
 * Tenants Smoke Tests
 * Basic smoke tests for tenant-related functionality
 */

const TenantService = require('../../services/tenant-service');
const GroupService = require('../../services/group-service');
const authHelper = require('../../helpers/auth/auth-helper');
const dataGenerator = require('../../helpers/utils/data-generator');
const logger = require('../../helpers/utils/logger');

describe('Tenants - Smoke Tests', () => {
  let tenantService;
  let groupService;
  let accessToken;
  let createdTenants = [];
  let createdGroups = [];

  beforeAll(async () => {
    logger.info('Setting up Tenants smoke tests');
    accessToken = await authHelper.getOrCreateToken();
    tenantService = new TenantService(accessToken);
    groupService = new GroupService(accessToken);
  });

  afterAll(async () => {
    logger.info('Cleaning up Tenants smoke tests');
    
    // Cleanup created tenants
    if (createdTenants.length > 0) {
      try {
        await tenantService.bulkDelete(createdTenants.map(t => t.id));
      } catch (error) {
        logger.warn('Failed to cleanup tenants:', error.message);
      }
    }

    // Cleanup created groups
    if (createdGroups.length > 0) {
      try {
        await groupService.bulkDelete(createdGroups.map(g => g.id));
      } catch (error) {
        logger.warn('Failed to cleanup groups:', error.message);
      }
    }
  });

  describe('CRUD Operations', () => {
    test('Should create a new tenant', async () => {
      const tenantData = dataGenerator.generateTenant();

      const tenant = await tenantService.create(tenantData);

      expect(tenant).toBeDefined();
      tenantService.assertStructure(tenant);
      expect(tenant.name).toBe(tenantData.name);
      expect(tenant.domain).toBe(tenantData.domain);
      expect(tenant.status).toBe('active');

      createdTenants.push(tenant);
    });

    test('Should retrieve tenant by ID', async () => {
      const tenantData = dataGenerator.generateTenant();
      const createdTenant = await tenantService.create(tenantData);
      createdTenants.push(createdTenant);

      const tenant = await tenantService.getById(createdTenant.id);

      expect(tenant).toBeDefined();
      expect(tenant.id).toBe(createdTenant.id);
      expect(tenant.name).toBe(tenantData.name);
    });

    test('Should list all tenants with pagination', async () => {
      const result = await tenantService.getAll({ page: 1, pageSize: 10 });

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.pagination).toBeDefined();
    });

    test('Should update tenant information', async () => {
      const tenantData = dataGenerator.generateTenant();
      const createdTenant = await tenantService.create(tenantData);
      createdTenants.push(createdTenant);

      const updateData = {
        name: `Updated_${tenantData.name}`,
        domain: `updated-${tenantData.domain}`
      };

      const updatedTenant = await tenantService.update(createdTenant.id, updateData);

      expect(updatedTenant).toBeDefined();
      expect(updatedTenant.id).toBe(createdTenant.id);
      expect(updatedTenant.name).toBe(updateData.name);
    });

    test('Should delete a tenant', async () => {
      const tenantData = dataGenerator.generateTenant();
      const createdTenant = await tenantService.create(tenantData);

      const result = await tenantService.delete(createdTenant.id);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('Search Functionality', () => {
    test('Should search tenants by name', async () => {
      const tenantData = dataGenerator.generateTenant({
        name: `SearchTenant_${Date.now()}`
      });
      const createdTenant = await tenantService.create(tenantData);
      createdTenants.push(createdTenant);

      const searchTerm = tenantData.name.substring(0, 10);
      const result = await tenantService.search(searchTerm, { page: 1, pageSize: 10 });

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
    });
  });

  describe('Tenant Settings', () => {
    test('Should update tenant settings', async () => {
      const tenantData = dataGenerator.generateTenant();
      const createdTenant = await tenantService.create(tenantData);
      createdTenants.push(createdTenant);

      const newSettings = {
        maxUsers: 200,
        enableSSO: false,
        customDomain: true
      };

      const updatedTenant = await tenantService.updateSettings(createdTenant.id, newSettings);

      expect(updatedTenant).toBeDefined();
      expect(updatedTenant.settings).toBeDefined();
      expect(updatedTenant.settings.maxUsers).toBe(200);
    });

    test('Should enable tenant', async () => {
      const tenantData = dataGenerator.generateTenant({ status: 'inactive' });
      const createdTenant = await tenantService.create(tenantData);
      createdTenants.push(createdTenant);

      const updatedTenant = await tenantService.enable(createdTenant.id);

      expect(updatedTenant).toBeDefined();
      expect(updatedTenant.status).toBe('active');
    });

    test('Should disable tenant', async () => {
      const tenantData = dataGenerator.generateTenant();
      const createdTenant = await tenantService.create(tenantData);
      createdTenants.push(createdTenant);

      const updatedTenant = await tenantService.disable(createdTenant.id);

      expect(updatedTenant).toBeDefined();
      expect(updatedTenant.status).toBe('inactive');
    });
  });

  describe('Tenant Groups', () => {
    test('Should get tenant groups', async () => {
      const tenantData = dataGenerator.generateTenant();
      const createdTenant = await tenantService.create(tenantData);
      createdTenants.push(createdTenant);

      const result = await tenantService.getGroups(createdTenant.id, { page: 1, pageSize: 10 });

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
    });

    test('Should get tenant users', async () => {
      const tenantData = dataGenerator.generateTenant();
      const createdTenant = await tenantService.create(tenantData);
      createdTenants.push(createdTenant);

      const result = await tenantService.getUsers(createdTenant.id, { page: 1, pageSize: 10 });

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
    });
  });

  describe('Tenant Statistics', () => {
    test('Should get tenant statistics', async () => {
      const tenantData = dataGenerator.generateTenant();
      const createdTenant = await tenantService.create(tenantData);
      createdTenants.push(createdTenant);

      const stats = await tenantService.getStatistics(createdTenant.id);

      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('userCount');
      expect(stats).toHaveProperty('groupCount');
      expect(typeof stats.userCount).toBe('number');
    });
  });

  describe('CSV Export', () => {
    test('Should export tenants to CSV', async () => {
      const result = await tenantService.exportToCSV({
        fields: ['id', 'name', 'domain', 'status']
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.filename).toBeDefined();
    });
  });
});
