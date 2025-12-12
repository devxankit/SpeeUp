import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app: Application = express();

// Middleware
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

app.listen(PORT, () => {
  console.log('\n\x1b[32m✓\x1b[0m \x1b[1mSpeeUp Server Started\x1b[0m');
  console.log(`   \x1b[36mPort:\x1b[0m http://localhost:${PORT}`);
  console.log(`   \x1b[36mEnvironment:\x1b[0m ${process.env.NODE_ENV || 'development'}\n`);
});
