import axios from 'axios';

// 1. Create a custom Axios instance
const api = axios.create({
    baseURL: 'http://localhost:8000/v1/user'
});

// 2. Add a Request Interceptor
// This automatically attaches the Access Token to every single request so you don't have to do it manually anymore!
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// 3. Add a Response Interceptor (The Refresh Logic)
api.interceptors.response.use(
    (response) => response, // If the request succeeds, just return the data
    async (error) => {
        const originalRequest = error.config;

        // If the error is 401 (Unauthorized) and we haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Mark it so we don't get stuck in an infinite loop

            try {
                const refresh_token = localStorage.getItem('refresh_token');
                
                // Hit our new backend route
                const response = await axios.post('http://localhost:8000/v1/user/refresh', {
                    refresh_token: refresh_token
                });

                // Save the new VIP pass to the vault
                const access_token = response.data.access_token;
                localStorage.setItem('access_token', access_token);

                // Update the original failed request with the new token and try again!
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return api(originalRequest);

            } catch (refreshError) {
                // If the refresh token is ALSO dead (7 days passed), clear everything and kick to login
                console.error("Refresh token expired. Kicking to login.");
                localStorage.clear();
                window.location.href = '/login'; 
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;