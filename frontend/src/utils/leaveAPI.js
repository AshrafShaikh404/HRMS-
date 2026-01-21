import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api/v1';

// Existing api instance and interceptors remain the same...
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const reqUrl = error.config?.url || '';
        const isAuthRequest = reqUrl.includes('/auth/login') || reqUrl.includes('/auth/register') || reqUrl.includes('/auth/me');

        if (status === 401 && !isAuthRequest) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Leave Management APIs
export const leaveAPI = {
    // Leave Types
    getLeaveTypes: () => api.get('/leaves/types'),
    createLeaveType: (data) => api.post('/leaves/types', data),
    updateLeaveType: (id, data) => api.put(`/leaves/types/${id}`, data),
    deleteLeaveType: (id) => api.delete(`/leaves/types/${id}`),

    // Leave Policies
    getLeavePolicies: () => api.get('/leaves/policies'),
    createLeavePolicy: (data) => api.post('/leaves/policies', data),
    updateLeavePolicy: (id, data) => api.put(`/leaves/policies/${id}`, data),

    // Leave Applications
    getLeaveBalance: () => api.get('/leaves/balance'),
    applyLeave: (data) => api.post('/leaves/apply', data),
    getLeaveHistory: (params) => api.get('/leaves/history', { params }),
    getPendingApprovals: () => api.get('/leaves/pending-approvals'),
    updateLeaveStatus: (id, data) => api.put(`/leaves/${id}/status`, data),
    cancelLeave: (id) => api.delete(`/leaves/${id}`)
};

// Export existing APIs (keep all existing exports)
export { api };
