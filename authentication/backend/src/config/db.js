const mongoose = require('mongoose');
const dns = require('dns');

// Configure public DNS servers to prevent querySrv ECONNREFUSED in environments
// (especially Windows with certain Node.js versions) that fail to resolve SRV records.
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (error) {
  // Gracefully fallback if setting DNS servers fails
}

/**
 * Reusable database connection function using Mongoose.
 * @returns {Promise<typeof mongoose>}
 */
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    throw new Error('MONGODB_URI environment variable is missing.');
  }

  // Connect to MongoDB Atlas
  return await mongoose.connect(mongoURI);
};

module.exports = connectDB;
