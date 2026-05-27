const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true, index: true },
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    isFavorite: { type: Boolean, default: false },
    timesReviewed: { type: Number, default: 0 },
    lastReviewed: { type: Date },
    confidence: { type: Number, min: 0, max: 5, default: 0 }, // spaced-repetition score
    aiProvider: { type: String, enum: ['openai', 'gemini'] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Flashcard', flashcardSchema);
