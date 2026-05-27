const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const chatHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true, index: true },
    title: { type: String, default: 'New Chat' },
    messages: [messageSchema],
    aiProvider: { type: String, enum: ['openai', 'gemini'], default: 'gemini' },
    messageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Update message count on save
chatHistorySchema.pre('save', function (next) {
  this.messageCount = this.messages.length;
  next();
});

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
