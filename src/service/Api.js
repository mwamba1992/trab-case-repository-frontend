import axios from 'axios';
import { Config } from '@/utils/Config';


const API_BASE_URL = Config.API_BASE_URL;

// Create an Axios instance
const api = axios.create({
    baseURL: API_BASE_URL, // Replace with your API URL
    timeout: 10000, // Adjust timeout as needed
});

// Request Interceptor to append token
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('access_token');

        // If token exists, append it to the Authorization header
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        // Handle request error (if needed)
        return Promise.reject(error);
    }
);

// Response Interceptor to handle 401 Unauthorized (token expiration)
api.interceptors.response.use(
    (response) => {
        // Return the response as is if the request is successful
        return response;
    },
    async (error) => {
        // Check if the error is a 401 (Unauthorized)
        if (error.response && error.response.status === 401) {
            const originalRequest = error.config;

            // Prevent infinite loop - don't retry refresh endpoint
            if (originalRequest.url.includes('/auth/refresh') || originalRequest._retry) {
                // If refresh failed or already retried, redirect to login
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('userId');
                localStorage.removeItem('userName');
                localStorage.removeItem('permissions');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            // Mark request as retried
            originalRequest._retry = true;

            // Token might have expired or is invalid
            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
                try {
                    // Attempt to refresh the token by making a refresh request
                    const response = await api.post('/auth/refresh', { refreshToken });

                    // Get the new tokens from the response
                    const { accessToken, refreshToken: newRefreshToken } = response.data;

                    // Store the new tokens in localStorage
                    localStorage.setItem('access_token', accessToken);
                    localStorage.setItem('refresh_token', newRefreshToken);

                    // Update the original request's Authorization header with the new token
                    originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

                    // Retry the original request with the new token
                    return api(originalRequest);
                } catch (refreshError) {
                    // If refreshing the token fails, logout the user or redirect to login
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('userId');
                    localStorage.removeItem('userName');
                    localStorage.removeItem('permissions');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            } else {
                // No refresh token available, redirect to login
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('userId');
                localStorage.removeItem('userName');
                localStorage.removeItem('permissions');
                window.location.href = '/login';
            }
        }

        // If the error is not related to token expiration, reject it as usual
        return Promise.reject(error);
    }
);


// Function to refresh the token
const refreshToken = async (refreshToken) => {
    try {
        const response = await api.post('/auth/refresh', { refreshToken });
        const { newToken } = response.data;
        localStorage.setItem('access_token', newToken);  // Store new token in localStorage
        return newToken;
    } catch (error) {
        console.error('Token refresh failed:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';  // Redirect to login page
        throw error;  // rethrow the error after handling
    }
};

export default api;
