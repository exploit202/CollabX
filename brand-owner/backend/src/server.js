// require('dotenv').config();
// const app = require('./app');
// const { connectDB } = require('./config/db');

// connectDB();

// const PORT = process.env.PORT || 5000;
// const NODE_ENV = process.env.NODE_ENV || 'development';

// const startServer = async () => {
//   try {
//     // Connect to MongoDB
//     await connectDB();
//     console.log('✅ MongoDB Connected Successfully');
//   } catch (error) {
//     console.error('⚠️ MongoDB Connection Failed:', error.message);
//     console.warn('Continuing startup without a database connection so the Express app can still be verified locally.');
//   }

//   // Start Express server
//   app.listen(PORT, () => {
//     console.log('====================================');
//     console.log('🚀 CollabX Backend Started');
//     console.log(`🌍 Environment : ${NODE_ENV}`);
//     console.log(`📡 Server      : http://localhost:${PORT}`);
//     console.log('====================================');
//   });
// };

// startServer();



require('dotenv').config();

const http = require('http');
const app = require('./app');
const {
  connectDB,
  connectSharedDB
} = require('./config/db');
const { Server } = require('socket.io');
const socketAuth = require('./socket/socket.middleware');
const registerNegotiationSocket = require('./socket/negotiation.socket');
const { setIO } = require('./socket/socket.manager');


const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const startServer = async () => {
try {
  await connectDB();
  console.log('✅ Main MongoDB Connected Successfully');

  await connectSharedDB();
  console.log('✅ Shared MongoDB Connected Successfully');

} catch (error) {
  console.error('⚠️ MongoDB Connection Failed:', error.message);
  process.exit(1);
}
  // Create HTTP server from Express
  const server = http.createServer(app);

  // Attach Socket.IO - support multiple origins from CORS_ORIGIN
  const rawOrigins = process.env.CORS_ORIGIN || 'http://localhost:3000';
  const allowedOrigins = rawOrigins.split(',').map((s) => s.trim()).filter(Boolean);
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    }
  });
  setIO(io);
  io.use(socketAuth);
  registerNegotiationSocket(io);

  // Basic socket connection test
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);
    
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  // Start server
  server.listen(PORT, '0.0.0.0',() => {
    console.log('====================================');
    console.log('🚀 CollabX Backend Started');
    console.log(`🌍 Environment : ${NODE_ENV}`);
    console.log(`📡 Server      : http://0.0.0.0:${PORT}`);
    console.log('🔌 Socket.IO   : Enabled');
    console.log('====================================');
  });
};

startServer();
