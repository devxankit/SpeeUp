import express, { Application, Request, Response } from "express";
import { createServer } from "http";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import { ensureDefaultAdmin } from "./utils/ensureDefaultAdmin";
import { seedHeaderCategories } from "./utils/seedHeaderCategories";
import { initializeSocket } from "./socket/socketService";

// Load environment variables
dotenv.config();

const app: Application = express();
const httpServer = createServer(app);

// CORS configuration - Allow multiple localhost ports in development
const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean | string) => void
  ) => {
    console.log(
      `🔍 CORS check - Origin: ${origin}, NODE_ENV: ${process.env.NODE_ENV}`
    );

    // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
    if (!origin) {
      console.log("✅ CORS: Allowing request with no origin");
      return callback(null, true);
    }

    // In production, check against FRONTEND_URL
    if (process.env.NODE_ENV === "production") {
      const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
      if (origin === allowedOrigin) {
        console.log(`✅ CORS: Allowing production origin: ${origin}`);
        return callback(null, origin);
      }
      console.log(`❌ CORS: Rejecting origin in production: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    }

    // In development, allow any localhost port
    if (
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:")
    ) {
      console.log(`✅ CORS: Allowing localhost origin: ${origin}`);
      return callback(null, origin);
    }

    console.log(`❌ CORS: Rejecting origin: ${origin}`);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Socket.io
const io = initializeSocket(httpServer);
app.set("io", io);

// Routes
app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "SpeeUp API Server is running!",
    version: "1.0.0",
    socketIO: "Listening for WebSocket connections",
  });
});

// Debug middleware - log all incoming requests
app.use((req: Request, _res: Response, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use("/api/v1", routes);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function startServer() {
  // Connect DB then ensure default admin exists
  await connectDB();
  await ensureDefaultAdmin();
  await seedHeaderCategories();

  httpServer.listen(PORT, () => {
    console.log("\n\x1b[32m✓\x1b[0m \x1b[1mSpeeUp Server Started\x1b[0m");
    console.log(`   \x1b[36mPort:\x1b[0m http://localhost:${PORT}`);
    console.log(
      `   \x1b[36mEnvironment:\x1b[0m ${process.env.NODE_ENV || "development"}`
    );
    console.log(`   \x1b[36mSocket.IO:\x1b[0m ✓ Ready for connections\n`);
  });
}

startServer().catch((err) => {
  console.error("\n\x1b[31m✗ Failed to start server\x1b[0m");
  console.error(err);
  process.exit(1);
});
