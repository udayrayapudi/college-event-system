const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

exports.register = async (req, res) => {
  console.log(
    "[Register] Incoming request - Headers:",
    req.get("content-type"),
  );
  console.log("[Register] Raw req.body:", JSON.stringify(req.body, null, 2));

  const { username, email, password, role } = req.body;

  // Input validation
  if (!username || !email || !password) {
    console.warn(
      `[Register] Missing fields - username: ${!!username}, email: ${!!email}, password: ${!!password}`,
    );
    return res.status(400).json({
      message: "Username, email, and password are required",
    });
  }

  if (
    typeof username !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    console.warn(
      `[Register] Invalid types - username: ${typeof username}, email: ${typeof email}, password: ${typeof password}`,
    );
    return res.status(400).json({
      message: "All fields must be valid strings",
    });
  }

  const trimmedUsername = username.trim();
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  if (!trimmedUsername || !trimmedEmail || !trimmedPassword) {
    console.warn(
      `[Register] Fields empty after trim - username: ${!!trimmedUsername}, email: ${!!trimmedEmail}, password: ${!!trimmedPassword}`,
    );
    return res.status(400).json({
      message: "Fields cannot be empty",
    });
  }

  // Basic email validation
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(trimmedEmail)) {
    console.warn(`[Register] Invalid email format: ${trimmedEmail}`);
    return res.status(400).json({
      message: "Please provide a valid email address",
    });
  }

  // Password length validation
  if (trimmedPassword.length < 6) {
    console.warn(
      `[Register] Password too short: ${trimmedPassword.length} characters`,
    );
    return res.status(400).json({
      message: "Password must be at least 6 characters",
    });
  }

  try {
    console.log(
      `[Register] Checking duplicate user - email: ${trimmedEmail}, username: ${trimmedUsername}`,
    );
    // Check if user already exists
    const userExists = await User.findOne({
      $or: [{ email: trimmedEmail }, { username: trimmedUsername }],
    });

    if (userExists) {
      console.warn(
        `[Register] Duplicate user found - email match: ${userExists.email === trimmedEmail}, username match: ${userExists.username === trimmedUsername}`,
      );
      return res.status(400).json({
        message: "User already exists with this email or username",
      });
    }

    console.log(`[Register] No duplicate found, creating user...`);
    // Create new user
    const user = await User.create({
      username: trimmedUsername,
      email: trimmedEmail,
      password: trimmedPassword,
      role: role || "student",
    });

    console.log(
      `[Register] ✓ User created - ID: ${user._id}, Email: ${user.email}`,
    );
    console.log(
      `[Register] ✓ Password hashed (length: ${user.password.length})`,
    );

    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error(`[Register] ✗ Error:`, {
      message: error.message,
      code: error.code,
      name: error.name,
      details: error.errors || error,
    });

    // Handle specific database errors
    if (error.code === 11000) {
      console.warn("[Register] Duplicate key error (index)");
      return res.status(400).json({
        message: "User with this email or username already exists",
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      console.warn("[Register] Validation error:", messages);
      return res.status(400).json({
        message: `Validation error: ${messages.join(", ")}`,
      });
    }

    // Generic server error - don't expose details to client
    return res.status(500).json({
      message: "Server error during registration",
    });
  }
};

exports.login = async (req, res) => {
  console.log("[Login] Incoming request - Headers:", req.get("content-type"));
  console.log("[Login] Raw req.body:", JSON.stringify(req.body, null, 2));

  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    console.warn(
      `[Login] Missing fields - email: ${!!email}, password: ${!!password}`,
    );
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  if (typeof email !== "string" || typeof password !== "string") {
    console.warn(
      `[Login] Invalid types - email: ${typeof email}, password: ${typeof password}`,
    );
    return res.status(400).json({
      message: "Email and password must be valid strings",
    });
  }

  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  if (!trimmedEmail || !trimmedPassword) {
    console.warn(
      `[Login] Fields empty after trim - email: ${!!trimmedEmail}, password: ${!!trimmedPassword}`,
    );
    return res.status(400).json({
      message: "Email and password cannot be empty",
    });
  }

  try {
    console.log(`[Login] Looking up user by email: ${trimmedEmail}`);
    // Query database for user
    const user = await User.findOne({ email: trimmedEmail });

    // User not found - return 401 (Unauthorized), not 500
    if (!user) {
      console.warn(`[Login] ✗ User not found for email: ${trimmedEmail}`);
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    console.log(`[Login] ✓ User found - ID: ${user._id}, Email: ${user.email}`);
    console.log(`[Login] Stored password hash length: ${user.password.length}`);

    // Compare password safely with bcrypt
    let isPasswordMatch = false;
    try {
      console.log(`[Login] Comparing password using bcrypt...`);
      isPasswordMatch = await user.comparePassword(trimmedPassword);
      console.log(`[Login] Password comparison result: ${isPasswordMatch}`);
    } catch (bcryptError) {
      console.error("[Login] ✗ Bcrypt comparison failed:", {
        message: bcryptError.message,
        stack: bcryptError.stack,
      });
      return res.status(500).json({
        message: "Authentication service error",
      });
    }

    // Password mismatch
    if (!isPasswordMatch) {
      console.warn(`[Login] ✗ Invalid password for user ID: ${user._id}`);
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Successful login
    console.log(`[Login] ✓ Password matched for user ID: ${user._id}`);
    console.log(`[Login] Generating JWT token...`);

    const token = generateToken(user._id, user.role);
    console.log(`[Login] ✓ Token generated (length: ${token.length})`);

    console.log(`[Login] ✓✓ Successful login for user: ${user.email}`);

    return res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error("[Login] ✗ Unexpected error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    // Don't expose error details to client
    return res.status(500).json({
      message: "Server error during login",
    });
  }
};
