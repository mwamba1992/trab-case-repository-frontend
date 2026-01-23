import axios from 'axios';
import { Config } from '@/utils/Config';
import AuthService from './AuthService';

const API_URL = `${Config.API_BASE_URL}/analytics`;

/**
 * AnalyticsService - Service for advanced analytics and statistics
 * Handles all analytics-related API operations
 */
class AnalyticsService {
    /**
     * Get dashboard overview statistics
     * GET /api/v1/analytics/dashboard
     * @returns {Promise<Object>} Dashboard overview data
     */
    async getDashboardOverview() {
        try {
            const response = await axios.get(`${API_URL}/dashboard`, {
                headers: AuthService.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Get dashboard overview error:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get chairperson performance statistics
     * GET /api/v1/analytics/chairpersons
     * @returns {Promise<Array>} Chairperson statistics
     */
    async getChairpersonStats() {
        try {
            const response = await axios.get(`${API_URL}/chairpersons`, {
                headers: AuthService.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Get chairperson stats error:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get tax type statistics
     * GET /api/v1/analytics/tax-types
     * @returns {Promise<Array>} Tax type statistics
     */
    async getTaxTypeStats() {
        try {
            const response = await axios.get(`${API_URL}/tax-types`, {
                headers: AuthService.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Get tax type stats error:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get time series trends
     * GET /api/v1/analytics/trends
     * @returns {Promise<Array>} Time series data
     */
    async getTrends() {
        try {
            const response = await axios.get(`${API_URL}/trends`, {
                headers: AuthService.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Get trends error:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get outcome distribution
     * GET /api/v1/analytics/outcomes
     * @returns {Promise<Array>} Outcome distribution data
     */
    async getOutcomeDistribution() {
        try {
            const response = await axios.get(`${API_URL}/outcomes`, {
                headers: AuthService.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Get outcome distribution error:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get top appellants statistics
     * GET /api/v1/analytics/top-appellants
     * @returns {Promise<Array>} Top appellants data
     */
    async getTopAppellants() {
        try {
            const response = await axios.get(`${API_URL}/top-appellants`, {
                headers: AuthService.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Get top appellants error:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get citation statistics
     * GET /api/v1/analytics/citations
     * @returns {Promise<Object>} Citation statistics
     */
    async getCitationStats() {
        try {
            const response = await axios.get(`${API_URL}/citations`, {
                headers: AuthService.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Get citation stats error:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Format currency for display
     * @param {number} amount - Amount to format
     * @param {string} currency - Currency code (default: TZS)
     * @returns {string} Formatted currency string
     */
    formatCurrency(amount, currency = 'TZS') {
        if (!amount && amount !== 0) return 'N/A';

        return new Intl.NumberFormat('en-TZ', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
            notation: 'compact',
            compactDisplay: 'short'
        }).format(amount);
    }

    /**
     * Format large currency amounts
     * @param {number} amount - Amount to format
     * @returns {string} Formatted amount with suffix (M for millions, B for billions)
     */
    formatLargeCurrency(amount) {
        if (!amount && amount !== 0) return 'TZS 0';

        if (amount >= 1000000000) {
            return `TZS ${(amount / 1000000000).toFixed(2)}B`;
        } else if (amount >= 1000000) {
            return `TZS ${(amount / 1000000).toFixed(2)}M`;
        } else if (amount >= 1000) {
            return `TZS ${(amount / 1000).toFixed(2)}K`;
        }
        return `TZS ${amount.toLocaleString()}`;
    }

    /**
     * Format percentage
     * @param {number} value - Percentage value (0-100)
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted percentage
     */
    formatPercentage(value, decimals = 1) {
        if (!value && value !== 0) return '0%';
        return `${value.toFixed(decimals)}%`;
    }

    /**
     * Handle API errors consistently
     * @param {Error} error - Error object from axios
     * @returns {Error} Formatted error
     */
    handleError(error) {
        if (error.response) {
            const message = error.response.data?.message ||
                          error.response.data?.error ||
                          'An error occurred while fetching analytics data';
            const err = new Error(message);
            err.status = error.response.status;
            err.data = error.response.data;
            return err;
        } else if (error.request) {
            return new Error('No response from server. Please check your connection.');
        } else {
            return error;
        }
    }
}

export default new AnalyticsService();
