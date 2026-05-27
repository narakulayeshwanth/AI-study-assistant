const Document = require('../models/Document');
const Flashcard = require('../models/Flashcard');
const Quiz = require('../models/Quiz');
const ChatHistory = require('../models/ChatHistory');
const StudyInsight = require('../models/StudyInsight');

// @desc   Get dashboard stats
// @route  GET /api/progress/stats
const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [
      totalDocuments,
      totalFlashcards,
      totalQuizzes,
      totalChatSessions,
      completedQuizzes,
      favoriteFlashcards,
    ] = await Promise.all([
      Document.countDocuments({ userId }),
      Flashcard.countDocuments({ userId }),
      Quiz.countDocuments({ userId }),
      ChatHistory.countDocuments({ userId }),
      Quiz.find({ userId, isCompleted: true }).select('score'),
      Flashcard.countDocuments({ userId, isFavorite: true }),
    ]);

    const avgQuizScore =
      completedQuizzes.length > 0
        ? Math.round(completedQuizzes.reduce((s, q) => s + (q.score || 0), 0) / completedQuizzes.length)
        : 0;

    res.json({
      stats: {
        totalDocuments,
        totalFlashcards,
        totalQuizzes,
        totalChatSessions,
        completedQuizzes: completedQuizzes.length,
        avgQuizScore,
        favoriteFlashcards,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get recent activity feed
// @route  GET /api/progress/activity
const getActivity = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;

    const [recentDocs, recentQuizzes, recentChats] = await Promise.all([
      Document.find({ userId }).sort('-createdAt').limit(limit).select('title fileType createdAt'),
      Quiz.find({ userId, isCompleted: true }).sort('-completedAt').limit(limit).select('title score completedAt'),
      ChatHistory.find({ userId }).sort('-updatedAt').limit(limit).select('title messageCount updatedAt'),
    ]);

    const activity = [
      ...recentDocs.map(d => ({ type: 'upload', title: d.title, fileType: d.fileType, date: d.createdAt })),
      ...recentQuizzes.map(q => ({ type: 'quiz', title: q.title, score: q.score, date: q.completedAt })),
      ...recentChats.map(c => ({ type: 'chat', title: c.title, messages: c.messageCount, date: c.updatedAt })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);

    res.json({ activity });
  } catch (error) {
    next(error);
  }
};

// @desc   Get quiz performance chart data
// @route  GET /api/progress/quiz-performance
const getQuizPerformance = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ userId: req.user._id, isCompleted: true })
      .sort('completedAt')
      .limit(20)
      .select('title score correctAnswers totalQuestions completedAt difficulty');

    res.json({ quizzes });
  } catch (error) {
    next(error);
  }
};

// @desc   Get document-level stats
// @route  GET /api/progress/document/:docId
const getDocumentStats = async (req, res, next) => {
  try {
    const docId = req.params.docId;
    const userId = req.user._id;

    const [doc, flashcardCount, quizzes, chatCount] = await Promise.all([
      Document.findOne({ _id: docId, userId }).select('title viewCount wordCount pageCount createdAt'),
      Flashcard.countDocuments({ documentId: docId, userId }),
      Quiz.find({ documentId: docId, userId, isCompleted: true }).select('score'),
      ChatHistory.countDocuments({ documentId: docId, userId }),
    ]);

    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const avgScore = quizzes.length
      ? Math.round(quizzes.reduce((s, q) => s + (q.score || 0), 0) / quizzes.length)
      : null;

    res.json({
      document: doc,
      flashcardCount,
      quizAttempts: quizzes.length,
      avgQuizScore: avgScore,
      chatSessions: chatCount,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getActivity, getQuizPerformance, getDocumentStats };
