const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');

const authRoutes = require('./modules/auth');
const brandRoutes = require('./modules/brand');
const creatorRoutes = require('./modules/creator');
const paymentRoutes = require('./modules/payments');
const errorHandler = require('./middleware/error.middleware');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: '*/*' }));
app.use(cookieParser());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.status(200).json({ success: true, message: 'CollabX Backend is Running' }));
app.get('/api/health/db', (req, res) => res.status(200).json({ success: true, database: mongoose.connection.name || 'collabx_shared', status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));

app.use('/api/auth', authRoutes);
app.use('/api/brand', brandRoutes);
app.use('/api/creator', creatorRoutes);
app.use('/api/payments', paymentRoutes);

app.use((req, res, next) => { const e = new Error(`Route not found: ${req.method} ${req.originalUrl}`); e.statusCode = 404; next(e); });
app.use(errorHandler);

module.exports = app;
