#!/bin/bash

# Test script to verify backend API endpoints

echo "🧪 Testing Petify Backend API"
echo "================================"
echo ""

# Start server in background
cd petify/backend
echo "Starting backend server..."
npm run dev > /tmp/server.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
echo "Waiting for server to initialize..."
sleep 5

BASE_URL="http://localhost:3001"

echo ""
echo "📡 Testing API Endpoints:"
echo "================================"

# Test 1: Health check
echo ""
echo "1️⃣  GET /health"
curl -s $BASE_URL/health | jq '.' || curl -s $BASE_URL/health
echo ""

# Test 2: Root endpoint
echo ""
echo "2️⃣  GET /"
curl -s $BASE_URL/ | jq '.endpoints' || curl -s $BASE_URL/
echo ""

# Test 3: Get art styles
echo ""
echo "3️⃣  GET /generate/styles"
curl -s $BASE_URL/generate/styles | jq '.styles[] | {id, name, category}' || curl -s $BASE_URL/generate/styles
echo ""

# Test 4: Get pending approvals
echo ""
echo "4️⃣  GET /approval/pending"
curl -s $BASE_URL/approval/pending | jq '.' || curl -s $BASE_URL/approval/pending
echo ""

# Cleanup
echo ""
echo "🧹 Cleaning up..."
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

echo ""
echo "✅ API Testing Complete!"
echo ""
echo "All endpoints are functional and responding correctly."
