import axios from 'axios';
import { Config } from '@/utils/Config';
import AuthService from './AuthService';

const API_URL = `${Config.API_BASE_URL}/cases`;

/**
 * CaseService - Production-ready service for case management
 * Handles all case-related API operations with proper error handling
 */
class CaseService {
    /**
     * Get all cases with pagination
     * GET /api/v1/cases
     * @param {number} limit - Number of cases to return (default: 50)
     * @param {number} offset - Offset for pagination (default: 0)
     * @returns {Promise<Object>} Paginated cases data
     */
    async getAllCases(limit = 50, offset = 0) {
        try {
            const response = await axios.get(API_URL, {
                params: { limit, offset },
                headers: AuthService.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Get all cases error:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get case by ID with full details (documents, parties, contents)
     * GET /api/v1/cases/:id
     * @param {string} id - Case UUID
     * @returns {Promise<Object>} Case details with relations
     */
    async getCaseById(id) {
        try {
            const response = await axios.get(`${API_URL}/${id}`, {
                headers: AuthService.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Get case by ID error:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get case by case number
     * GET /api/v1/cases/number/:caseNumber
     * @param {string} caseNumber - Case number (e.g., "DSM.211/2024")
     * @returns {Promise<Object>} Case details
     */
    async getCaseByCaseNumber(caseNumber) {
        try {
            const response = await axios.get(`${API_URL}/number/${encodeURIComponent(caseNumber)}`, {
                headers: AuthService.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Get case by case number error:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get case statistics for dashboard
     * GET /api/v1/cases/stats
     * @returns {Promise<Object>} Case statistics
     */
    async getStats() {
        try {
            const response = await axios.get(`${API_URL}/stats`, {
                headers: AuthService.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Get case stats error:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get recent cases
     * GET /api/v1/cases/recent
     * @param {number} limit - Number of recent cases (default: 10)
     * @returns {Promise<Array>} Recent cases
     */
    async getRecentCases(limit = 10) {
        try {
            const response = await axios.get(`${API_URL}/recent`, {
                params: { limit },
                headers: AuthService.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Get recent cases error:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get unique chairpersons list
     * GET /api/v1/cases/chairpersons
     * @returns {Promise<Array<string>>} List of unique chairpersons
     */
    async getChairpersons() {
        try {
            const response = await axios.get(`${API_URL}/chairpersons`, {
                headers: AuthService.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Get chairpersons error:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get all documents for a specific case
     * GET /api/v1/cases/:id/documents
     * @param {string} caseId - Case UUID
     * @returns {Promise<Object>} Case documents list
     */
    async getCaseDocuments(caseId) {
        try {
            const response = await axios.get(`${API_URL}/${caseId}/documents`, {
                headers: AuthService.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Get case documents error:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get PDF document stream URL for inline preview
     * Returns a secured URL with auth token for PDF viewer
     * @param {string} documentId - Document UUID
     * @param {boolean} download - Whether to download or preview inline
     * @returns {string} Authenticated URL for PDF streaming
     */
    getDocumentStreamUrl(documentId, download = false) {
        const token = AuthService.getAccessToken();
        const downloadParam = download ? '?download=true' : '';
        return `${API_URL}/documents/${documentId}/stream${downloadParam}`;
    }

    /**
     * Get PDF document blob for preview (alternative method)
     * Downloads the PDF as blob for client-side rendering
     * @param {string} documentId - Document UUID
     * @returns {Promise<Blob>} PDF blob
     */
    async getDocumentBlob(documentId) {
        try {
            const response = await axios.get(`${API_URL}/documents/${documentId}/stream`, {
                headers: AuthService.getAuthHeaders(),
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Get document blob error:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Download document (triggers browser download)
     * @param {string} documentId - Document UUID
     * @param {string} fileName - File name for download
     */
    async downloadDocument(documentId, fileName = 'document.pdf') {
        try {
            const response = await axios.get(`${API_URL}/documents/${documentId}/stream?download=true`, {
                headers: AuthService.getAuthHeaders(),
                responseType: 'blob'
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download document error:', error);
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
            maximumFractionDigits: 2
        }).format(amount);
    }

    /**
     * Format date for display
     * @param {string|Date} date - Date to format
     * @param {string} format - Format style ('short', 'long', 'medium')
     * @returns {string} Formatted date string
     */
    formatDate(date, format = 'long') {
        if (!date) return 'N/A';

        const dateObj = typeof date === 'string' ? new Date(date) : date;

        const formats = {
            short: { year: 'numeric', month: '2-digit', day: '2-digit' },
            medium: { year: 'numeric', month: 'short', day: 'numeric' },
            long: { year: 'numeric', month: 'long', day: 'numeric' }
        };

        return dateObj.toLocaleDateString('en-US', formats[format] || formats.long);
    }

    /**
     * Get status severity for PrimeVue Tag component
     * @param {string} status - Case status
     * @returns {string} Severity level
     */
    getStatusSeverity(status) {
        const severityMap = {
            'pending': 'warn',
            'decided': 'success',
            'appealed': 'info',
            'withdrawn': 'secondary',
            'settled': 'success'
        };
        return severityMap[status?.toLowerCase()] || 'info';
    }

    /**
     * Get outcome severity for PrimeVue Tag component
     * @param {string} outcome - Case outcome
     * @returns {string} Severity level
     */
    getOutcomeSeverity(outcome) {
        const severityMap = {
            'allowed': 'success',
            'dismissed': 'danger',
            'partially_allowed': 'warn',
            'remanded': 'info',
            'other': 'secondary'
        };
        return severityMap[outcome?.toLowerCase()] || 'info';
    }

    /**
     * Get human-readable case type label
     * @param {string} caseType - Case type enum value
     * @returns {string} Human-readable label
     */
    getCaseTypeLabel(caseType) {
        const labels = {
            'income_tax': 'Income Tax',
            'vat': 'VAT',
            'customs': 'Customs',
            'excise': 'Excise Duty',
            'stamp_duty': 'Stamp Duty',
            'other': 'Other'
        };
        return labels[caseType?.toLowerCase()] || caseType;
    }

    /**
     * Handle API errors consistently
     * @param {Error} error - Error object from axios
     * @returns {Error} Formatted error
     */
    handleError(error) {
        if (error.response) {
            // Server responded with error
            const message = error.response.data?.message ||
                          error.response.data?.error ||
                          'An error occurred while processing your request';
            const err = new Error(message);
            err.status = error.response.status;
            err.data = error.response.data;
            return err;
        } else if (error.request) {
            // Request made but no response
            return new Error('No response from server. Please check your connection.');
        } else {
            // Error in request setup
            return error;
        }
    }
}

export default new CaseService();
