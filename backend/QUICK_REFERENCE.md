# Quick Reference - Register & Login API

## Register API

**Endpoint:** `POST /api/auth/register`

**Request:**

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepass123",
  "role": "student" // optional, defaults to "student"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "...",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "student",
    "token": "eyJhbGc..."
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Username, email, and password are required"
}
```

---

## Login API

**Endpoint:** `POST /api/auth/login`

**Request:**

```json
{
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "...",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "student",
    "token": "eyJhbGc..."
  }
}
```

**Error Response (401):**

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## Common Issues & Solutions

| Issue                | Cause               | Solution                           |
| -------------------- | ------------------- | ---------------------------------- |
| **400 Bad Request**  | Missing fields      | Send all required fields           |
| **400 Bad Request**  | Password < 6 chars  | Use password with 6+ characters    |
| **400 Bad Request**  | User already exists | Use different email/username       |
| **401 Unauthorized** | Email doesn't exist | Create account first with register |
| **401 Unauthorized** | Wrong password      | Check password and try again       |
| **500 Server Error** | MONGO_URI not set   | Set MONGO_URI on Render            |
| **500 Server Error** | JWT_SECRET not set  | Set JWT_SECRET on Render           |

---

## Testing Commands

**Test Register:**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"pass123"}'
```

**Test Login:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}'
```

---

## Render Environment Variables

```
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/college-events?retryWrites=true&w=majority
JWT_SECRET=your_secret_key_here_at_least_32_characters
NODE_ENV=production
```

---

## What's Fixed

✅ No more 500 errors on login
✅ Safe bcrypt.compare (no crashes)
✅ Proper validation (400 errors)
✅ Null-safe user lookup
✅ Structured responses
✅ Debug logging
✅ Production ready
