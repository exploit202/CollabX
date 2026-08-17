require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('⚠️ MongoDB Connection Failed:', error.message);
    console.warn('Continuing startup without a database connection so the Express app can still be verified locally.');
  }

  // Start Express server
  app.listen(PORT, () => {
    console.log('====================================');
    console.log('🚀 CollabX Backend Started');
    console.log(`🌍 Environment : ${NODE_ENV}`);
    console.log(`📡 Server      : http://localhost:${PORT}`);
    console.log('====================================');
  });
};

startServer();
