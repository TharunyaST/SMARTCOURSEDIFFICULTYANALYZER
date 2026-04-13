import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const ApiService = {
    // Auth
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    // Subjects
    getSubjects: async () => {
        const response = await api.get('/subjects');
        return response.data;
    },
    addSubject: async (code, name) => {
        const response = await api.post('/subjects', { code, name });
        return response.data;
    },
    deleteSubject: async (code) => {
        const response = await api.delete(`/subjects/${code}`);
        return response.data;
    },

    // Feedback
    submitFeedback: async (feedbackData) => {
        const response = await api.post('/feedback', feedbackData);
        return response.data;
    },

    // Materials
    addMaterial: async (materialData) => {
        const response = await api.post('/materials', materialData);
        return response.data;
    },
    markMaterialViewed: async (id) => {
        const response = await api.post(`/materials/${id}/view`);
        return response.data;
    },
    rateMaterial: async (id, rating) => {
        const response = await api.post(`/materials/${id}/rate`, { rating });
        return response.data;
    },

    // Notifications
    getNotifications: async () => {
        const response = await api.get('/notifications');
        return response.data;
    },
    markNotificationRead: async (id) => {
        const response = await api.post(`/notifications/${id}/read`);
        return response.data;
    },
    deleteNotification: async (id) => {
        const response = await api.delete(`/notifications/${id}`);
        return response.data;
    },
};

export default api;
