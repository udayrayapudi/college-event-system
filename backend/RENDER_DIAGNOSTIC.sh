#!/bin/bash
# Render Diagnostic Script - Check what's happening with login

echo "=== COLLEGE EVENT SYSTEM - RENDER DIAGNOSTIC ==="
echo ""

# API Base URL
API_URL="https://college-event-system1.onrender.com/api"

# Test 1: Health Check
echo "1️⃣  Testing API Connectivity..."
curl -i -X GET "https://college-event-system1.onrender.com/" 2>/dev/null | head -5
echo ""
echo ""

# Test 2: Register a NEW user with random email
RANDOM_EMAIL="testuser$(date +%s)@example.com"
echo "2️⃣  Attempting to register new user..."
echo "Email: $RANDOM_EMAIL"
echo ""

REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"testuser_$(date +%s)\",
    \"email\": \"$RANDOM_EMAIL\",
    \"password\": \"password123\",
    \"role\": \"student\"
  }")

echo "Register Response:"
echo "$REGISTER_RESPONSE" | jq . 2>/dev/null || echo "$REGISTER_RESPONSE"
echo ""
echo ""

# Test 3: Try to login with the newly registered user
echo "3️⃣  Attempting to login with the new user..."
echo "Email: $RANDOM_EMAIL"
echo "Password: password123"
echo ""

LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$RANDOM_EMAIL\",
    \"password\": \"password123\"
  }")

echo "Login Response:"
echo "$LOGIN_RESPONSE" | jq . 2>/dev/null || echo "$LOGIN_RESPONSE"
echo ""
echo ""

# Test 4: Check response status code
echo "4️⃣  Testing with verbose output..."
curl -v -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"udayrayapudi99@gmail.com\",
    \"password\": \"password123\"
  }" 2>&1 | grep -E "< HTTP|Connection:|Content-Type:"

echo ""
echo "=== DIAGNOSTIC COMPLETE ==="
echo ""
echo "Check the Render Logs for messages starting with:"
echo "  [Login]"
echo "  [Register]"
echo "  [MongoDB]"
echo "  [ERROR]"
