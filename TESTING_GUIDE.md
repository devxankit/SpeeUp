# Authentication System Testing Guide

## Prerequisites

✅ MongoDB URI is configured in `backend/.env`
✅ Frontend server is running on http://localhost:5173
✅ Backend dependencies are installed

## Step 1: Start Backend Server

Open a terminal and run:
```bash
cd backend
npm run dev
```

You should see:
```
✓ MongoDB Connected Successfully
✓ SpeeUp Server Started
   Port: http://localhost:5000
   Environment: development
```

## Step 2: Verify Server is Running

### Option A: Browser Test
Open browser and visit:
- http://localhost:5000/api/v1/health

Should return:
```json
{
  "status": "OK",
  "message": "API is healthy",
  "timestamp": "..."
}
```

### Option B: Command Line Test
```bash
cd backend
node test-auth.js
```

## Step 3: Test Authentication Flow

### Test Admin Login

1. **Open Browser**: http://localhost:5173/admin/login

2. **Enter Mobile Number**: 
   - Use a mobile number that exists in your Admin collection
   - Example: `1234567890` (if you have an admin with this mobile)

3. **Click "Continue"**
   - Should show "Sending..." then switch to OTP input screen

4. **Enter OTP**: 
   - In development mode, always use: `123456`
   - OTP input will auto-advance as you type

5. **Verify**:
   - Should redirect to `/admin` dashboard
   - Token should be stored in localStorage
   - User data should be stored in localStorage

### Test Seller Login

1. **Navigate**: http://localhost:5173/seller/login
2. **Enter mobile number** (must exist in Seller collection)
3. **Enter OTP**: `123456`
4. **Should redirect** to `/seller` dashboard

### Test Customer Login

1. **Navigate**: http://localhost:5173/login
2. **Enter mobile number** (must exist in Customer collection)
3. **Enter OTP**: `123456`
4. **Should redirect** to `/` home page

## Step 4: API Endpoint Testing

### Using Postman/Thunder Client/curl

#### 1. Health Check
```bash
GET http://localhost:5000/api/v1/health
```

#### 2. Send OTP (Admin)
```bash
POST http://localhost:5000/api/v1/auth/admin/send-otp
Content-Type: application/json

{
  "mobile": "1234567890"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent (dev mode: 123456)"
}
```

#### 3. Verify OTP (Admin)
```bash
POST http://localhost:5000/api/v1/auth/admin/verify-otp
Content-Type: application/json

{
  "mobile": "1234567890",
  "otp": "123456"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "firstName": "...",
      "lastName": "...",
      "mobile": "1234567890",
      "email": "...",
      "role": "Admin"
    }
  }
}
```

## Step 5: Create Test Users (if needed)

If you don't have users in the database, you can create them:

### Create Admin User (MongoDB Shell/Compass)

```javascript
use SpeeUp

db.admins.insertOne({
  firstName: "Test",
  lastName: "Admin",
  mobile: "1234567890",
  email: "admin@test.com",
  password: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy", // password: "test123"
  role: "Admin",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Create Customer User

```javascript
db.customers.insertOne({
  name: "Test Customer",
  phone: "9876543210",
  email: "customer@test.com",
  status: "Active",
  walletAmount: 0,
  totalOrders: 0,
  totalSpent: 0,
  registrationDate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Note**: For password hashing, you can use:
```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('yourpassword', 10).then(hash => console.log(hash));"
```

## Common Issues & Solutions

### Issue: Server won't start
**Solution**: 
- Check MongoDB connection string in `.env`
- Ensure MongoDB Atlas allows your IP address
- Check if port 5000 is already in use

### Issue: "User not found" error
**Solution**: 
- Create test users in MongoDB first
- Ensure mobile number matches exactly (10 digits)

### Issue: "Invalid OTP" error
**Solution**: 
- In development, always use `123456`
- Check if OTP expired (5 minutes)
- Request new OTP

### Issue: CORS errors in browser
**Solution**: 
- Backend should allow requests from `http://localhost:5173`
- Check if frontend API base URL is correct

## Testing Checklist

- [ ] Backend server starts successfully
- [ ] MongoDB connection established
- [ ] Health endpoint returns OK
- [ ] Admin send OTP works
- [ ] Admin verify OTP works
- [ ] Seller send OTP works
- [ ] Seller verify OTP works
- [ ] Customer send OTP works
- [ ] Customer verify OTP works
- [ ] Frontend login pages load
- [ ] OTP input component works
- [ ] Token stored in localStorage
- [ ] User redirected after login
- [ ] Rate limiting works (try 6 requests quickly)

## Next Steps

Once basic authentication is working:
1. Test protected routes
2. Test token refresh
3. Test logout functionality
4. Test registration flows
5. Test error handling
6. Test rate limiting

