/**
 * Report Service
 * Handles all reporting operations
 */

const GraphQLClient = require('../helpers/graphql/graphql-client');
const logger = require('../helpers/utils/logger');

class ReportService {
  constructor(accessToken = null) {
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
   * Get available reports
   * @returns {Promise<Array>} - List of available reports
   */
  async getAvailableReports() {
    const query = `
      query {
        availableReports {
          id
          name
          description
          category
          parameters
        }
      }
    `;

    logger.info('Fetching available reports');
    const response = await this.client.querySuccess(query);
    return response.data.availableReports;
  }

  /**
   * Generate report
   * @param {string} reportType - Type of report
   * @param {Object} params - Report parameters
   * @returns {Promise<Object>} - Report data
   */
  async generateReport(reportType, params = {}) {
    const query = `
      query($reportType: String!, $params: JSON!) {
        generateReport(reportType: $reportType, params: $params) {
          id
          type
          data
          generatedAt
          format
        }
      }
    `;

    logger.info('Generating report:', reportType);
    const response = await this.client.querySuccess(query, { reportType, params });
    return response.data.generateReport;
  }

  /**
   * Get user activity report
   * @param {Object} params - Report parameters (dateFrom, dateTo, userIds)
   * @returns {Promise<Object>} - User activity report
   */
  async getUserActivityReport(params = {}) {
    logger.info('Generating user activity report');
    return this.generateReport('user_activity', params);
  }

  /**
   * Get login report
   * @param {Object} params - Report parameters (dateFrom, dateTo)
   * @returns {Promise<Object>} - Login report
   */
  async getLoginReport(params = {}) {
    logger.info('Generating login report');
    return this.generateReport('login_activity', params);
  }

  /**
   * Get group membership report
   * @param {Object} params - Report parameters
   * @returns {Promise<Object>} - Group membership report
   */
  async getGroupMembershipReport(params = {}) {
    logger.info('Generating group membership report');
    return this.generateReport('group_membership', params);
  }

  /**
   * Get asset usage report
   * @param {Object} params - Report parameters
   * @returns {Promise<Object>} - Asset usage report
   */
  async getAssetUsageReport(params = {}) {
    logger.info('Generating asset usage report');
    return this.generateReport('asset_usage', params);
  }

  /**
   * Export report to CSV
   * @param {string} reportId - Report ID
   * @returns {Promise<Object>} - CSV export data
   */
  async exportReportToCSV(reportId) {
    const mutation = `
      mutation($reportId: ID!) {
        exportReport(reportId: $reportId, format: "csv") {
          content
          filename
          format
        }
      }
    `;

    logger.info('Exporting report to CSV:', reportId);
    const response = await this.client.mutateSuccess(mutation, { reportId });
    return response.data.exportReport;
  }

  /**
   * Schedule report
   * @param {Object} scheduleData - Schedule configuration
   * @returns {Promise<Object>} - Scheduled report
   */
  async scheduleReport(scheduleData) {
    const mutation = `
      mutation($input: ScheduleReportInput!) {
        scheduleReport(input: $input) {
          id
          reportType
          schedule
          recipients
          status
        }
      }
    `;

    logger.info('Scheduling report:', scheduleData.reportType);
    const response = await this.client.mutateSuccess(mutation, { input: scheduleData });
    return response.data.scheduleReport;
  }

  /**
   * Get report history
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Report history
   */
  async getReportHistory(params = {}) {
    const query = `
      query($page: Int, $pageSize: Int, $reportType: String) {
        reportHistory(page: $page, pageSize: $pageSize, reportType: $reportType) {
          items {
            id
            type
            status
            generatedAt
            generatedBy
            parameters
          }
          pagination {
            total
            page
            pageSize
            hasMore
          }
        }
      }
    `;

    logger.info('Fetching report history');
    const response = await this.client.querySuccess(query, params);
    return response.data.reportHistory;
  }
}

module.exports = ReportService;
