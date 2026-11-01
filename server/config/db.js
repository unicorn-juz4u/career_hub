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
    console.warn(`⚠️ MongoDB Notice: Could not connect to MongoDB at "${mongoUri}".`);
    console.warn(`   → ${error.message}`);
    console.warn(`   → The server is continuing in In-Memory fallback mode so you can test immediately.`);
    console.warn(`   → To persist data permanently, install/start MongoDB or provide a MongoDB Atlas URI in server/.env.`);
    return false;
  }
};

const getDbStatus = () => mongoose.connection.readyState === 1;

module.exports = { connectDB, getDbStatus };
