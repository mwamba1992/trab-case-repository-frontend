import axios from 'axios';
import { Config } from '@/utils/Config';

const API_URL = Config.API_BASE_URL;

export default {
    /**
     * Sync specific appeal from TRAIS
     * @param {number} appealId - TRAIS Appeal ID
     * @returns {Promise} Sync result
     */
    async syncAppeal(appealId) {
        try {
            const response = await axios.post(`${API_URL}/sync/appeal/${appealId}`);
            return response.data;
        } catch (error) {
            console.error('Sync appeal error:', error);
            throw error;
        }
    }
};
