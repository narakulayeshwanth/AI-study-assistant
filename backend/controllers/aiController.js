const Document = require('../models/Document');
const Flashcard = require('../models/Flashcard');
const Quiz = require('../models/Quiz');
const ChatHistory = require('../models/ChatHistory');
const StudyInsight = require('../models/StudyInsight');
const { getNvidiaClient } = require('../config/openrouter');
const { parseAIJson } = require('../utils/helpers');
const { truncateText } = require('../utils/textExtractor');

// ─── AI call via NVIDIA NIM ───────────────────────────────────────────────────
const aiGenerate = async (messages) => {
  const client = getNvidiaClient();
  const res = await client.chat.completions.create({
    model: 'meta/llama-3.3-70b-instruct',
    messages,
    temperature: 0.7,
    max_tokens: 4096,
  });
  return res.choices[0].message.content;
};

// ─── Robust JSON extractor (handles code fences + raw JSON) ─────────────────
const extractJSON = (raw) => {
  if (!raw) throw new Error('Empty response from AI');

  // 1. Try direct parse first
  try { return JSON.parse(raw.trim()); } catch (_) {}

  // 2. Strip markdown code fences
  const stripped = raw
    .replace(/^```(?:json)?\s*/im, '')
    .replace(/\s*```\s*$/im, '')
    .trim();
  try { return JSON.parse(stripped); } catch (_) {}

  // 3. Extract the first { ... } or [ ... ] block via regex
  const objMatch = raw.match(/\{[\s\S]*\}/);
  if (objMatch) try { return JSON.parse(objMatch[0]); } catch (_) {}

  const arrMatch = raw.match(/\[[\s\S]*\]/);
  if (arrMatch) try { return JSON.parse(arrMatch[0]); } catch (_) {}

  throw new Error('Could not parse JSON from AI response');
};

// ─── Helper: Get document or 404 ─────────────────────────────────────────────
const getDoc = async (docId, userId) => {
  const doc = await Document.findOne({ _id: docId, userId });
  if (!doc) throw Object.assign(new Error('Document not found'), { status: 404 });
  if (!doc.extractedText) throw Object.assign(new Error('Document text not extracted yet'), { status: 422 });
  return doc;
};

// ═══════════════════════════════════════════════════════════════
// @route POST /api/ai/summarize/:docId
// ═══════════════════════════════════════════════════════════════
const summarize = async (req, res, next) => {
  try {
    const doc = await getDoc(req.params.docId, req.user._id);
    const text = truncateText(doc.extractedText, 14000);

    const messages = [
      { role: 'system', content: 'You are an expert academic summarizer helping students study effectively. Format your response using markdown: use **bold** for key terms, ## for section headings, and bullet points (- item) for lists.' },
      { role: 'user', content: `Summarize the following study material. Structure your response with these sections:\n## Overview\n(2-3 sentence overview paragraph)\n\n## Key Concepts\n(bullet list of key concepts)\n\n## Important Definitions\n(bullet list of definitions)\n\n## Main Takeaways\n(bullet list of takeaways)\n\nDocument: ${doc.title}\n\n${text}` },
    ];

    const summary = await aiGenerate(messages);
    if (!summary || summary.trim().length < 10) throw new Error('AI returned empty summary');

    doc.summary = summary;
    doc.summaryGeneratedAt = new Date();
    await doc.save({ validateBeforeSave: false });

    res.json({ summary, generatedAt: new Date() });
  } catch (error) {
    console.error('[summarize error]', error.message);
    if (error.status) return res.status(error.status).json({ error: error.message });
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════
// @route POST /api/ai/flashcards/:docId
// ═══════════════════════════════════════════════════════════════
const generateFlashcards = async (req, res, next) => {
  try {
    const doc = await getDoc(req.params.docId, req.user._id);
    const { count = 10 } = req.body;
    const text = truncateText(doc.extractedText, 12000);

    const messages = [
      { role: 'system', content: 'You are a flashcard generator. You must respond with ONLY valid JSON — no explanation, no markdown, no code fences. Start your response directly with { and end with }' },
      { role: 'user', content: `Generate exactly ${count} flashcards from this study material.\n\nRespond with ONLY this JSON structure (no other text):\n{"flashcards":[{"question":"...","answer":"...","difficulty":"easy"}]}\n\nDifficulty must be one of: easy, medium, hard\n\nMaterial (${doc.title}):\n${text}` },
    ];

    const raw = await aiGenerate(messages);
    console.log('[flashcards raw]', raw?.substring(0, 200));

    const parsed = extractJSON(raw);
    const cards = (parsed.flashcards || parsed).slice(0, count);

    if (!Array.isArray(cards) || cards.length === 0) throw new Error('AI returned no flashcards');

    await Flashcard.deleteMany({ documentId: doc._id, userId: req.user._id });
    const flashcards = await Flashcard.insertMany(
      cards.map(c => ({
        userId: req.user._id,
        documentId: doc._id,
        question: c.question || 'Question missing',
        answer: c.answer || 'Answer missing',
        difficulty: ['easy', 'medium', 'hard'].includes(c.difficulty) ? c.difficulty : 'medium',
      }))
    );

    res.json({ flashcards, count: flashcards.length });
  } catch (error) {
    console.error('[flashcards error]', error.message);
    if (error.status) return res.status(error.status).json({ error: error.message });
    res.status(500).json({ error: `Flashcard generation failed: ${error.message}` });
  }
};

const getFlashcards = async (req, res, next) => {
  try {
    const flashcards = await Flashcard.find({ documentId: req.params.docId, userId: req.user._id });
    res.json({ flashcards, count: flashcards.length });
  } catch (error) { next(error); }
};

const toggleFavorite = async (req, res, next) => {
  try {
    const card = await Flashcard.findOne({ _id: req.params.cardId, userId: req.user._id });
    if (!card) return res.status(404).json({ error: 'Flashcard not found' });
    card.isFavorite = !card.isFavorite;
    await card.save();
    res.json({ isFavorite: card.isFavorite });
  } catch (error) { next(error); }
};

// ═══════════════════════════════════════════════════════════════
// @route POST /api/ai/quiz/:docId
// ═══════════════════════════════════════════════════════════════
const generateQuiz = async (req, res, next) => {
  try {
    const doc = await getDoc(req.params.docId, req.user._id);
    const { count = 10, difficulty = 'mixed' } = req.body;
    const text = truncateText(doc.extractedText, 12000);
    const difficultyNote = difficulty === 'mixed' ? 'a mix of easy, medium, and hard' : difficulty;

    const messages = [
      { role: 'system', content: 'You are an exam question generator. You must respond with ONLY valid JSON — no explanation, no markdown, no code fences. Start your response directly with { and end with }' },
      { role: 'user', content: `Generate exactly ${count} multiple-choice questions of ${difficultyNote} difficulty.\n\nRespond with ONLY this JSON structure (no other text):\n{"questions":[{"question":"...","options":["A. option1","B. option2","C. option3","D. option4"],"correctIndex":0,"explanation":"..."}]}\n\ncorrectIndex is 0-based (0=A, 1=B, 2=C, 3=D)\n\nMaterial (${doc.title}):\n${text}` },
    ];

    const raw = await aiGenerate(messages);
    console.log('[quiz raw]', raw?.substring(0, 200));

    const parsed = extractJSON(raw);
    const questions = (parsed.questions || parsed).slice(0, count);

    if (!Array.isArray(questions) || questions.length === 0) throw new Error('AI returned no quiz questions');

    const quiz = await Quiz.create({
      userId: req.user._id,
      documentId: doc._id,
      title: `Quiz: ${doc.title}`,
      questions,
      totalQuestions: questions.length,
      difficulty,
    });

    res.status(201).json({ quiz });
  } catch (error) {
    console.error('[quiz error]', error.message);
    if (error.status) return res.status(error.status).json({ error: error.message });
    res.status(500).json({ error: `Quiz generation failed: ${error.message}` });
  }
};

const getQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ documentId: req.params.docId, userId: req.user._id })
      .sort('-createdAt').select('-questions.userAnswer');
    res.json({ quizzes });
  } catch (error) { next(error); }
};

const submitQuiz = async (req, res, next) => {
  try {
    const { answers, timeTaken } = req.body;
    const quiz = await Quiz.findOne({ _id: req.params.quizId, userId: req.user._id });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    let correct = 0;
    quiz.questions = quiz.questions.map((q, i) => {
      const answer = answers.find(a => a.questionIndex === i);
      const selected = answer?.selectedIndex ?? null;
      if (selected === q.correctIndex) correct++;
      return { ...q.toObject(), userAnswer: selected };
    });

    quiz.correctAnswers = correct;
    quiz.score = Math.round((correct / quiz.totalQuestions) * 100);
    quiz.timeTaken = timeTaken || null;
    quiz.isCompleted = true;
    quiz.completedAt = new Date();
    await quiz.save();

    res.json({ score: quiz.score, correctAnswers: quiz.correctAnswers, totalQuestions: quiz.totalQuestions, timeTaken: quiz.timeTaken, questions: quiz.questions });
  } catch (error) { next(error); }
};

// ═══════════════════════════════════════════════════════════════
// @route POST /api/ai/chat/:docId
// ═══════════════════════════════════════════════════════════════
const chat = async (req, res, next) => {
  try {
    const doc = await getDoc(req.params.docId, req.user._id);
    const { message, sessionId } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message is required' });

    const docContext = truncateText(doc.extractedText, 10000);

    let session = sessionId
      ? await ChatHistory.findOne({ _id: sessionId, userId: req.user._id })
      : null;

    if (!session) {
      session = await ChatHistory.create({
        userId: req.user._id,
        documentId: doc._id,
        title: message.substring(0, 50) + '...',
        messages: [],
      });
    }

    session.messages.push({ role: 'user', content: message });
    const recentMessages = session.messages.slice(-10);

    const messages = [
      { role: 'system', content: `You are an intelligent study assistant. Use ONLY the following document to answer questions. If the answer is not in the document, say so clearly.\n\nDocument: "${doc.title}"\n---\n${docContext}\n---` },
      ...recentMessages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
    ];

    const aiResponse = await aiGenerate(messages);

    session.messages.push({ role: 'assistant', content: aiResponse });
    await session.save();

    res.json({ response: aiResponse, sessionId: session._id });
  } catch (error) {
    console.error('[chat error]', error.message);
    if (error.status) return res.status(error.status).json({ error: error.message });
    next(error);
  }
};

const getChatSessions = async (req, res, next) => {
  try {
    const sessions = await ChatHistory.find({ documentId: req.params.docId, userId: req.user._id })
      .sort('-updatedAt').select('title messageCount updatedAt createdAt');
    res.json({ sessions });
  } catch (error) { next(error); }
};

const getChatSession = async (req, res, next) => {
  try {
    const session = await ChatHistory.findOne({ _id: req.params.sessionId, userId: req.user._id });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json({ session });
  } catch (error) { next(error); }
};

// ═══════════════════════════════════════════════════════════════
// @route POST /api/ai/insights/:docId
// ═══════════════════════════════════════════════════════════════
const generateInsights = async (req, res, next) => {
  try {
    const doc = await getDoc(req.params.docId, req.user._id);
    const quizzes = await Quiz.find({ documentId: doc._id, userId: req.user._id, isCompleted: true });
    const avgScore = quizzes.length
      ? Math.round(quizzes.reduce((s, q) => s + (q.score || 0), 0) / quizzes.length)
      : null;

    const text = truncateText(doc.extractedText, 8000);

    const messages = [
      { role: 'system', content: 'You are a personalized learning coach. You must respond with ONLY valid JSON — no explanation, no markdown, no code fences. Start your response directly with { and end with }' },
      { role: 'user', content: `Analyze this study material and provide personalized insights.${avgScore !== null ? ` Student avg quiz score: ${avgScore}%.` : ''}\n\nDocument: "${doc.title}"\n${text}\n\nRespond with ONLY this JSON structure (no other text):\n{"strengths":["..."],"weaknesses":["..."],"recommendations":["..."],"studyPlan":"...","estimatedStudyTime":"...","topicsToFocus":["..."]}` },
    ];

    const raw = await aiGenerate(messages);
    console.log('[insights raw]', raw?.substring(0, 200));

    const parsed = extractJSON(raw);

    // Ensure all fields exist with defaults
    const insights = {
      strengths: parsed.strengths || [],
      weaknesses: parsed.weaknesses || [],
      recommendations: parsed.recommendations || [],
      studyPlan: parsed.studyPlan || 'Review the material systematically.',
      estimatedStudyTime: parsed.estimatedStudyTime || '2-3 hours',
      topicsToFocus: parsed.topicsToFocus || [],
    };

    await StudyInsight.findOneAndUpdate(
      { documentId: doc._id, userId: req.user._id },
      { ...insights, generatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({ insights });
  } catch (error) {
    console.error('[insights error]', error.message);
    if (error.status) return res.status(error.status).json({ error: error.message });
    res.status(500).json({ error: `Insights generation failed: ${error.message}` });
  }
};

const getInsights = async (req, res, next) => {
  try {
    const insight = await StudyInsight.findOne({ documentId: req.params.docId, userId: req.user._id });
    if (!insight) return res.status(404).json({ error: 'No insights generated yet' });
    res.json({ insights: insight });
  } catch (error) { next(error); }
};

module.exports = {
  summarize, generateFlashcards, getFlashcards, toggleFavorite,
  generateQuiz, getQuizzes, submitQuiz,
  chat, getChatSessions, getChatSession,
  generateInsights, getInsights,
};
