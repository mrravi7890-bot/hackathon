import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance
const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('tourism_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('tourism_token');
            localStorage.removeItem('tourism_user');
            window.location.href = '/admin/login';
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (name, email, password) => api.post('/auth/register', { name, email, password }),
    getMe: () => api.get('/auth/me'),
};

// Location APIs
export const locationAPI = {
    getAll: () => api.get('/locations'),
    getOne: (id) => api.get(`/locations/${id}`),
    create: (data) => api.post('/locations', data),
    update: (id, data) => api.put(`/locations/${id}`, data),
    delete: (id) => api.delete(`/locations/${id}`),
};

// Analytics APIs
export const analyticsAPI = {
    getFootfall: (locationId, period = 'daily') => 
        api.get('/analytics/footfall', { params: { location_id: locationId, period } }),
    getHeatmap: () => api.get('/analytics/heatmap'),
    getSummary: () => api.get('/analytics/summary'),
    getHourly: () => api.get('/analytics/hourly'),
};

// Feedback APIs
export const feedbackAPI = {
    submit: (data) => api.post('/feedback', data),
    getAll: (locationId) => api.get('/feedback', { params: { location_id: locationId } }),
};

// Export APIs
export const exportAPI = {
    downloadCSV: () => {
        const token = localStorage.getItem('tourism_token');
        return axios.get(`${API_BASE}/export/csv`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob',
        });
    },
    downloadPDF: () => {
        const token = localStorage.getItem('tourism_token');
        return axios.get(`${API_BASE}/export/pdf`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob',
        });
    },
};

export default api;
