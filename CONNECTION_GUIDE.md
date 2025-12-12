# Frontend-Backend Connection Guide

## Overview

This guide explains how the frontend and backend are connected and how to run them together.

## Configuration

### Backend Configuration

The backend server is configured to:
- Run on port `5000` by default (configurable via `PORT` environment variable)
- Accept requests from frontend at `http://localhost:5173` (Vite default)
- Enable CORS for cross-origin requests
- API routes are mounted at `/api/v1`

**Backend Environment Variables:**
```env
PORT=5000
FRONTEND_URL=http://localhost:5173
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OTP_EXPIRES_IN=5m
DEFAULT_OTP=123456
```

### Frontend Configuration

The frontend is configured to:
- Run on port `5173` by default (Vite)
- Connect to backend at `http://localhost:5000/api/v1`
- Use environment variable `VITE_API_BASE_URL` for API base URL

**Frontend Environment Variables:**
Create a `.env` file in the `frontend` directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## Running the Application

### Step 1: Start the Backend

```bash
cd backend
npm install  # If not already installed
npm run dev
```

The backend will start on `http://localhost:5000`

### Step 2: Start the Frontend

In a new terminal:

```bash
cd frontend
npm install  # If not already installed
npm run dev
```

The frontend will start on `http://localhost:5173`

## API Endpoints

### Authentication Endpoints

#### Customer
- `POST /api/v1/auth/customer/send-otp` - Send OTP to customer
- `POST /api/v1/auth/customer/verify-otp` - Verify OTP and login
- `POST /api/v1/auth/customer/register` - Register new customer

#### Seller
- `POST /api/v1/auth/seller/send-otp` - Send OTP to seller
- `POST /api/v1/auth/seller/verify-otp` - Verify OTP and login
- `POST /api/v1/auth/seller/register` - Register new seller

#### Delivery
- `POST /api/v1/auth/delivery/send-otp` - Send OTP to delivery partner
- `POST /api/v1/auth/delivery/verify-otp` - Verify OTP and login
- `POST /api/v1/auth/delivery/register` - Register new delivery partner

#### Admin
- `POST /api/v1/auth/admin/send-otp` - Send OTP to admin
- `POST /api/v1/auth/admin/verify-otp` - Verify OTP and login
- `POST /api/v1/auth/admin/register` - Register new admin

### Health Check
- `GET /api/v1/health` - Check API health

## CORS Configuration

The backend is configured with CORS to allow requests from the frontend:

```typescript
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
```

## Authentication Flow

1. User enters mobile number
2. Frontend calls `send-otp` endpoint
3. Backend generates and sends OTP (default: `123456` in development)
4. User enters OTP
5. Frontend calls `verify-otp` endpoint
6. Backend verifies OTP and returns JWT token
7. Frontend stores token in localStorage
8. All subsequent requests include token in `Authorization: Bearer <token>` header

## Testing the Connection

### Test Backend Health

```bash
curl http://localhost:5000/api/v1/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "API is healthy",
  "timestamp": "2025-01-XX..."
}
```

### Test from Frontend

Open browser console on `http://localhost:5173` and run:

```javascript
fetch('http://localhost:5000/api/v1/health')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error('Error:', err));
```

## Troubleshooting

### CORS Errors

If you see CORS errors:
1. Check that `FRONTEND_URL` in backend `.env` matches your frontend URL
2. Verify backend CORS middleware is enabled
3. Check browser console for specific CORS error messages

### Connection Refused

If you see "Connection refused":
1. Verify backend is running on port 5000
2. Check `VITE_API_BASE_URL` in frontend `.env`
3. Ensure no firewall is blocking the connection

### 401 Unauthorized

If you see 401 errors:
1. Check that token is being stored in localStorage
2. Verify token is included in request headers
3. Check token expiration

## Production Configuration

For production:
1. Set `FRONTEND_URL` to your production frontend URL
2. Set `VITE_API_BASE_URL` to your production API URL
3. Use proper JWT secrets and OTP service (SMSIndiaHub)
4. Enable HTTPS for both frontend and backend

