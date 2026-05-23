import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const signup = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);
export const getProfile = () => api.get('/auth/profile');

// Journal
export const createEntry = (data) => api.post('/journal/', data);
export const getEntries = () => api.get('/journal/');

// Goals
export const createGoal = (data) => api.post('/goals/', data);
export const getGoals = () => api.get('/goals/');
export const updateGoal = (id, data) => api.patch(`/goals/${id}`, data);

// Analytics
export const getSummary = () => api.get('/analytics/summary');
export const getPatterns = () => api.get('/analytics/patterns');