// server/server.js
// Server entry point: connects to MongoDB and starts listening on port
require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Start Express HTTP Server
app.listen(PORT, () => {
  console.log(`🚀 CareerHub Server running on http://localhost:${PORT}`);
});
