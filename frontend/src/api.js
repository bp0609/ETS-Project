import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadCourse = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post(`${API_BASE_URL}/api/courses/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const getCourseThreads = async (courseId) => {
  const response = await api.get(`/api/courses/${courseId}/threads`);
  return response.data;
};

export const getThreadMessages = async (threadId) => {
  const response = await api.get(`/api/threads/${threadId}/messages`);
  return response.data;
};

export const askQuestion = async (threadId, question, userId) => {
  const response = await api.post(`/api/threads/${threadId}/ask`, { 
    question,
    user_id: userId 
  });
  return response.data;
};

export const getDashboardData = async (courseId) => {
  const response = await api.get(`/api/courses/${courseId}/dashboard`);
  return response.data;
};

export const getAllCourses = async () => {
  const response = await api.get('/api/courses');
  return response.data;
};

// Authentication APIs
export const login = async (name) => {
  const response = await api.post('/api/auth/login', { name });
  return response.data;
};

export const signup = async (name) => {
  const response = await api.post('/api/auth/signup', { name });
  return response.data;
};

export const getUserByName = async (name) => {
  const response = await api.get(`/api/auth/users/${name}`);
  return response.data;
};

// Lectures API
export const getAllLectures = async () => {
  const response = await api.get('/api/lectures');
  return response.data;
};

export default api;

