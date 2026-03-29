// Frontend API Testing Utility
// Add this code to browser console or create a test file

// Test Register
async function testRegister() {
  const payload = {
    username: "testuser" + Date.now(),
    email: `test${Date.now()}@example.com`,
    password: "password123",
    role: "student",
  };

  console.log("[TEST] Register Request Payload:", payload);

  try {
    const response = await fetch(
      "https://college-event-system1.onrender.com/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await response.json();

    console.log("[TEST] Register Response Status:", response.status);
    console.log("[TEST] Register Response Headers:", {
      "content-type": response.headers.get("content-type"),
    });
    console.log("[TEST] Register Response Data:", data);

    if (response.ok) {
      console.log("✓ Register Success!");
      return data.data;
    } else {
      console.error("✗ Register Failed!");
      return null;
    }
  } catch (error) {
    console.error("[TEST] Register Error:", error);
    return null;
  }
}

// Test Login
async function testLogin(email, password) {
  const payload = { email, password };

  console.log("[TEST] Login Request Payload:", payload);

  try {
    const response = await fetch(
      "https://college-event-system1.onrender.com/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await response.json();

    console.log("[TEST] Login Response Status:", response.status);
    console.log("[TEST] Login Response Data:", data);

    if (response.ok) {
      console.log("✓ Login Success!");
      console.log("✓ Token:", data.data.token);
      return data.data;
    } else {
      console.error("✗ Login Failed!");
      return null;
    }
  } catch (error) {
    console.error("[TEST] Login Error:", error);
    return null;
  }
}

// Test Full Flow
async function testFullFlow() {
  console.log("=== STARTING FULL AUTH TEST ===");

  // Step 1: Register
  const user = await testRegister();
  if (!user) {
    console.error("Registration failed, stopping test");
    return;
  }

  // Step 2: Login with correct password
  console.log("\n=== Testing Login with Correct Password ===");
  const loginSuccess = await testLogin(user.email, "password123");

  if (!loginSuccess) {
    console.error("Login with correct password failed");
  }

  // Step 3: Login with wrong password
  console.log("\n=== Testing Login with Wrong Password ===");
  const loginFail = await testLogin(user.email, "wrongpassword");

  if (loginFail) {
    console.error("Login with wrong password should have failed!");
  } else {
    console.log("✓ Correctly rejected wrong password");
  }

  console.log("\n=== TEST COMPLETE ===");
}

// Usage in browser console:
// testRegister() -> test register
// testLogin("email@test.com", "password123") -> test login
// testFullFlow() -> run full test flow
