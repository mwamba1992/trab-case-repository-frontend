import axios from 'axios';
import { Config } from '@/utils/Config';

const API_URL = Config.API_BASE_URL;

export default {
    /**
     * Hybrid search (combines full-text and semantic search)
     * @param {string} query - Search query
     * @param {number} limit - Maximum results
     * @param {number} ftWeight - Full-text weight (0-1)
     * @param {number} semWeight - Semantic weight (0-1)
     * @returns {Promise} Search results
     */
    async hybridSearch(query, limit = 10, ftWeight = 0.5, semWeight = 0.5) {
        try {
            const response = await axios.get(`${API_URL}/search`, {
                params: { q: query, limit, ftWeight, semWeight }
            });
            return response.data;
        } catch (error) {
            console.error('Hybrid search error:', error);
            throw error;
        }
    },

    /**
     * Full-text search (keyword matching)
     * @param {string} query - Search query
     * @param {number} limit - Maximum results
     * @returns {Promise} Search results
     */
    async fullTextSearch(query, limit = 10) {
        try {
            const response = await axios.get(`${API_URL}/search/full-text`, {
                params: { q: query, limit }
            });
            return response.data;
        } catch (error) {
            console.error('Full-text search error:', error);
            throw error;
        }
    },

    /**
     * Semantic search (meaning-based search)
     * @param {string} query - Search query
     * @param {number} limit - Maximum results
     * @returns {Promise} Search results
     */
    async semanticSearch(query, limit = 10) {
        try {
            const response = await axios.get(`${API_URL}/search/semantic`, {
                params: { q: query, limit }
            });
            return response.data;
        } catch (error) {
            console.error('Semantic search error:', error);
            throw error;
        }
    }
};
