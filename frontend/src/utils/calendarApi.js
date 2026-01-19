import axios from 'axios';

const API_URL = 'http://localhost:5001/api/v1/calendar';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const calendarAPI = {
    getAll: async (params) => {
        return await axios.get(API_URL, { ...getAuthHeader(), params });
    },
    create: async (data) => {
        return await axios.post(API_URL, data, getAuthHeader());
    },
    update: async (id, data) => {
        return await axios.put(`${API_URL}/${id}`, data, getAuthHeader());
    },
    delete: async (id) => {
        return await axios.delete(`${API_URL}/${id}`, getAuthHeader());
    }
};
