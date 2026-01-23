import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api/v1';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const reqUrl = error.config?.url || '';

        // Don't auto-redirect for authentication endpoints (login/register/me)
        const isAuthRequest = reqUrl.includes('/auth/login') || reqUrl.includes('/auth/register') || reqUrl.includes('/auth/me');

        if (status === 401 && !isAuthRequest) {
            // Token expired or invalid for protected routes -> clear storage and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    googleLogin: (token) => api.post('/auth/google-login', { token }),
    logout: () => api.post('/auth/logout'),
    changePassword: (currentPassword, newPassword) =>
        api.post('/auth/change-password', { currentPassword, newPassword }),
    getMe: () => api.get('/auth/me'),
};

// Employee APIs
export const employeeAPI = {
    getAll: (params) => api.get('/employees', { params }),
    getById: (id) => api.get(`/employees/${id}`),
    getMyProfile: () => api.get('/employees/me'),
    create: (data) => api.post('/employees', data),
    update: (id, data) => api.put(`/employees/${id}`, data),
    delete: (id) => api.delete(`/employees/${id}`),
    uploadDocument: (id, formData) =>
        api.post(`/employees/${id}/documents`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    verifyDocument: (id, docId, data) => api.put(`/employees/${id}/documents/${docId}/verify`, data), // { status, rejectionReason }
};

// Attendance APIs
export const attendanceAPI = {
    checkIn: () => api.post('/attendance/check-in'),
    checkOut: () => api.post('/attendance/check-out'),
    getRecords: (params) => api.get('/attendance', { params }),
    manualEntry: (data) => api.post('/attendance/manual-entry', data),
    getReport: (params) => api.get('/attendance/report', { params }),
    bulkEntry: (data) => api.post('/attendance/bulk', data),
    toggleLock: (data) => api.post('/attendance/lock', data),
    exportCSV: (params) => api.get('/attendance/export/csv', { params, responseType: 'blob' }),
    exportPDF: (params) => api.get('/attendance/export/pdf', { params, responseType: 'blob' }),
};

// Leave APIs
export const leaveAPI = {
    getBalance: (employeeId) =>
        api.get('/leaves/balance', { params: { employeeId } }),
    apply: (data) => api.post('/leaves/apply', data),
    getPendingApprovals: () => api.get('/leaves/pending-approvals'),
    approve: (id) => api.put(`/leaves/${id}/approve`),
    reject: (id, reason) => api.put(`/leaves/${id}/reject`, { rejectionReason: reason }),
    getHistory: (params) => api.get('/leaves/history', { params }),
    cancel: (id) => api.delete(`/leaves/${id}`),
    exportCSV: (params) => api.get('/leaves/export/csv', { params, responseType: 'blob' }),
    exportPDF: (params) => api.get('/leaves/export/pdf', { params, responseType: 'blob' }),
};

// Payroll APIs
export const payrollAPI = {
    generate: (month, year, department, employeeId) =>
        api.post('/payroll/generate', { month, year, department, employeeId }),
    getPayslips: (month, year) => api.get(`/payroll/payslips/${month}/${year}`),
    getPayslip: (employeeId, month, year) =>
        api.get(`/payroll/payslip/${employeeId}/${month}/${year}`),
    getReports: (params) => api.get('/payroll/reports', { params }),
    updateStatus: (id, status) => api.put(`/payroll/${id}/status`, { status }),

    // Approval Flow
    approve: (id) => api.put(`/payroll/${id}/approve`),
    lock: (id) => api.put(`/payroll/${id}/lock`),

    // Download
    download: (id) => api.get(`/payroll/${id}/download`, { responseType: 'blob' }),

    exportCSV: (params) => api.get('/payroll/export/csv', { params, responseType: 'blob' }),
    exportPDF: (params) => api.get('/payroll/export/pdf', { params, responseType: 'blob' }),
};

// Dashboard APIs
export const dashboardAPI = {
    getAdminDashboard: () => api.get('/dashboard/admin'),
    getHRDashboard: () => api.get('/dashboard/hr'),
    getEmployeeDashboard: () => api.get('/dashboard/employee'),
};

// Helpdesk APIs
export const helpdeskAPI = {
    getTickets: (params) => api.get('/helpdesk', { params }),
    getTicket: (id) => api.get(`/helpdesk/${id}`),
    createTicket: (data) => api.post('/helpdesk', data),
    assignTicket: (id, assignedTo) => api.put(`/helpdesk/${id}/assign`, { assignedTo }),
    addUpdate: (id, comment) => api.post(`/helpdesk/${id}/update`, { comment }),
    resolveTicket: (id) => api.put(`/helpdesk/${id}/resolve`),
    closeTicket: (id) => api.put(`/helpdesk/${id}/close`),
    updatePriority: (id, priority) => api.put(`/helpdesk/${id}/priority`, { priority }),
};

// Recruitment APIs
export const recruitmentAPI = {
    // Job Postings
    getJobPostings: (params) => api.get('/recruitment/jobs', { params }),
    createJobPosting: (data) => api.post('/recruitment/jobs', data),
    updateJobPosting: (id, data) => api.put(`/recruitment/jobs/${id}`, data),

    // Candidates
    getCandidates: (params) => api.get('/recruitment/candidates', { params }),
    getCandidateById: (id) => api.get(`/recruitment/candidates/${id}`),
    updateCandidateStatus: (id, status) => api.put(`/recruitment/candidates/${id}`, { status }),
    convertToEmployee: (id) => api.post(`/recruitment/candidates/${id}/convert`),

    // Public
    submitApplication: (formData) => api.post('/recruitment/apply', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

// Role & Permission APIs
export const roleAPI = {
    getRoles: () => api.get('/roles'),
    createRole: (data) => api.post('/roles', data),
    updateRole: (id, data) => api.put(`/roles/${id}`, data),
    getPermissions: () => api.get('/roles/permissions'),
    assignRole: (userId, roleId) => api.post('/roles/assign', { userId, roleId }),
};

// Department APIs
export const departmentAPI = {
    getAll: () => api.get('/departments'),
    create: (data) => api.post('/departments', data),
    update: (id, data) => api.put(`/departments/${id}`, data),
    delete: (id) => api.delete(`/departments/${id}`),
};

// Designation APIs
export const designationAPI = {
    getAll: (departmentId) => api.get('/designations', { params: { departmentId } }),
    create: (data) => api.post('/designations', data),
    update: (id, data) => api.put(`/designations/${id}`, data),
    delete: (id) => api.delete(`/designations/${id}`),
};

// Location APIs
export const locationAPI = {
    getAll: () => api.get('/locations'),
    create: (data) => api.post('/locations', data),
    update: (id, data) => api.put(`/locations/${id}`, data),
    delete: (id) => api.delete(`/locations/${id}`),
};

// Goal APIs
export const goalAPI = {
    getAll: (params) => api.get('/goals', { params }),
    getMyGoals: () => api.get('/goals/my'),
    create: (data) => api.post('/goals', data),
    update: (id, data) => api.put(`/goals/${id}`, data),
    updateProgress: (id, progress, comment) =>
        api.patch(`/goals/${id}/progress`, { progress, comment }), // Uses PATCH
    delete: (id) => api.delete(`/goals/${id}`),
};

// Review Cycle APIs
export const reviewCycleAPI = {
    getAll: () => api.get('/review-cycles'),
    create: (data) => api.post('/review-cycles', data),
    update: (id, data) => api.put(`/review-cycles/${id}`, data),
    delete: (id) => api.delete(`/review-cycles/${id}`),
    getReviewCycles: () => api.get('/review-cycles'), // Alias for consistency
};

// Performance Review APIs
export const performanceReviewAPI = {
    // Initialize review for employee
    initReview: (data) => api.post('/performance-reviews/init', data),
    
    // Get reviews based on role
    getMyReview: () => api.get('/performance-reviews/my'),
    getTeamReviews: (filters) => api.get('/performance-reviews/team', { params: filters }),
    getAllReviews: (filters) => api.get('/performance-reviews/all', { params: filters }),
    
    // Submit reviews
    submitSelfReview: (data) => api.patch('/performance-reviews/self', data),
    submitManagerReview: (data) => api.patch('/performance-reviews/manager', data),
    submitHRReview: (data) => api.patch('/performance-reviews/hr', data),
    
    // Finalize review
    finalizeReview: (data) => api.patch('/performance-reviews/finalize', data),
    
    // Legacy endpoints (for backward compatibility)
    get: (id) => api.get(`/performance-reviews/${id}`),
    getAll: (params) => api.get('/performance-reviews', { params }),
    create: (data) => api.post('/performance-reviews', data),
    updateSelfReview: (id, data) => api.put(`/performance-reviews/${id}/self-review`, data),
    updateManagerReview: (id, data) => api.put(`/performance-reviews/${id}/manager-review`, data),
    updateHRReview: (id, data) => api.put(`/performance-reviews/${id}/hr-review`, data),
    finalize: (id) => api.put(`/performance-reviews/${id}/finalize`),
};

export default api;
