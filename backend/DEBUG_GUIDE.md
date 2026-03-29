# Authentication System - Complete Debug Guide

## 🔴 Critical Issues & Solutions

### Issue 1: Register Returning 400 Bad Request

**Common Causes (in order of likelihood):**

1. **Frontend not sending JSON**
   - Check: Frontend must send `Content-Type: application/json`
   - Check: Axios should automatically add this header
   - Fix: Verify in frontend > LoginPage.jsx and RegisterPage.jsx

2. **Field names mismatch**
   - Frontend sends: `{ username, email, password, role }`
   - Backend expects: `{ username, email, password }` (role is optional)
   - ✅ These match - no issue here

3. **Axios baseURL incorrect**
   - Check frontend `.env`: `VITE_API_URL=https://college-event-system1.onrender.com`
   - Check api.js: baseURL should be `${base}/api`
   - Final endpoint: `https://college-event-system1.onrender.com/api/auth/register`
   - ✅ This is correct

4. **MongoDB connection failing**
   - Check Render environment variables
   - Check logs in Render dashboard
   - Look for: `[MongoDB] ✓ Connected successfully`

---

### Issue 2: Login Returning 500 Internal Server Error

**Root Causes**

| Symptom               | Cause                | Solution                                   |
| --------------------- | -------------------- | ------------------------------------------ |
| Login always 500      | bcrypt.compare crash | Check bcrypt package version               |
| Password hash invalid | Pre-save hook failed | Check if user created via manual DB insert |
| JWT_SECRET missing    | Env var not set      | Set JWT_SECRET on Render                   |
| User is null          | DB query failed      | Check MongoDB connection                   |

---

## 🧪 Testing Steps

### Step 1: Test Locally First

```bash
cd backend
npm install
npm run dev
```

Check output:

```
[Startup] Connecting to MongoDB at: mongodb+srv://...
[Startup] Server will listen on port: 5000
[MongoDB] ✓ Connected successfully
[Server] ✓ Running on port 5000
[Routes] Auth: POST /api/auth/register, POST /api/auth/login
```

### Step 2: Test Register Endpoint

**Using cURL:**

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

**Expected Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "...",
    "username": "testuser",
    "email": "test@example.com",
    "role": "student",
    "token": "eyJhbGc..."
  }
}
```

**Expected Console Logs:**

```
[Register] Incoming request - Headers: application/json
[Register] Raw req.body: { username: 'testuser', email: 'test@example.com', password: 'password123', role: 'student' }
[Register] Checking duplicate user - email: test@example.com, username: testuser
[Register] No duplicate found, creating user...
[Register] ✓ User created - ID: 507f..., Email: test@example.com
[Register] ✓ Password hashed (length: 60)
```

### Step 3: Test Login Endpoint

**Using cURL:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "...",
    "username": "testuser",
    "email": "test@example.com",
    "role": "student",
    "token": "eyJhbGc..."
  }
}
```

**Expected Console Logs:**

```
[Login] Incoming request - Headers: application/json
[Login] Raw req.body: { email: 'test@example.com', password: 'password123' }
[Login] Looking up user by email: test@example.com
[Login] ✓ User found - ID: 507f..., Email: test@example.com
[Login] Stored password hash length: 60
[Login] Comparing password using bcrypt...
[Login] Password comparison result: true
[Login] ✓ Password matched for user ID: 507f...
[Login] Generating JWT token...
[Login] ✓ Token generated (length: 218)
[Login] ✓✓ Successful login for user: test@example.com
```

---

## 🚨 Error Diagnosis

### Error: 400 "Missing required fields"

**Check logs:** `[Register] Missing fields - username: false, email: true, password: true`
**Cause:** Frontend not sending `username` field
**Fix:** Verify RegisterPage.jsx sends username

### Error: 400 "Invalid email format"

**Check logs:** `[Register] Invalid email format: test.email@test`
**Cause:** Email missing TLD (top-level domain)
**Fix:** Use email format: `user@domain.com`

### Error: 400 "Password must be at least 6 characters"

**Cause:** Password < 6 chars
**Fix:** Use longer password

### Error: 400 "User already exists"

**Check logs:** `[Register] Duplicate user found`
**Cause:** Email or username already in database
**Fix:**

- Use different email
- OR clear MongoDB collection:
  ```bash
  mongo "mongodb+srv://user:pass@cluster.mongodb.net/college-events"
  # Then: db.users.deleteMany({})
  ```

### Error: 401 "Invalid email or password"

**Check logs from login:**

- `[Login] ✗ User not found for email:` → Email doesn't exist
- `[Login] ✗ Invalid password for user ID:` → Password is wrong
  **Fix:** Use correct credentials

### Error: 500 "Authentication service error"

**Check logs:** `[Login] ✗ Bcrypt comparison failed:`
**Cause:** Bcrypt error (rare - usually bcryptjs version issue)
**Fix:**

```bash
cd backend
npm uninstall bcryptjs
npm install bcryptjs@3.0.3
```

### Error: 500 "Server error" (no cause shown)

**Problem:** Unexpected error occurred
**Solution:**

1. Check Render logs for stack trace
2. Verify all environment variables are set
3. Check MongoDB connection string

---

## 📋 Render Deployment Checklist

### Before Pushing Code:

- [ ] Test locally with `npm run dev`
- [ ] Test register endpoint
- [ ] Test login endpoint with correct password
- [ ] Test login endpoint with wrong password (should be 401)
- [ ] Check all console logs

### On Render Dashboard:

1. Go to **Environment**
2. Add these variables:

   ```
   MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/college-events?retryWrites=true&w=majority
   JWT_SECRET=your_random_secret_key_at_least_32_characters_long
   NODE_ENV=production
   ```

3. Go to **Logs**
4. Push code to Git - Render will auto-deploy
5. Watch for:
   ```
   [MongoDB] ✓ Connected successfully
   [Server] ✓ Running on port 5000
   ```

### After Deployment:

Test endpoints from frontend:

- Open browser DevTools → Network tab
- Try register
- Look for POST `/api/auth/register` → Check response and logs
- Look for any CORS errors
- Check Render logs for `[Register]` messages

---

## 🔧 Advanced Debugging

### Enable Full Request/Response Logging

Add to server.js before `app.use(cors())`:

```javascript
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log("Headers:", req.headers);
  next();
});
```

### Test with Postman

1. Create new POST request
2. URL: `http://localhost:5000/api/auth/register`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "role": "student"
}
```

5. Click Send
6. Check Response and Status Code

### Check MongoDB Directly

Connect with MongoDB Compass or CLI:

```bash
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/college-events"
db.users.find() # See all users
db.users.findOne({email: "test@example.com"}) # See specific user
```

Expected user object:

```json
{
  "_id": ObjectId("..."),
  "username": "testuser",
  "email": "test@example.com",
  "password": "$2a$10$...", // 60-character bcrypt hash
  "role": "student"
}
```

---

## 📊 Response Format Reference

### Successful Responses (Include `success: true`)

**Register 201:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": { "_id", "username", "email", "role", "token" }
}
```

**Login 200:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": { "_id", "username", "email", "role", "token" }
}
```

### Error Responses (Include `success: false`)

**400 Bad Request:**

```json
{
  "success": false,
  "message": "Username, email, and password are required"
}
```

**401 Unauthorized:**

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**500 Server Error:**

```json
{
  "success": false,
  "message": "Server error during registration"
}
```

---

## ✅ Verification Checklist

After deploying to Render:

- [ ] Can register new user (get 201, check token)
- [ ] Can login with correct credentials (get 200, check token)
- [ ] Cannot login with wrong password (get 401)
- [ ] Cannot login with non-existent email (get 401)
- [ ] Cannot register duplicate email (get 400)
- [ ] Token is valid JWT format
- [ ] JWT contains user ID and role
- [ ] Logs show detailed debug info

---

## 📞 Still Having Issues?

**Check in this order:**

1. Local tests pass? → Issue is environment/deployment
2. MongoDB connection logs showing? → Check MONGO_URI
3. JWT_SECRET set on Render? → Check Dashboard
4. Frontend sending correct JSON? → Check DevTools Network
5. CORS headers correct? → Check preflight 204 responses
6. Check Render logs for `[Register]` or `[Login]` messages
7. Share full error response + console logs with timestamps
