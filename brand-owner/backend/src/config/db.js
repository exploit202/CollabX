const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (error) {
  // Ignore DNS configuration errors
};

// Main database: collabx
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    throw new Error('MONGODB_URI environment variable is missing.');
  }

  await mongoose.connect(mongoURI);

  console.log('✅ Main MongoDB connected');
};
const connectSharedDB = async () => {
  await sharedDB.asPromise();
  console.log("✅ Shared MongoDB connected");
};

// Shared database: collabx_shared
const sharedDB = mongoose.createConnection(
  process.env.SHARED_MONGODB_URI
);

sharedDB.on('connected', () => {
  console.log('✅ Shared MongoDB connected');
});

sharedDB.on('error', (error) => {
  console.error('❌ Shared MongoDB connection error:', error);
});

module.exports = {
  connectDB,
  sharedDB,
  connectSharedDB
};
