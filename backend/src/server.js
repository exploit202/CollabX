require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const { socketAuth } = require('./middleware/socketAuth.middleware');
require('./models'); // Ensure all canonical Mongoose models are registered on single connection

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const startServer = async () => {
  try {
    await connectDB();
    console.log('✅ Single Primary MongoDB Connected Successfully');
  } catch (error) {
    console.error('⚠️ MongoDB Connection Failed:', error.message);
  }

  const server = http.createServer(app);
  const io = initSocket(server);
  io.use(socketAuth);

  server.listen(PORT, () => {
    console.log('====================================');
    console.log('🚀 CollabX Unified Backend Started');
    console.log(`🌍 Environment : ${NODE_ENV}`);
    console.log(`📡 Server Port : ${PORT}`);
    console.log(`🔗 API Base    : http://localhost:${PORT}/api`);
    console.log('====================================');
  });
};

if (require.main === module) {
  startServer();
}

module.exports = { startServer, app };
