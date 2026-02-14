import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL + '/api',
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
        if (error.response) {
            const { status } = error.response;

            // 401: Unauthorized -> Clear auth and redirect to login
            if (status === 401) {
                localStorage.removeItem('onboardai_user');
                localStorage.removeItem('onboardai_token'); // Just in case
                // Avoid loop if already on login
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }

            // 403: Forbidden -> Logic usually requires UI notification
            if (status === 403) {
                console.warn("Permission denied: You do not have access to this resource.");
                // Dispatch a custom event for the UI to catch if needed
                window.dispatchEvent(new CustomEvent('api-error', { detail: 'You do not have permission to perform this action.' }));
            }

            // 404: Not Found
            if (status === 404) {
                console.warn("Resource not found:", error.config.url);
            }
        }

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
        sendAlert: (id, data) => api.post(`/employees/${id}/send-alert`, data),
        sendEmail: (id, data) => api.post(`/employees/${id}/send-email`, data),
    },
    risks: {
        getAll: () => api.get('/risks'),
        getStats: () => api.get('/risks/stats'),
    },
    reports: {
        getSummary: () => api.get('/reports/summary'),
        getWeeklyRiskTrend: () => api.get('/reports/weekly-risk-trend'),
        getPDF: () => api.get('/reports/download/pdf', { responseType: 'blob' }),
        getCSV: () => api.get('/reports/download/csv', { responseType: 'blob' }),
        getExcel: () => api.get('/reports/download/excel', { responseType: 'blob' }),
    },
    dashboard: {
        getSummary: () => api.get('/dashboard/summary'),
        getRiskTrend: () => api.get('/dashboard/risk-trend'),
        getRiskHeatmap: () => api.get('/dashboard/risk-heatmap'),
        getTopImproved: () => api.get('/dashboard/top-improved'),
        getCriticalFocus: () => api.get('/dashboard/critical-focus'),
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
    },
    templates: {
        getAll: () => api.get('/templates'),
        create: (data) => api.post('/templates', data),
        getOne: (id) => api.get(`/templates/${id}`),
        delete: (id) => api.delete(`/templates/${id}`),
        update: (id, data) => api.put(`/templates/${id}`, data),
        assign: (userId, templateId) => api.post(`/employees/${userId}/assign-template/${templateId}`),
    },
    ml: {
        predictRisk: (data) => api.post('/predict-risk', data),
        getSummary: () => api.get('/ml/prediction-summary'),
    }
};

export default api;
