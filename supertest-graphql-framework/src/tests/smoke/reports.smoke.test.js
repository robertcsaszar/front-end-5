/**
 * Reports Smoke Tests
 * Basic smoke tests for reporting functionality
 */

const ReportService = require('../../services/report-service');
const authHelper = require('../../helpers/auth/auth-helper');
const logger = require('../../helpers/utils/logger');

describe('Reports - Smoke Tests', () => {
  let reportService;
  let accessToken;

  beforeAll(async () => {
    logger.info('Setting up Reports smoke tests');
    accessToken = await authHelper.getOrCreateToken();
    reportService = new ReportService(accessToken);
  });

  describe('Available Reports', () => {
    test('Should get list of available reports', async () => {
      const reports = await reportService.getAvailableReports();

      expect(reports).toBeDefined();
      expect(Array.isArray(reports)).toBe(true);
      
      if (reports.length > 0) {
        const report = reports[0];
        expect(report).toHaveProperty('id');
        expect(report).toHaveProperty('name');
        expect(report).toHaveProperty('description');
      }
    });
  });

  describe('Report Generation', () => {
    test('Should generate user activity report', async () => {
      const dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const dateTo = new Date().toISOString();

      const report = await reportService.getUserActivityReport({
        dateFrom,
        dateTo
      });

      expect(report).toBeDefined();
      expect(report).toHaveProperty('id');
      expect(report).toHaveProperty('type');
      expect(report).toHaveProperty('data');
      expect(report.type).toBe('user_activity');
    });

    test('Should generate login report', async () => {
      const dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const dateTo = new Date().toISOString();

      const report = await reportService.getLoginReport({
        dateFrom,
        dateTo
      });

      expect(report).toBeDefined();
      expect(report).toHaveProperty('type');
      expect(report.type).toBe('login_activity');
    });

    test('Should generate group membership report', async () => {
      const report = await reportService.getGroupMembershipReport();

      expect(report).toBeDefined();
      expect(report).toHaveProperty('type');
      expect(report.type).toBe('group_membership');
    });

    test('Should generate asset usage report', async () => {
      const dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const dateTo = new Date().toISOString();

      const report = await reportService.getAssetUsageReport({
        dateFrom,
        dateTo
      });

      expect(report).toBeDefined();
      expect(report).toHaveProperty('type');
      expect(report.type).toBe('asset_usage');
    });
  });

  describe('Report Export', () => {
    test('Should export report to CSV', async () => {
      // First generate a report
      const dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const dateTo = new Date().toISOString();

      const report = await reportService.getUserActivityReport({
        dateFrom,
        dateTo
      });

      // Then export it
      const csvExport = await reportService.exportReportToCSV(report.id);

      expect(csvExport).toBeDefined();
      expect(csvExport).toHaveProperty('content');
      expect(csvExport).toHaveProperty('filename');
      expect(csvExport.format).toBe('csv');
      expect(typeof csvExport.content).toBe('string');
    });
  });

  describe('Report History', () => {
    test('Should get report history', async () => {
      const result = await reportService.getReportHistory({
        page: 1,
        pageSize: 10
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.items)).toBe(true);
    });

    test('Should get report history filtered by type', async () => {
      const result = await reportService.getReportHistory({
        reportType: 'user_activity',
        page: 1,
        pageSize: 10
      });

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      
      if (result.items.length > 0) {
        result.items.forEach(item => {
          expect(item.type).toBe('user_activity');
        });
      }
    });
  });

  describe('Report Scheduling', () => {
    test('Should schedule a report', async () => {
      const scheduleData = {
        reportType: 'user_activity',
        schedule: 'daily',
        recipients: ['admin@example.com'],
        parameters: {
          dateRange: 'last_7_days'
        }
      };

      const scheduled = await reportService.scheduleReport(scheduleData);

      expect(scheduled).toBeDefined();
      expect(scheduled).toHaveProperty('id');
      expect(scheduled.reportType).toBe('user_activity');
      expect(scheduled.schedule).toBe('daily');
      expect(scheduled.status).toBeDefined();
    });
  });
});
