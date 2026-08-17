const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Temporary Health Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CollabX Backend is Running'
  });
});

// Auth Routes
const authRouter = require('./modules/auth');
app.use('/api/auth', authRouter);

// Brand Routes
const brandRouter = require('./modules/brand');
app.use('/api/brand', brandRouter);

// Creator Routes
const creatorRouter = require('./modules/creator');
app.use('/api/creator', creatorRouter);

// Global Error Handler (Must be registered last)
const errorHandler = require('./middleware/error.middleware');
app.use(errorHandler);

module.exports = app;
