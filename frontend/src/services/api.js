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
            const userData = JSON.parse(storedUser);
            if (userData.token) {
                config.headers['Authorization'] = `Bearer ${userData.token}`;
            }
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
        getTasks: (id) => api.get(`/employees/${id}/tasks`),
        getActivity: (id) => api.get(`/employees/${id}/activity`),
    },
    risks: {
        getAll: () => api.get('/risks'),
        getStats: () => api.get('/risks/stats'),
    },
    alerts: {
        getAll: () => api.get('/alerts'),
        create: (data) => api.post('/alerts', data),
    },
    progress: {
        getByUser: (userId) => api.get(`/progress/user/${userId}`),
    },
    tasks: {
        complete: (taskId) => api.post(`/tasks/${taskId}/complete`),
        assign: (data) => api.post(`/tasks/assign`, data),
        getMessages: (taskId) => api.get(`/tasks/${taskId}/messages`),
        postMessage: (taskId, data) => api.post(`/tasks/${taskId}/messages`, data),
        update: (taskId, data) => api.put(`/tasks/${taskId}`, data),
    },
    notifications: {
        getAll: (userId) => api.get(`/notifications?user_id=${userId}`),
        markRead: (id) => api.put(`/notifications/${id}/read`),
        create: (data) => api.post('/notifications', data),
    },
    search: {
        query: (scope, query, userId) => api.get(`/search?scope=${scope}&query=${query}&user_id=${userId}`),
    }
};

export default api;
