require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const aiRoutes = require('./routes/ai');
const progressRoutes = require('./routes/progress');

const app = express();

// Connect to MongoDB (non-blocking on serverless)
connectDB().catch((err) =>
  console.error('MongoDB startup error:', err.message)
);

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    error: 'Too many requests, please try again later.',
  },
});

app.use('/api/', limiter);

// CORS — reflect origin so same-deployment and localhost both work
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb',
  })
);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Note: /uploads static serving removed — Vercel has no persistent disk.
// Files are written to /tmp per-request only.

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message:
      'AI Study Assistant API is running 🚀',
    timestamp: new Date(),
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/progress', progressRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use(errorHandler);

// VERCEL FIX
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(
      `🚀 Server running on http://localhost:${PORT}`
    );
    console.log(
      `📡 Environment: ${process.env.NODE_ENV}`
    );
  });
}

// Prevent crashes
process.on(
  'unhandledRejection',
  (reason, promise) => {
    console.error(
      '⚠️ Unhandled Rejection at:',
      promise,
      'reason:',
      reason
    );
  }
);

process.on('uncaughtException', (err) => {
  console.error(
    '⚠️ Uncaught Exception:',
    err.message
  );
});

module.exports = app;