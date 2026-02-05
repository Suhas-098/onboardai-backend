import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth headers
api.interceptors.request.use(
    (config) => {
        const storedUser = localStorage.getItem('onboardai_user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            config.headers['X-User-Id'] = user.id;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for consistent error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // In a real app, we would handle global errors here (e.g., 401 Unauthorized)
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export const endpoints = {
    employees: {
        getAll: () => api.get('/employees'),
        getOne: (id) => api.get(`/employees/${id}`),
    },
    risks: {
        getAll: () => api.get('/risks'),
        getStats: () => api.get('/risks/stats'),
    },
    alerts: {
        getAll: () => api.get('/alerts'),
    },
    progress: {
        getByUser: (userId) => api.get(`/progress/user/${userId}`),
    }
};

export default api;
