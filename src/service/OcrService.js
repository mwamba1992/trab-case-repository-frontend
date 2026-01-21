import axios from 'axios';
import { Config } from '@/utils/Config';

const API_URL = Config.API_BASE_URL;

export default {
    /**
     * Process all pending documents
     * @returns {Promise} Queue information
     */
    async processPendingDocuments() {
        try {
            const response = await axios.post(`${API_URL}/ocr/process/pending`);
            return response.data;
        } catch (error) {
            console.error('Process pending documents error:', error);
            throw error;
        }
    },

    /**
     * Process specific document
     * @param {string} documentId - Document UUID
     * @returns {Promise} Job information
     */
    async processDocument(documentId) {
        try {
            const response = await axios.post(`${API_URL}/ocr/process/${documentId}`);
            return response.data;
        } catch (error) {
            console.error('Process document error:', error);
            throw error;
        }
    },

    /**
     * Reprocess failed document
     * @param {string} documentId - Document UUID
     * @returns {Promise} Job information
     */
    async reprocessDocument(documentId) {
        try {
            const response = await axios.post(`${API_URL}/ocr/reprocess/${documentId}`);
            return response.data;
        } catch (error) {
            console.error('Reprocess document error:', error);
            throw error;
        }
    },

    /**
     * Get document OCR status
     * @param {string} documentId - Document UUID
     * @returns {Promise} Status information
     */
    async getDocumentStatus(documentId) {
        try {
            const response = await axios.get(`${API_URL}/ocr/status/${documentId}`);
            return response.data;
        } catch (error) {
            console.error('Get document status error:', error);
            throw error;
        }
    },

    /**
     * Get queue statistics
     * @returns {Promise} Queue stats
     */
    async getQueueStats() {
        try {
            const response = await axios.get(`${API_URL}/ocr/queue/stats`);
            return response.data;
        } catch (error) {
            console.error('Get queue stats error:', error);
            throw error;
        }
    },

    /**
     * Get recent jobs
     * @returns {Promise} Recent jobs list
     */
    async getRecentJobs() {
        try {
            const response = await axios.get(`${API_URL}/ocr/queue/jobs`);
            return response.data;
        } catch (error) {
            console.error('Get recent jobs error:', error);
            throw error;
        }
    },

    /**
     * Get job status
     * @param {string} jobId - Job ID
     * @returns {Promise} Job information
     */
    async getJobStatus(jobId) {
        try {
            const response = await axios.get(`${API_URL}/ocr/queue/job/${jobId}`);
            return response.data;
        } catch (error) {
            console.error('Get job status error:', error);
            throw error;
        }
    },

    /**
     * Get document processing statistics
     * @returns {Promise} Document stats
     */
    async getDocumentStats() {
        try {
            const response = await axios.get(`${API_URL}/ocr/documents/stats`);
            return response.data;
        } catch (error) {
            console.error('Get document stats error:', error);
            throw error;
        }
    }
};
