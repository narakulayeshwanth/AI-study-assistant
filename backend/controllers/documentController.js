const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const Flashcard = require('../models/Flashcard');
const Quiz = require('../models/Quiz');
const ChatHistory = require('../models/ChatHistory');
const StudyInsight = require('../models/StudyInsight');
const { extractText } = require('../utils/textExtractor');

// @desc    Upload and process a document
// @route   POST /api/documents/upload
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, filename, size, path: filePath } = req.file;
    const ext = path.extname(originalname).toLowerCase().replace('.', '');
    const title = req.body.title || path.basename(originalname, path.extname(originalname));

    // Extract text
    let extractionResult;
    try {
      extractionResult = await extractText(filePath, ext);
    } catch (err) {
      fs.unlinkSync(filePath); // cleanup failed upload
      return res.status(422).json({ error: `Text extraction failed: ${err.message}` });
    }

    const document = await Document.create({
      userId: req.user._id,
      title: title.trim(),
      originalName: originalname,
      filename,
      fileType: ext,
      fileSize: size,
      pageCount: extractionResult.pageCount,
      wordCount: extractionResult.wordCount,
      extractedText: extractionResult.text,
      isProcessed: true,
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [],
    });

    res.status(201).json({
      message: 'Document uploaded and processed successfully',
      document: {
        _id: document._id,
        title: document.title,
        fileType: document.fileType,
        fileSize: document.fileSize,
        pageCount: document.pageCount,
        wordCount: document.wordCount,
        isProcessed: document.isProcessed,
        createdAt: document.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all documents for the user
// @route   GET /api/documents
const getDocuments = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 12, sort = '-createdAt' } = req.query;
    const query = { userId: req.user._id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const total = await Document.countDocuments(query);
    const documents = await Document.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-extractedText -summary');

    res.json({
      documents,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single document
// @route   GET /api/documents/:id
const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, userId: req.user._id });
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Update access stats
    document.viewCount += 1;
    document.lastAccessed = new Date();
    await document.save({ validateBeforeSave: false });

    res.json({ document });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a document and all related data
// @route   DELETE /api/documents/:id
const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, userId: req.user._id });
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete physical file
    const filePath = path.join(__dirname, '..', 'uploads', document.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete all related data
    await Promise.all([
      Flashcard.deleteMany({ documentId: document._id }),
      Quiz.deleteMany({ documentId: document._id }),
      ChatHistory.deleteMany({ documentId: document._id }),
      StudyInsight.deleteMany({ documentId: document._id }),
      document.deleteOne(),
    ]);

    res.json({ message: 'Document and all related data deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update document title/tags
// @route   PATCH /api/documents/:id
const updateDocument = async (req, res, next) => {
  try {
    const { title, tags } = req.body;
    const document = await Document.findOne({ _id: req.params.id, userId: req.user._id });
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (title) document.title = title.trim();
    if (tags) document.tags = tags;
    await document.save();

    res.json({ message: 'Document updated', document });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadDocument, getDocuments, getDocument, deleteDocument, updateDocument };
