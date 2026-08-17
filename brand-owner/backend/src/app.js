const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const settingsRouter = require('./modules/brand/routes/brandsettings.routes');

const app = express();

// CORS - support comma-separated list in CORS_ORIGIN and reflect allowed origin
const rawOrigins = process.env.CORS_ORIGIN || 'http://localhost:3000';
const allowedOrigins = rawOrigins.split(',').map((s) => s.trim()).filter(Boolean);
app.use(
  cors({
    origin: (incomingOrigin, callback) => {
      // Allow non-browser tools (curl, server-side) with no origin
      if (!incomingOrigin) return callback(null, true);
      if (allowedOrigins.includes(incomingOrigin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookies
app.use(cookieParser());
app.use('/api/settings', settingsRouter);

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CollabX Backend is Running',
  });
});

// Auth
const authRouter = require('./modules/auth');
app.use('/api/auth', authRouter);

// Brand
const brandRouter = require('./modules/brand');
app.use('/api/brand', brandRouter);

// Creator
const creatorRouter = require('./modules/creator');
app.use('/api/creator', creatorRouter);

// Error handler — MUST be last
const errorHandler = require('./middleware/error.middleware');
app.use(errorHandler);

module.exports = app;