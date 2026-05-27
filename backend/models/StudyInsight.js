const mongoose = require('mongoose');

const studyInsightSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    recommendations: [{ type: String }],
    studyPlan: { type: String, default: '' },
    estimatedStudyTime: { type: String, default: '' },
    topicsToFocus: [{ type: String }],
    aiProvider: { type: String, enum: ['openai', 'gemini'] },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudyInsight', studyInsightSchema);
