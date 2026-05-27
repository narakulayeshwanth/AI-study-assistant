import api from './api';

// Summary
export const summarize = (docId) => api.post(`/ai/summarize/${docId}`);

// Flashcards
export const generateFlashcards = (docId, count = 10) => api.post(`/ai/flashcards/${docId}`, { count });
export const getFlashcards = (docId) => api.get(`/ai/flashcards/${docId}`);
export const toggleFavorite = (cardId) => api.patch(`/ai/flashcards/${cardId}/favorite`);

// Quiz
export const generateQuiz = (docId, count = 10, difficulty = 'mixed') =>
  api.post(`/ai/quiz/${docId}`, { count, difficulty });
export const getQuizzes = (docId) => api.get(`/ai/quiz/${docId}`);
export const submitQuiz = (quizId, answers, timeTaken) =>
  api.post(`/ai/quiz/${quizId}/submit`, { answers, timeTaken });

// Chat
export const sendChatMessage = (docId, message, sessionId = null) =>
  api.post(`/ai/chat/${docId}`, { message, sessionId });
export const getChatSessions = (docId) => api.get(`/ai/chat/${docId}/sessions`);
export const getChatSession = (sessionId) => api.get(`/ai/chat/session/${sessionId}`);

// Insights
export const generateInsights = (docId) => api.post(`/ai/insights/${docId}`);
export const getInsights = (docId) => api.get(`/ai/insights/${docId}`);
