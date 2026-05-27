import api from './api';

export const getStats = () => api.get('/progress/stats');
export const getActivity = (limit = 10) => api.get('/progress/activity', { params: { limit } });
export const getQuizPerformance = () => api.get('/progress/quiz-performance');
export const getDocumentStats = (docId) => api.get(`/progress/document/${docId}`);
