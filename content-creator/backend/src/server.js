require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const { socketAuth } = require('./middleware/socketAuth.middleware');
const registerNegotiationSocketHandlers = require('./sockets/negotiation.socket');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const startServer = async () => {
  try { await connectDB(); console.log('✅ MongoDB Connected Successfully'); } catch (error) { console.error('⚠️ MongoDB Connection Failed:', error.message); }
  const server = http.createServer(app);
  const io = initSocket(server);
  io.use(socketAuth);
  registerNegotiationSocketHandlers(io);
  server.listen(PORT, () => {
    console.log('====================================');
    console.log('🚀 CollabX Backend Started');
    console.log(`🌍 Environment : ${NODE_ENV}`);
    console.log(`📡 Server      : http://localhost:${PORT}`);
    console.log('====================================');
  });
};
startServer();
