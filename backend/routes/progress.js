const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getStats,
  getActivity,
  getQuizPerformance,
  getDocumentStats,
} = require('../controllers/progressController');

router.get('/stats', protect, getStats);
router.get('/activity', protect, getActivity);
router.get('/quiz-performance', protect, getQuizPerformance);
router.get('/document/:docId', protect, getDocumentStats);

module.exports = router;
