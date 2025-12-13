import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { ensureDefaultAdmin } from './utils/ensureDefaultAdmin';

// Load environment variables
dotenv.config();

const app: Application = express();

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Vite default port
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (_req: Request, res: Response) => {
  res.json({ 
    message: 'SpeeUp API Server is running!',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/v1', routes);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function startServer() {
  // Connect DB then ensure default admin exists
  await connectDB();
  await ensureDefaultAdmin();

  app.listen(PORT, () => {
    console.log('\n\x1b[32m✓\x1b[0m \x1b[1mSpeeUp Server Started\x1b[0m');
    console.log(`   \x1b[36mPort:\x1b[0m http://localhost:${PORT}`);
    console.log(`   \x1b[36mEnvironment:\x1b[0m ${process.env.NODE_ENV || 'development'}\n`);
  });
}

startServer().catch((err) => {
  console.error('\n\x1b[31m✗ Failed to start server\x1b[0m');
  console.error(err);
  process.exit(1);
});
