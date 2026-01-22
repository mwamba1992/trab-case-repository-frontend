import axios from 'axios';
import { Config } from '@/utils/Config';

const API_URL = `${Config.API_BASE_URL}/auth`;

class AuthService {
    /**
     * Register a new user
     * POST /api/v1/auth/register
     * @param {Object} userData - User registration data
     * @returns {Promise} Registration response
     */
    async register(userData) {
        try {
            const response = await axios.post(`${API_URL}/register`, userData);
            return response.data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    /**
     * Login with email and password
     * POST /api/v1/auth/login
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise} Login response with tokens
     */
    async login(email, password) {
        try {
            const response = await axios.post(`${API_URL}/login`, { email, password });

            // Backend returns accessToken and refreshToken (camelCase)
            if (response.data.accessToken) {
                // Store tokens
                localStorage.setItem('access_token', response.data.accessToken);
                localStorage.setItem('refresh_token', response.data.refreshToken);

                // Decode and store user details
                const userDetails = this.decodeToken(response.data.accessToken);
                localStorage.setItem('userId', userDetails.sub);
                localStorage.setItem('userName', userDetails.username || userDetails.email);

                // Store role if available
                if (userDetails.role) {
                    localStorage.setItem('userRole', userDetails.role);
                }

                // Store permissions if available
                if (userDetails.permissions) {
                    const permissions = Array.isArray(userDetails.permissions)
                        ? userDetails.permissions.map(p => p.name || p)
                        : [];
                    localStorage.setItem('permissions', permissions.join(','));
                }
            }

            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    /**
     * Refresh access token using refresh token
     * POST /api/v1/auth/refresh
     * @returns {Promise} New access token
     */
    async refreshToken() {
        try {
            const refreshToken = localStorage.getItem('refresh_token');

            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            // Backend expects { refreshToken } (camelCase)
            const response = await axios.post(`${API_URL}/refresh`, { refreshToken });

            // Backend returns accessToken and refreshToken (camelCase)
            if (response.data.accessToken) {
                localStorage.setItem('access_token', response.data.accessToken);
                localStorage.setItem('refresh_token', response.data.refreshToken);

                // Update user details if needed
                const userDetails = this.decodeToken(response.data.accessToken);
                localStorage.setItem('userId', userDetails.sub);
                localStorage.setItem('userName', userDetails.username || userDetails.email);

                // Update role if available
                if (userDetails.role) {
                    localStorage.setItem('userRole', userDetails.role);
                }
            }

            return response.data;
        } catch (error) {
            console.error('Token refresh error:', error);
            // If refresh fails, logout user
            this.logout();
            throw error;
        }
    }

    /**
     * Change user password
     * POST /api/v1/auth/change-password
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Promise} Change password response
     */
    async changePassword(currentPassword, newPassword) {
        try {
            const response = await axios.post(`${API_URL}/change-password`, {
                currentPassword,
                newPassword
            }, {
                headers: this.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Change password error:', error);
            throw error;
        }
    }

    /**
     * Get current user profile
     * GET /api/v1/auth/me
     * @returns {Promise} User profile data
     */
    async getCurrentUser() {
        try {
            const response = await axios.get(`${API_URL}/me`, {
                headers: this.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Get current user error:', error);
            throw error;
        }
    }

    /**
     * Logout (client-side token removal)
     * POST /api/v1/auth/logout
     * @returns {Promise} Logout response
     */
    async logout() {
        try {
            // Call backend logout endpoint
            await axios.post(`${API_URL}/logout`, {}, {
                headers: this.getAuthHeaders()
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local storage regardless of API response
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');
            localStorage.removeItem('userRole');
            localStorage.removeItem('permissions');
        }
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} Authentication status
     */
    isAuthenticated() {
        const token = localStorage.getItem('access_token');
        if (!token) return false;

        try {
            const decoded = this.decodeToken(token);
            // Check if token is expired
            const currentTime = Date.now() / 1000;
            return decoded.exp > currentTime;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get current access token
     * @returns {string|null} Access token
     */
    getAccessToken() {
        return localStorage.getItem('access_token');
    }

    /**
     * Get authorization headers
     * @returns {Object} Headers with Bearer token
     */
    getAuthHeaders() {
        const token = this.getAccessToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    /**
     * Decode JWT token
     * @param {string} token - JWT token
     * @returns {Object} Decoded token payload
     */
    decodeToken(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Token decode error:', error);
            throw error;
        }
    }

    /**
     * Get user permissions
     * @returns {Array} User permissions
     */
    getPermissions() {
        const permissions = localStorage.getItem('permissions');
        return permissions ? permissions.split(',') : [];
    }

    /**
     * Check if user has specific permission
     * @param {string} permission - Permission name
     * @returns {boolean} Has permission
     */
    hasPermission(permission) {
        const permissions = this.getPermissions();
        return permissions.includes(permission);
    }

    /**
     * Get user role
     * @returns {string|null} User role
     */
    getUserRole() {
        return localStorage.getItem('userRole');
    }

    /**
     * Check if user has specific role
     * @param {string} role - Role name
     * @returns {boolean} Has role
     */
    hasRole(role) {
        return this.getUserRole() === role;
    }

    /**
     * Check if user is admin
     * @returns {boolean} Is admin
     */
    isAdmin() {
        return this.hasRole('admin');
    }
}

export default new AuthService();
