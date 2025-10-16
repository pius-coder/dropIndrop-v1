#!/bin/bash
# Test auth login endpoint

echo "Testing /api/health..."
curl -s http://localhost:3000/api/health | jq .

echo -e "\n\nTesting /api/auth/login with correct credentials..."
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@dropindrop.cm",
    "password": "Admin123!"
  }' | jq .

echo -e "\n\nDone!"
