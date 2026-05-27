const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    originalName: { type: String, required: true },
    filename: { type: String, required: true },
    fileType: { type: String, enum: ['pdf', 'docx', 'txt', 'pptx'], required: true },
    fileSize: { type: Number, required: true }, // bytes
    pageCount: { type: Number, default: 0 },
    wordCount: { type: Number, default: 0 },
    extractedText: { type: String, default: '' },
    summary: { type: String, default: '' },
    summaryGeneratedAt: { type: Date },
    aiProvider: { type: String, enum: ['openai', 'gemini'] },
    tags: [{ type: String, trim: true }],
    isProcessed: { type: Boolean, default: false },
    processingError: { type: String, default: '' },
    viewCount: { type: Number, default: 0 },
    lastAccessed: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Full-text search index
documentSchema.index({ title: 'text', tags: 'text' });

module.exports = mongoose.model('Document', documentSchema);
