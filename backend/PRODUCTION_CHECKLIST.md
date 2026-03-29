# Production Deployment Checklist - College Event System

## ✅ Backend Setup Verification

### 1. **Environment Variables on Render**

Add these to your Render dashboard:

```bash
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/college-events?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_at_least_32_chars
PORT=5000
NODE_ENV=production
```

### 2. **MongoDB Atlas Configuration**

- [ ] Create MongoDB Atlas account
- [ ] Create cluster (free tier works)
- [ ] Create database user with strong password
- [ ] Add current IP to Network Access (or 0.0.0.0/0 for testing)
- [ ] Copy connection string: `mongodb+srv://user:pass@cluster.mongodb.net/college-events`
- [ ] Test connection locally before deploying

### 3. **API Endpoints**

Both endpoints are now production-ready:

#### **POST /api/auth/register**

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepass123",
  "role": "student"
}
```

**Expected Response (201):**

```json
{
  "_id": "user_id",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "student",
  "token": "jwt_token_here"
}
```

#### **POST /api/auth/login**

```json
{
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Expected Response (200):**

```json
{
  "_id": "user_id",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "student",
  "token": "jwt_token_here"
}
```

### 4. **Error Codes**

| Status  | Scenario                                                          |
| ------- | ----------------------------------------------------------------- |
| **201** | Register success                                                  |
| **200** | Login success                                                     |
| **400** | Missing fields, invalid email, password too short, duplicate user |
| **401** | User not found, invalid password                                  |
| **500** | Server error (MongoDB down, bcrypt failure, etc.)                 |

---

## 🔧 Production Issues & Solutions

### Issue: Register returns 400

**Possible causes:**

- Missing fields (username, email, password)
- Email already exists
- Password < 6 characters
- Invalid email format

**Debug:**

```bash
curl -X POST https://college-event-system1.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "role": "student"
  }'
```

### Issue: Login returns 500

**Root causes (NOW FIXED):**

- ✅ User not found (returns 401, not crash)
- ✅ Password comparison crashes (wrapped in try-catch)
- ✅ No error handling (comprehensive try-catch added)

**Debug:**

```bash
curl -X POST https://college-event-system1.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Issue: CORS Errors

**Allowed origins:**

- `http://localhost:5173` (dev)
- `http://localhost:3000` (dev)
- `https://college-event-system.vercel.app` (production)
- `https://college-event-system1.onrender.com` (self)
- No origin (mobile apps, Postman)

**Fix:** Check `server.js` whitelist is updated

### Issue: "Invalid email or password" but credentials are correct

- Bcrypt comparison may be failing
- Check MongoDB password is hashed (pre-save hook)
- Verify encoder is bcryptjs v3.0.3+

---

## 🧪 Local Testing

### Start backend:

```bash
npm install
npm run dev
```

### Test register:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "role": "student"
  }'
```

### Test login:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Check logs:

```
[Startup] Connecting to MongoDB...
[MongoDB] ✓ Connected successfully
[Server] ✓ Running on port 5000
[Register] New user created - ID: xxxx
[Login] Successful login for user ID: xxxx
```

---

## 📋 Updated Code Summary

### authController.js

✅ Input validation (required fields, types)
✅ Email format validation  
✅ Password length validation (6+ chars)
✅ Duplicate user checking (email + username)
✅ Safe bcrypt.compare() in try-catch
✅ User not found returns 401 (not crash)
✅ Secure logging (no passwords, masked emails)
✅ Proper HTTP status codes (400, 401, 500)
✅ No error details exposed to client

### server.js (updated)

✅ Enhanced CORS whitelist
✅ Environment variable validation  
✅ Better startup logging
✅ MongoDB connection debugging

---

## 📞 Troubleshooting Steps

1. **Check Render logs:**
   - Go to Render dashboard > Logs
   - Look for `[MongoDB]`, `[Server]`, `[Login]`, `[Register]` messages

2. **Test endpoints with Postman:**
   - Base URL: `https://college-event-system1.onrender.com/api`
   - Exact request/response format shown above

3. **Verify MongoDB:**
   - Connection string format correct
   - User password doesn't have special chars (escape if needed)
   - IP whitelist includes Render's IPs (or 0.0.0.0/0)

4. **Check frontend .env:**
   - `VITE_API_URL=https://college-event-system1.onrender.com`

5. **Test CORS:**
   - Make request from your frontend origin
   - Check for CORS error in browser > DevTools > Network tab

---

## 🎯 Next Steps

1. ✅ Deploy updated code to Render
2. ✅ Set environment variables in Render
3. ✅ Test register endpoint
4. ✅ Test login endpoint
5. ✅ Test from frontend (check Network tab)
6. ✅ Monitor logs for `[Register]` and `[Login]` messages
