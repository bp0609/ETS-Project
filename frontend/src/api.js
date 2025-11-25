import axios from 'axios';

// Use environment variable if set, otherwise use current host with port 8000
const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 second timeout (AI can take 15-30 seconds)
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`;
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Request timeout - backend may be slow or not responding');
    } else if (error.code === 'ERR_NETWORK') {
      console.error(`🌐 Network error - check if backend is running at ${apiUrl}`);
    } else if (!error.response) {
      console.error('❌ No response from server - backend may be down');
    }
    return Promise.reject(error);
  }
);

// Thread & Discussion APIs
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

// Authentication APIs
export const login = async (name) => {
  const response = await api.post('/api/auth/login', { name });
  return response.data;
};

export const signup = async (name, email, phone) => {
  const response = await api.post('/api/auth/signup', { name, email, phone });
  return response.data;
};

export const getUserByName = async (name) => {
  const response = await api.get(`/api/auth/users/${name}`);
  return response.data;
};

// Announcement APIs
export const createAnnouncement = async (teacherId, title, content) => {
  const response = await api.post('/api/announcements', {
    teacher_id: teacherId,
    title,
    content
  });
  return response.data;
};

export const createAnnouncementWithPDF = async (teacherId, title, content, file) => {
  const formData = new FormData();
  formData.append('teacher_id', teacherId);
  formData.append('title', title);
  formData.append('content', content);
  formData.append('file', file);

  const response = await axios.post(`${API_BASE_URL}/api/announcements/with-pdf`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 60000, // 60 second timeout for PDF processing
  });

  return response.data;
};

export const getAllAnnouncements = async () => {
  const response = await api.get('/api/announcements');
  return response.data;
};

export const getAnnouncement = async (announcementId) => {
  const response = await api.get(`/api/announcements/${announcementId}`);
  return response.data;
};

// Polling APIs
export const voteOnTopic = async (threadId, studentId, understandingLevel) => {
  const response = await api.post(`/api/topics/${threadId}/poll`, {
    student_id: studentId,
    understanding_level: understandingLevel
  });
  return response.data;
};

export const getPollResults = async (threadId, studentId = null) => {
  const params = studentId ? { student_id: studentId } : {};
  const response = await api.get(`/api/topics/${threadId}/poll`, { params });
  return response.data;
};

export const getTopicHelpers = async (threadId) => {
  const response = await api.get(`/api/topics/${threadId}/helpers`);
  return response.data;
};

export const getStudentsByLevel = async (threadId, understandingLevel) => {
  const response = await api.get(`/api/topics/${threadId}/students/${understandingLevel}`);
  return response.data;
};

// Analytics APIs
export const getAnalytics = async () => {
  const response = await api.get('/api/analytics');
  return response.data;
};

export default api;

