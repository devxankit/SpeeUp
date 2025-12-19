# Location Functionality Setup Guide

This guide explains how to set up and use the location functionality in SpeeUp, including Google Maps integration for vendor signup and user location tracking.

## Features Implemented

1. **Google Maps Autocomplete for Vendor Signup**
   - Vendors can search and select their store location
   - Automatically captures coordinates (latitude/longitude)
   - Stores location data in database

2. **User Location Tracking**
   - Automatic location request after login/signup
   - Manual location entry option
   - Location stored in customer profile
   - Location required before accessing products

3. **Location-Based Product Filtering**
   - Products filtered by nearest sellers
   - Distance calculation based on coordinates

---

## Environment Variables Setup

### Frontend (.env file)

Create or update `.env` file in the `frontend` directory:

```env
# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Backend API URL (if different from default)
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### Backend (.env file)

No additional environment variables needed for location functionality. The backend uses the location data sent from the frontend.

---

## Google Maps API Setup

### Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API**
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy your API key

### Step 2: Restrict API Key (Recommended)

1. Click on your API key to edit it
2. Under "API restrictions", select "Restrict key"
3. Choose:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Under "Application restrictions", choose:
   - **HTTP referrers (web sites)** for frontend
   - Add your domain: `http://localhost:5173/*` (development)
   - Add your production domain: `https://yourdomain.com/*`

### Step 3: Add API Key to Frontend

Add the API key to your `.env` file:

```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## How It Works

### Vendor Signup Flow

1. **Vendor fills signup form**
2. **Location Field**: Uses Google Maps Autocomplete
   - Vendor types location name
   - Google Maps suggests locations
   - Vendor selects location
   - Coordinates automatically captured
3. **Form Submission**: Location data sent to backend
   - `searchLocation`: Full address string
   - `latitude`: Latitude coordinate
   - `longitude`: Longitude coordinate
   - `address`: Formatted address
   - `city`: City name

### User Location Flow

1. **After Login/Signup**:
   - Location permission modal appears
   - User can:
     - Allow automatic location access
     - Enter location manually
   - Location is required to proceed

2. **Location Storage**:
   - Saved in localStorage (frontend)
   - Saved in database (backend)
   - Used for product filtering

3. **Product Display**:
   - Products filtered by nearest sellers
   - Based on user's location coordinates
   - Distance calculated automatically

---

## API Endpoints

### Customer Location

#### Update Location
```http
POST /api/v1/customer/location
Authorization: Bearer <token>
Content-Type: application/json

{
  "latitude": 22.7196,
  "longitude": 75.8577,
  "address": "Indore, Madhya Pradesh, India",
  "city": "Indore",
  "state": "Madhya Pradesh",
  "pincode": "452001"
}
```

#### Get Location
```http
GET /api/v1/customer/location
Authorization: Bearer <token>
```

### Seller Registration (with location)

```http
POST /api/v1/auth/seller/register
Content-Type: application/json

{
  "sellerName": "John Doe",
  "mobile": "9876543210",
  "email": "john@example.com",
  "password": "password123",
  "storeName": "My Store",
  "category": "Electronics",
  "categories": ["Electronics", "Gadgets"],
  "address": "123 Main Street",
  "city": "Indore",
  "serviceableArea": "5 km",
  "searchLocation": "123 Main Street, Indore, MP, India",
  "latitude": "22.7196",
  "longitude": "75.8577"
}
```

---

## Components Created

### 1. GoogleMapsAutocomplete (`frontend/src/components/GoogleMapsAutocomplete.tsx`)
- Google Maps Places Autocomplete component
- Used in vendor signup form
- Automatically captures coordinates

### 2. LocationContext (`frontend/src/context/LocationContext.tsx`)
- Manages user location state
- Handles geolocation API
- Reverse geocoding for addresses
- Location persistence

### 3. LocationPermissionRequest (`frontend/src/components/LocationPermissionRequest.tsx`)
- Modal for requesting location permission
- Shows after login/signup
- Allows manual location entry

---

## Database Schema Updates

### Customer Model
Added fields:
- `latitude`: Number
- `longitude`: Number
- `address`: String
- `city`: String
- `state`: String
- `pincode`: String
- `locationUpdatedAt`: Date

### Seller Model
Already had fields:
- `searchLocation`: String
- `latitude`: String
- `longitude`: String

---

## Testing

### Test Vendor Signup with Location

1. Navigate to `/seller/signup`
2. Fill in all required fields
3. In "Store Location" field:
   - Type a location (e.g., "Indore")
   - Select from Google Maps suggestions
   - Verify coordinates appear below
4. Submit form
5. Check database for location data

### Test User Location

1. Login or signup as customer
2. Location permission modal should appear
3. Click "Allow Location Access"
4. Verify location is saved
5. Try accessing products - should work
6. Check localStorage for `userLocation`
7. Check database for customer location

---

## Troubleshooting

### Google Maps Not Loading

1. **Check API Key**: Verify `VITE_GOOGLE_MAPS_API_KEY` is set
2. **Check API Restrictions**: Ensure Maps JavaScript API and Places API are enabled
3. **Check Browser Console**: Look for API errors
4. **Verify Domain**: Ensure your domain is in API key restrictions

### Location Permission Denied

1. **Browser Settings**: Check browser location permissions
2. **HTTPS Required**: Some browsers require HTTPS for geolocation
3. **Manual Entry**: User can enter location manually

### Location Not Saving

1. **Check Backend**: Verify API endpoint is working
2. **Check Authentication**: Ensure user is logged in
3. **Check Network**: Verify API calls are successful
4. **Check Database**: Verify location fields exist in model

---

## Security Considerations

1. **API Key Security**:
   - Never commit API key to version control
   - Use environment variables
   - Restrict API key to specific domains
   - Set API restrictions in Google Cloud Console

2. **Location Privacy**:
   - Location data is stored securely
   - Only used for product filtering
   - Users can update location anytime
   - Location can be cleared

3. **Data Validation**:
   - Backend validates coordinates
   - Prevents invalid location data
   - Sanitizes address inputs

---

## Next Steps

To implement location-based product filtering:

1. Create a function to calculate distance between coordinates
2. Filter sellers by distance from user location
3. Sort products by nearest sellers
4. Display distance in product listings

Example distance calculation:
```typescript
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}
```

---

## Support

For issues or questions:
1. Check browser console for errors
2. Verify API key configuration
3. Check network requests in DevTools
4. Review backend logs for API errors




