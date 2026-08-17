const mongoose = require('mongoose');
const dns = require('dns');

// Configure public DNS servers to resolve MongoDB Atlas SRV records reliably on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (error) {
  // Ignore DNS override errors if restricted by system policy
}

/**
 * Single primary database connection using Mongoose.
 * All domain models (User, BrandProfile, CreatorProfile, etc.) attach to this connection.
 * @returns {Promise<typeof mongoose>}
 */
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    throw new Error('MONGODB_URI environment variable is missing.');
  }

  const conn = await mongoose.connect(mongoURI);
  return conn;
};

module.exports = connectDB;
