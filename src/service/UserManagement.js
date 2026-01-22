import { Config } from '@/utils/Config';
import api from '@/service/Api';

const USER_URL = Config.API_BASE_URL + '/auth/users'; // User management endpoint

export const UserService = {
    /**
     * Get all Users
     * GET /api/v1/auth/users
     * @returns {Promise} Resolves with a list of users
     */ async getUsers() {
        return await api
            .get('/auth/users')
            .then((response) => response.data)
            .catch((error) => {
                console.error('Error fetching users:', error);
                throw error;
            });
    },

    /**
     * Create a new User
     * @param {Object} user - The user data to create
     * @returns {Promise} Resolves with the created user
     */
    createUser(user) {
        return api
            .post('/users', user)
            .then((response) => response.data)
            .catch((error) => {
                console.error('Error creating user:', error);
                throw error;
            });
    },

    /**
     * Update an existing User
     * @param {Object} user - The updated user data
     * @returns {Promise} Resolves with the updated user
     */
    updateUser(user) {
        return api
            .patch(`${USER_URL}/${user.id}`, user)
            .then((response) => response.data)
            .catch((error) => {
                console.error('Error updating user:', error);
                throw error;
            });
    },

    /**
     * Delete a User
     * @param {number} userId - The ID of the user to delete
     * @returns {Promise} Resolves when the user is deleted
     */
    deleteUser(userId) {
        return api
            .delete(`${USER_URL}/${userId}`)
            .then((response) => response.data)
            .catch((error) => {
                console.error('Error deleting user:', error);
                throw error;
            });
    },

    resetPassword(userId) {
        return api
            .put(`${USER_URL}/reset-password/${userId}`)
            .then((response) => response.data)
            .catch((error) => {
                console.error('Error resetting password:', error);
                throw error;
            });
    }
};
