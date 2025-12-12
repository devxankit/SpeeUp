const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'SpeeUp API Server is running!' });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n\x1b[32m✓\x1b[0m \x1b[1mSpeeUp Server Started\x1b[0m');
  console.log(`   \x1b[36mPort:\x1b[0m http://localhost:${PORT}`);
  console.log(`   \x1b[36mEnvironment:\x1b[0m ${process.env.NODE_ENV || 'development'}\n`);
});

