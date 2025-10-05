#!/bin/bash

# Test script for new API endpoints
# Make sure the server is running before executing this script

BASE_URL="http://localhost:3000"

echo "Testing ShebaGreen Backend API Endpoints"
echo "========================================"
echo ""

# Test Feed Endpoint
echo "1. Testing GET /api/v1/feed"
curl -s "${BASE_URL}/api/v1/feed?page=1&limit=5" | jq '.'
echo ""
echo ""

# Test Leaderboard Endpoint
echo "2. Testing GET /api/v1/leaderboard"
curl -s "${BASE_URL}/api/v1/leaderboard?period=alltime&limit=10" | jq '.'
echo ""
echo ""

# Test Global Statistics
echo "3. Testing GET /api/v1/statistics/global"
curl -s "${BASE_URL}/api/v1/statistics/global" | jq '.'
echo ""
echo ""

# Test User Statistics (replace user123 with actual userId)
echo "4. Testing GET /api/v1/statistics/user/user123"
curl -s "${BASE_URL}/api/v1/statistics/user/user123" | jq '.'
echo ""
echo ""

# Test Health Endpoint
echo "5. Testing GET /health"
curl -s "${BASE_URL}/health" | jq '.'
echo ""
echo ""

echo "========================================"
echo "All tests completed!"
echo "Note: Some endpoints may return empty arrays if no data exists yet."
