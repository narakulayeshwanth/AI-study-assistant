const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Parse JSON safely from AI response (strips code fences)
 */
const parseAIJson = (raw) => {
  try {
    // Strip markdown code fences if present
    const cleaned = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error(`Failed to parse AI response as JSON: ${e.message}`);
  }
};

/**
 * Select AI provider based on task or user preference
 * 'auto' → uses OpenAI by default (Gemini available if user explicitly selects it)
 */
const selectProvider = (userPreference = 'auto', task = '') => {
  if (userPreference === 'openai') return 'openai';
  if (userPreference === 'gemini') return 'gemini';
  // Auto: Gemini (free tier) for text tasks, OpenAI for JSON-structured tasks
  const geminiTasks = ['summarize', 'chat', 'insights'];
  return geminiTasks.includes(task) ? 'gemini' : 'openai';
};

/**
 * Format file size in human-readable form
 */
const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

module.exports = { generateToken, parseAIJson, selectProvider, formatFileSize };
