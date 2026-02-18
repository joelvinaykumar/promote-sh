#!/bin/bash

# Test the chat endpoint directly with curl

# Get your bearer token (you'll need to replace this)
TOKEN="your_token_here"

curl -X POST http://localhost:5173/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "messages": [
      {
        "id": "test-1",
        "role": "user",
        "parts": [
          {
            "type": "text",
            "text": "Hello, can you help me?"
          }
        ]
      }
    ],
    "sessionId": "test-session-123"
  }' \
  -v
