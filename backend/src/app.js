const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');

const authRoutes = require('./modules/auth');
const brandAuthRoutes = require('./modules/brand/routes/brandAuth.routes');
const brandRoutes = require('./modules/brand');
const creatorAuthRoutes = require('./modules/creator/routes/creatorAuth.routes');
const creatorRoutes = require('./modules/creator');
const errorHandler = require('./middleware/error.middleware');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health Check Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CollabX Unified Backend is running cleanly.',
    port: process.env.PORT || 5000
  });
});

app.get('/api/health/db', (req, res) => {
  res.status(200).json({
    success: true,
    database: mongoose.connection.name || 'collabx_unified',
    status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Route Mounting
app.use('/api/auth', authRoutes);
app.use('/api/brand/auth', brandAuthRoutes);
app.use('/api/brand', brandRoutes);
app.use('/api/creator/auth', creatorAuthRoutes);
app.use('/api/creator', creatorRoutes);

// 404 Handler
app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  error.code = 'NOT_FOUND';
  next(error);
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
