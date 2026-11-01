// server/config/db.js
// Handles connection to MongoDB database using Mongoose
const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/job_portal';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000, // Timeout after 3 seconds if local MongoDB is not running
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    isConnected = false;
    const sanitizedUri = mongoUri.replace(/:([^:@]{3,})@/, ':****@');
    console.warn(`⚠️ MongoDB Notice: Could not connect to MongoDB at "${sanitizedUri}".`);
    console.warn(`   → ${error.message}`);

    // In production, halt execution to prevent accidental data loss in ephemeral in-memory mode
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_IN_MEMORY_FALLBACK !== 'true') {
      console.error('❌ CRITICAL ERROR: MongoDB connection failed in PRODUCTION mode.');
      console.error('   → Halting server to prevent accidental in-memory operation and data loss.');
      console.error('   → Verify MONGO_URI and MongoDB Atlas IP Network Access whitelist.');
      process.exit(1);
    }

    console.warn(`   → Continuing in In-Memory fallback mode for local development/testing.`);
    return false;
  }
};

const getDbStatus = () => mongoose.connection.readyState === 1;

module.exports = { connectDB, getDbStatus };
