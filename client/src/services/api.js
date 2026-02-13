import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = '/api';

// Elegant Axios Instance with Interceptors
export const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Elegant Request Interceptor
api.interceptors.request.use(
    (config) => {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Elegant Response Interceptor
api.interceptors.response.use(
    (response) => {
        const { data } = response;

        // Handle elegant response format
        if (data.success === false) {
            toast.error(data.message || 'Something went wrong');
            return Promise.reject(new Error(data.message || 'API Error'));
        }

        // Show success messages for POST/PUT/DELETE
        if (response.config.method !== 'get' && data.message) {
            toast.success(data.message);
        }

        console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
        return response;
    },
    (error) => {
        // Elegant Error Handling
        let errorMessage = 'Network error occurred';

        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 400:
                    errorMessage = data?.error || 'Invalid request data';
                    break;
                case 401:
                    errorMessage = 'Unauthorized access';
                    break;
                case 404:
                    errorMessage = data?.error || 'Resource not found';
                    break;
                case 409:
                    errorMessage = data?.error || 'Conflict occurred';
                    break;
                case 500:
                    errorMessage = data?.error || 'Server error occurred';
                    break;
                default:
                    errorMessage = data?.error || `Error ${status}`;
            }
        } else if (error.request) {
            errorMessage = 'No response from server';
        }

        toast.error(errorMessage);
        console.error('💥 API Error:', errorMessage);
        return Promise.reject(error);
    }
);

// Elegant Student API with Enhanced Methods
export const studentAPI = {
    addStudent: (data) => api.post('/students', data),
    getStudents: () => api.get('/students'),
    addMarks: (data) => api.post('/students/marks', data),
    getReport: (id) => api.get(`/students/${id}/report`),
    getSubjects: () => api.get('/students/subjects'),
    updateStudent: (id, data) => api.put(`/students/${id}`, data),
    deleteStudent: (id) => api.delete(`/students/${id}`),
};

// Elegant Shift API with Enhanced Methods  
export const shiftAPI = {
    addStaff: (data) => api.post('/shifts/staff', data),
    getStaff: () => api.get('/shifts/staff'),
    updateStaff: (id, data) => api.put(`/shifts/staff/${id}`, data),
    deleteStaff: (id) => api.delete(`/shifts/staff/${id}`),
    addShift: (data) => api.post('/shifts/definition', data),
    getShifts: () => api.get('/shifts/definition'),
    updateShift: (id, data) => api.put(`/shifts/definition/${id}`, data),
    deleteShift: (id) => api.delete(`/shifts/definition/${id}`),
    assignShift: (data) => api.post('/shifts/assign', data),
    getSchedule: (date) => api.get('/shifts/schedule', { params: { date } }),
    updateAssignment: (id, data) => api.put(`/shifts/assign/${id}`, data),
    deleteAssignment: (id) => api.delete(`/shifts/assign/${id}`),
};

// Elegant Health Check API
export const healthAPI = {
    check: () => axios.get(`${API_URL.replace('/api', '')}/health`),
    testDb: () => axios.get(`${API_URL.replace('/api', '')}/test-db`),
};

// Elegant Analytics API
export const analyticsAPI = {
    getDashboard: () => api.get('/analytics/dashboard')
};

// Elegant Auth API
export const authAPI = {
    studentLogin: (data) => api.post('/auth/student-login', data),
    teacherLogin: (institution_name, password) => api.post('/auth/teacher-login', { institution_name, password })
};

export default api;
