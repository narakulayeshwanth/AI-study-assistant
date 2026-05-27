const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  summarize,
  generateFlashcards,
  getFlashcards,
  toggleFavorite,
  generateQuiz,
  getQuizzes,
  submitQuiz,
  chat,
  getChatSessions,
  getChatSession,
  generateInsights,
  getInsights,
} = require('../controllers/aiController');

// Summary
router.post('/summarize/:docId', protect, summarize);

// Flashcards
router.post('/flashcards/:docId', protect, generateFlashcards);
router.get('/flashcards/:docId', protect, getFlashcards);
router.patch('/flashcards/:cardId/favorite', protect, toggleFavorite);

// Quiz
router.post('/quiz/:docId', protect, generateQuiz);
router.get('/quiz/:docId', protect, getQuizzes);
router.post('/quiz/:quizId/submit', protect, submitQuiz);

// Chat
router.post('/chat/:docId', protect, chat);
router.get('/chat/:docId/sessions', protect, getChatSessions);
router.get('/chat/session/:sessionId', protect, getChatSession);

// Insights
router.post('/insights/:docId', protect, generateInsights);
router.get('/insights/:docId', protect, getInsights);

module.exports = router;
