# Production Deployment Guide for Render

## Backend Setup on Render

### 1. Environment Variables
Set these environment variables in your Render dashboard:

```
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secure_jwt_secret_key
FRONTEND_URL=https://your-frontend-domain.com
PORT=8000
```

### 2. Build Command
```bash
npm install
```

### 3. Start Command
```bash
npm start
```

## Frontend Setup

### Update your frontend axios configuration:

```javascript
// In your client/src/api/axios.js
const axiosInstance = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-domain.onrender.com' 
    : 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Essential for cookies
});
```

### Frontend Environment Variables
```
VITE_API_URL=https://your-backend-domain.onrender.com
```

## Important Notes for Cross-Domain Cookies

1. **HTTPS Required**: Both frontend and backend must use HTTPS in production
2. **SameSite=None**: Required for cross-domain cookies
3. **Secure Flag**: Must be true in production
4. **withCredentials**: Must be true in axios requests

## Cookie Configuration

The backend is configured to handle:
- ✅ Cross-domain requests
- ✅ HTTPS-only cookies in production
- ✅ Proper CORS headers
- ✅ SameSite=None for cross-domain
- ✅ HttpOnly cookies for security

## API Endpoints

- **Health Check**: `GET /health`
- **Cookie Test**: `GET /test-cookies` (debug cookies)
- **User Login**: `POST /user/login`
- **User Logout**: `POST /user/logout`
- **User Signup**: `POST /user/signup`
- **Test Auth**: `GET /user/test-auth` (test cookie authentication)

## Testing Cookie Functionality

### 1. After Login
```bash
# Test if cookies are being set
curl -c cookies.txt -X POST https://your-backend.onrender.com/user/login \
  -H "Content-Type: application/json" \
  -d '{"userEmail":"admin@example.com","userPassword":"password"}'
```

### 2. Test Cookie Reading
```bash
# Test if server can read cookies
curl -b cookies.txt https://your-backend.onrender.com/test-cookies
```

### 3. Test Authentication
```bash
# Test protected route with cookies
curl -b cookies.txt https://your-backend.onrender.com/user/test-auth
```

## Deployment Checklist

- [ ] Set all environment variables in Render
- [ ] Update frontend API URL
- [ ] Ensure HTTPS is enabled
- [ ] Test cross-domain authentication
- [ ] Verify cookie functionality
- [ ] Test all API endpoints

## Troubleshooting

### If cookies aren't working:
1. Check browser console for CORS errors
2. Verify HTTPS is enabled on both domains
3. Ensure `withCredentials: true` in frontend
4. Check that `SameSite=None` and `Secure=true` in production
5. Verify environment variables are set correctly
