import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // withCredentials: true, // Removed to avoid CORS issues with * origin
});

// Add a request interceptor to add the auth token to headers
api.interceptors.request.use(
    (config) => {
        let token = null;

        // Helper to extract token from storage
        const getTokenFromStorage = (storageName, keyPath = ['user', 'token']) => {
            try {
                const storage = localStorage.getItem(storageName);
                if (storage) {
                    const parsed = JSON.parse(storage);
                    let current = parsed.state;
                    for (const key of keyPath) {
                        if (current && current[key]) {
                            current = current[key];
                        } else {
                            return null;
                        }
                    }
                    return current; // This should be the token string
                }
            } catch (e) {
                return null;
            }
            return null;
        };

        // Check current path to decide priority
        const isAdminPath = window.location.pathname.startsWith('/admin');

        if (isAdminPath) {
            // Prioritize Admin Token
            token = getTokenFromStorage('admin-auth-storage', ['admin', 'token']);
            if (!token) token = getTokenFromStorage('auth-storage', ['user', 'token']);
        } else {
            // Prioritize User Token
            token = getTokenFromStorage('auth-storage', ['user', 'token']);
            if (!token) token = getTokenFromStorage('admin-auth-storage', ['admin', 'token']);
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
