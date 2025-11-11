/**
 * Assets Smoke Tests
 * Basic smoke tests for asset-related functionality (OAuth2 clients, SAML2)
 */

const AssetService = require('../../services/asset-service');
const authHelper = require('../../helpers/auth/auth-helper');
const dataGenerator = require('../../helpers/utils/data-generator');
const logger = require('../../helpers/utils/logger');

describe('Assets - Smoke Tests', () => {
  let assetService;
  let accessToken;
  let createdAssets = [];

  beforeAll(async () => {
    logger.info('Setting up Assets smoke tests');
    accessToken = await authHelper.getOrCreateToken();
    assetService = new AssetService(accessToken);
  });

  afterAll(async () => {
    logger.info('Cleaning up Assets smoke tests');
    
    // Cleanup created assets
    if (createdAssets.length > 0) {
      try {
        await assetService.bulkDelete(createdAssets.map(a => a.id));
      } catch (error) {
        logger.warn('Failed to cleanup assets:', error.message);
      }
    }
  });

  describe('CRUD Operations', () => {
    test('Should create a new asset', async () => {
      const assetData = dataGenerator.generateAsset();

      const asset = await assetService.create(assetData);

      expect(asset).toBeDefined();
      assetService.assertStructure(asset);
      expect(asset.name).toBe(assetData.name);
      expect(asset.clientId).toBeDefined();
      expect(asset.status).toBe('active');

      createdAssets.push(asset);
    });

    test('Should retrieve asset by ID', async () => {
      const assetData = dataGenerator.generateAsset();
      const createdAsset = await assetService.create(assetData);
      createdAssets.push(createdAsset);

      const asset = await assetService.getById(createdAsset.id);

      expect(asset).toBeDefined();
      expect(asset.id).toBe(createdAsset.id);
      expect(asset.name).toBe(assetData.name);
    });

    test('Should list all assets with pagination', async () => {
      const result = await assetService.getAll({ page: 1, pageSize: 10 });

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.pagination).toBeDefined();
    });

    test('Should update asset information', async () => {
      const assetData = dataGenerator.generateAsset();
      const createdAsset = await assetService.create(assetData);
      createdAssets.push(createdAsset);

      const updateData = {
        name: `Updated_${assetData.name}`,
        redirectUris: ['http://localhost:4000/callback']
      };

      const updatedAsset = await assetService.update(createdAsset.id, updateData);

      expect(updatedAsset).toBeDefined();
      expect(updatedAsset.id).toBe(createdAsset.id);
      expect(updatedAsset.name).toBe(updateData.name);
    });

    test('Should delete an asset', async () => {
      const assetData = dataGenerator.generateAsset();
      const createdAsset = await assetService.create(assetData);

      const result = await assetService.delete(createdAsset.id);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('Search Functionality', () => {
    test('Should search assets by name', async () => {
      const assetData = dataGenerator.generateAsset({
        name: `SearchAsset_${Date.now()}`
      });
      const createdAsset = await assetService.create(assetData);
      createdAssets.push(createdAsset);

      const searchTerm = assetData.name.substring(0, 10);
      const result = await assetService.search(searchTerm, { page: 1, pageSize: 10 });

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
    });
  });

  describe('PKCE Assets', () => {
    test('Should create PKCE asset', async () => {
      const assetData = dataGenerator.generatePKCEAsset();

      const asset = await assetService.createPKCEAsset(assetData);

      expect(asset).toBeDefined();
      expect(asset.requirePKCE).toBe(true);
      expect(asset.grantTypes).toContain('authorization_code');
      expect(asset.responseTypes).toContain('code');

      createdAssets.push(asset);
    });

    test('Should enable PKCE for asset', async () => {
      const assetData = dataGenerator.generateAsset();
      const createdAsset = await assetService.create(assetData);
      createdAssets.push(createdAsset);

      const updatedAsset = await assetService.enablePKCE(createdAsset.id);

      expect(updatedAsset).toBeDefined();
      expect(updatedAsset.requirePKCE).toBe(true);
    });

    test('Should disable PKCE for asset', async () => {
      const assetData = dataGenerator.generatePKCEAsset();
      const createdAsset = await assetService.createPKCEAsset(assetData);
      createdAssets.push(createdAsset);

      const updatedAsset = await assetService.disablePKCE(createdAsset.id);

      expect(updatedAsset).toBeDefined();
      expect(updatedAsset.requirePKCE).toBe(false);
    });

    test('Should get PKCE assets by type', async () => {
      const result = await assetService.getByType('pkce', { page: 1, pageSize: 10 });

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
    });
  });

  describe('Implicit Flow Assets', () => {
    test('Should create Implicit flow asset', async () => {
      const assetData = dataGenerator.generateImplicitAsset();

      const asset = await assetService.createImplicitAsset(assetData);

      expect(asset).toBeDefined();
      expect(asset.grantTypes).toContain('implicit');
      expect(asset.responseTypes).toContain('token');

      createdAssets.push(asset);
    });
  });

  describe('Authorization Code Assets', () => {
    test('Should create Authorization Code asset', async () => {
      const assetData = dataGenerator.generateAsset({
        grantTypes: ['authorization_code', 'refresh_token'],
        responseTypes: ['code']
      });

      const asset = await assetService.create(assetData);

      expect(asset).toBeDefined();
      expect(asset.grantTypes).toContain('authorization_code');
      expect(asset.responseTypes).toContain('code');

      createdAssets.push(asset);
    });
  });

  describe('SAML2 Assets', () => {
    test('Should create SAML2 asset', async () => {
      const assetData = dataGenerator.generateSAML2Asset();

      const asset = await assetService.createSAML2Asset(assetData);

      expect(asset).toBeDefined();
      expect(asset.type).toBe('saml2');
      expect(asset.entityId).toBeDefined();

      createdAssets.push(asset);
    });
  });

  describe('Asset Configuration', () => {
    test('Should regenerate client secret', async () => {
      const assetData = dataGenerator.generateAsset();
      const createdAsset = await assetService.create(assetData);
      createdAssets.push(createdAsset);

      const result = await assetService.regenerateSecret(createdAsset.id);

      expect(result).toBeDefined();
      expect(result.clientSecret).toBeDefined();
      expect(result.clientSecret).not.toBe(assetData.clientSecret);
    });

    test('Should update grant types', async () => {
      const assetData = dataGenerator.generateAsset();
      const createdAsset = await assetService.create(assetData);
      createdAssets.push(createdAsset);

      const newGrantTypes = ['client_credentials', 'refresh_token'];
      const updatedAsset = await assetService.updateGrantTypes(createdAsset.id, newGrantTypes);

      expect(updatedAsset).toBeDefined();
      expect(updatedAsset.grantTypes).toContain('client_credentials');
    });

    test('Should update redirect URIs', async () => {
      const assetData = dataGenerator.generateAsset();
      const createdAsset = await assetService.create(assetData);
      createdAssets.push(createdAsset);

      const newRedirectUris = ['http://localhost:5000/callback', 'http://localhost:6000/callback'];
      const updatedAsset = await assetService.updateRedirectUris(createdAsset.id, newRedirectUris);

      expect(updatedAsset).toBeDefined();
      expect(updatedAsset.redirectUris).toEqual(newRedirectUris);
    });
  });

  describe('Asset Statistics', () => {
    test('Should get asset statistics', async () => {
      const assetData = dataGenerator.generateAsset();
      const createdAsset = await assetService.create(assetData);
      createdAssets.push(createdAsset);

      const stats = await assetService.getStatistics(createdAsset.id);

      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('totalAuthorizations');
      expect(stats).toHaveProperty('activeTokens');
    });
  });

  describe('CSV Export', () => {
    test('Should export assets to CSV', async () => {
      const result = await assetService.exportToCSV({
        fields: ['id', 'name', 'type', 'clientId', 'status']
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.filename).toBeDefined();
    });
  });
});
