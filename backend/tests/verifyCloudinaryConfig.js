require('dotenv').config();
const cloudinary = require('../src/config/cloudinary');

console.log('====================================================');
console.log('🚀 TESTING CLOUDINARY BACKEND CONFIGURATION');
console.log('====================================================');

const config = cloudinary.config();

console.log('Cloudinary Cloud Name:', config.cloud_name || 'MISSING');
console.log('Cloudinary API Key:', config.api_key ? '***CONFIGURED***' : 'MISSING');
console.log('Cloudinary API Secret:', config.api_secret ? '***CONFIGURED***' : 'MISSING');

if (!config.cloud_name || !config.api_key || !config.api_secret) {
  console.error('❌ Cloudinary configuration failed: Missing environment variables.');
  process.exit(1);
}

console.log('✅ Cloudinary SDK Initialized Successfully!');
console.log('====================================================');
