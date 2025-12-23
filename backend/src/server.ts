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
import { isOriginAllowed } from "./utils/corsHelper";

// Load environment variables
dotenv.config();

const app: Application = express();
const httpServer = createServer(app);

// CORS configuration - Allow multiple origins in production
const getAllowedOrigins = (): string[] => {
  // Get allowed origins from environment variable (comma-separated)
  const frontendUrl = process.env.FRONTEND_URL || "";
  const allowedOrigins = frontendUrl
    .split(",")
    .map((url) => url.trim().replace(/\/$/, "")) // Remove trailing slashes
    .filter((url) => url.length > 0);

  // Default production origins (explicitly include www.speeup.com)
  const defaultOrigins = [
    "https://www.speeup.com",
    "https://speeup.com",
  ];

  // Combine and remove duplicates
  const allOrigins = allowedOrigins.length > 0
    ? [...new Set([...allowedOrigins, ...defaultOrigins])]
    : defaultOrigins;

  return allOrigins;
};

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean | string) => void
  ) => {
    try {
      console.log(
        `🔍 CORS check - Origin: ${origin || 'no origin'}, NODE_ENV: ${process.env.NODE_ENV || 'development'}`
      );

      // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
      if (!origin) {
        console.log("✅ CORS: Allowing request with no origin");
        return callback(null, true);
      }

      // In production, check against allowed origins
      if (process.env.NODE_ENV === "production") {
        const allAllowedOrigins = getAllowedOrigins();

        // Normalize origin (remove trailing slash if present)
        const normalizedOrigin = origin.replace(/\/$/, "");

        // Check if origin matches any allowed origin
        const isAllowed = allAllowedOrigins.some((allowedOrigin) => {
          // Exact match (with and without trailing slash)
          if (normalizedOrigin === allowedOrigin || origin === allowedOrigin) return true;

          // Support for www and non-www variants
          if (allowedOrigin.includes("www.")) {
            const nonWww = allowedOrigin.replace("www.", "");
            if (normalizedOrigin === nonWww || origin === nonWww) return true;
          } else {
            const withWww = allowedOrigin.replace(/^(https?:\/\/)/, "$1www.");
            if (normalizedOrigin === withWww || origin === withWww) return true;
          }
          return false;
        });

        if (isAllowed) {
          console.log(`✅ CORS: Allowing production origin: ${origin}`);
          return callback(null, origin);
        }

        console.log(`❌ CORS: Rejecting origin in production: ${origin}`);
        console.log(`   Allowed origins: ${allAllowedOrigins.join(", ")}`);
        // Return false instead of error to prevent CORS middleware from crashing
        return callback(null, false);
      }

      // In development, allow any localhost port
      if (
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:") ||
        origin.startsWith("https://localhost:")
      ) {
        console.log(`✅ CORS: Allowing localhost origin: ${origin}`);
        return callback(null, origin);
      }

      console.log(`❌ CORS: Rejecting origin: ${origin}`);
      return callback(null, false);
    } catch (error) {
      console.error('❌ CORS origin check error:', error);
      // On error, allow the request to prevent blocking (fail open in dev, fail closed in prod)
      if (process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      return callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
  ],
  exposedHeaders: ["Content-Length", "Content-Type"],
  maxAge: 86400, // 24 hours - cache preflight requests
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// CORS Middleware - MUST be first to handle preflight requests
app.use(cors(corsOptions));

// Explicit OPTIONS handler for ALL routes (handles preflight requests)
// This MUST be before any route handlers to catch preflight requests
app.options('*', (req: Request, res: Response) => {
  const origin = req.headers.origin;

  console.log(`🔍 OPTIONS preflight request from origin: ${origin || 'no origin'}`);

  // Set CORS headers for preflight
  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
    res.setHeader('Access-Control-Max-Age', '86400');
    console.log(`✅ OPTIONS: Allowed preflight for origin: ${origin}`);
    return res.status(204).end();
  } else if (!origin) {
    // Allow requests with no origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
    res.setHeader('Access-Control-Max-Age', '86400');
    console.log(`✅ OPTIONS: Allowed preflight for no origin`);
    return res.status(204).end();
  } else {
    console.log(`❌ OPTIONS: Rejected preflight for origin: ${origin}`);
    // Still send 204 but without CORS headers (browser will reject)
    return res.status(204).end();
  }
});

// Middleware to ensure CORS headers are set on all responses
app.use((req: Request, res: Response, next) => {
  const origin = req.headers.origin;

  // Set CORS headers if origin is allowed (for all requests, not just OPTIONS)
  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  next();
});

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
