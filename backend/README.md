# SpeeUp Backend API

A TypeScript-based Express.js backend server for the SpeeUp application.

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files (database, etc.)
│   │   └── db.ts       # MongoDB connection
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   │   ├── errorHandler.ts
│   │   └── notFound.ts
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   │   └── index.ts
│   ├── services/        # Business logic services
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   │   └── asyncHandler.ts
│   ├── scripts/         # Utility scripts
│   ├── app.ts           # Express app configuration
│   └── server.ts        # Server entry point
├── dist/                # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── .env                 # Environment variables (create from .env.example)
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/speeup
PORT=5000
NODE_ENV=development
```

3. Run in development mode:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
npm start
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled production server

## API Endpoints

- `GET /` - Server status
- `GET /health` - Health check
- `GET /api/v1/health` - API health check

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Development**: tsx (TypeScript execution)


