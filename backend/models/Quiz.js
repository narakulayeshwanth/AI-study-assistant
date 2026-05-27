const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctIndex: { type: Number, required: true, min: 0, max: 3 },
  explanation: { type: String, default: '' },
  userAnswer: { type: Number, default: null }, // index chosen by user
});

const quizSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true, index: true },
    title: { type: String, default: 'Generated Quiz' },
    questions: [questionSchema],
    score: { type: Number, default: null }, // percentage 0-100
    totalQuestions: { type: Number },
    correctAnswers: { type: Number, default: null },
    timeTaken: { type: Number, default: null }, // seconds
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
    aiProvider: { type: String, enum: ['openai', 'gemini'] },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'mixed'], default: 'mixed' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
