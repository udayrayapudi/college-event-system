const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");

const eventRoutes = require("./routes/eventRoutes");

dotenv.config();

const app = express();

const whitelist = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://college-event-system.vercel.app",
  "https://college-event-system1.onrender.com", // Allow requests from Render frontend if hosted there
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl requests, Postman, etc.)
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked request from origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

app.get("/", (req, res) => {
  res.send("College Event Management API is running!");
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Validate critical environment variables
if (!MONGO_URI) {
  console.error("[ERROR] MONGO_URI is not set in environment variables");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("[ERROR] JWT_SECRET is not set in environment variables");
  process.exit(1);
}

console.log(
  `[Startup] Connecting to MongoDB at: ${MONGO_URI.substring(0, 50)}...`,
);
console.log(`[Startup] Server will listen on port: ${PORT}`);
console.log(`[Startup] CORS enabled for: ${whitelist.join(", ")}`);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("[MongoDB] ✓ Connected successfully");

    app.listen(PORT, () => {
      console.log(`[Server] ✓ Running on port ${PORT}`);
      console.log(`[API] Available at: http://localhost:${PORT}`);
      console.log(
        `[Routes] Auth: POST /api/auth/register, POST /api/auth/login`,
      );
    });
  })
  .catch((err) => {
    console.error("[MongoDB] ✗ Connection failed:", err.message);
    process.exit(1);
  });
