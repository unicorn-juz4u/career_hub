// server/server.js
// Server entry point: connects to MongoDB and starts listening on port
require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

// Security check for production JWT_SECRET
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('❌ CRITICAL SECURITY WARNING: JWT_SECRET environment variable is missing in production!');
  console.error('   → Set a strong, random JWT_SECRET in your production environment variables (e.g., Render Dashboard).');
}

// Connect to MongoDB
connectDB();

// Start Express HTTP Server
app.listen(PORT, () => {
  console.log(`🚀 CareerHub Server running on port ${PORT}`);
});

