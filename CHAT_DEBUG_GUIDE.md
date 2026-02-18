# Chat Endpoint Debugging Guide

## Issue Summary
Getting "Invalid Responses API request" error when using the chat endpoint with OpenRouter.

## Root Causes Identified

The error "Invalid Responses API request" typically occurs when the AI SDK on the **frontend** cannot parse the response stream from the backend. This can happen due to:

1. **Missing Required Headers**: OpenRouter requires `HTTP-Referer` and `X-Title` headers for some models
2. **Model Availability**: Free models on OpenRouter can be down or unavailable
3. **Stream Format Mismatch**: The response format from OpenRouter might not match what the AI SDK expects
4. **API Key Issues**: OpenRouter API key not being loaded correctly in the server environment

## Changes Made

### 1. Added Required Headers (chat.ts lines 15-18)
```typescript
headers: {
  'HTTP-Referer': 'http://localhost:3000',
  'X-Title': 'Work Log App',
}
```

### 2. Added Extensive Logging (chat.ts lines 29-39, 60-107)
- Log raw messages from client  
- Log converted model messages
- Log API key presence
- Log stream errors with full stack traces

### 3. Simplified Configuration
- Removed tools temporarily to isolate the issue
- Using `openrouter/auto:free` which automatically selects a working free model
- Added `sendStart: true` to ensure stream initializes properly
- Added proper error handler that returns a string

### 4. Improved Error Handling
- Wrapped streamText in try-catch
- Added onError handler in toUIMessageStreamResponse
- Better error logging with details

## Next Steps to Debug

1. **Check Server Console Logs**: Look for the console.log outputs when you send a message:
   - "Using OpenRouter Key: true/false"
   - "Raw messages from client"
   - "Converted model messages"
   - "About to call streamText with OpenRouter..."
   - Any error messages

2. **Check Browser Network Tab**:
   - Open DevTools > Network
   - Send a message
   - Look for the `/api/chat` request
   - Check the response - is it streaming? Is there an error in the response body?

3. **Verify API Key**:
   - Check that VITE_OPENROUTER_KEY is set in .env
   - The server console should show "Using OpenRouter Key: true"

4. **Try Different Model**:
   If `openrouter/auto:free` doesn't work, try these alternatives:
   - `meta-llama/llama-3.1-8b-instruct:free`
   - `mistralai/mistral-7b-instruct:free`
   - `google/gemini-2.0-flash-exp:free`

## Common Fixes

### If the API key is not loading:
The server might not be picking up environment variables. Try:
1. Restart the dev server
2. Check that `.env` file is in the project root
3. Verify the key starts with `sk-or-v1-`

### If models are unavailable:
OpenRouter free tier can be rate-limited or models can be down. Use `openrouter/auto:free` which automatically finds a working model.

### If stream parsing fails:
The issue might be with how the frontend is consuming the stream. Check `AIChatSidbar.tsx` lines 37-54 to ensure the transport is configured correctly.

## Testing

To test the endpoint directly:
```bash
# Get a valid auth token from your browser (localStorage or cookies)
# Then run:
curl -X POST http://localhost:5173/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "messages": [
      {
        "id": "test-1", 
        "role": "user",
        "parts": [{"type": "text", "text": "Hello"}]
      }
    ],
    "sessionId": "test-123"
  }'
```

## Files Modified
- `server/routes/chat.ts` - Main chat endpoint with extensive logging
- `test-chat.js` - Node.js test script (not used)
- `test-chat-endpoint.sh` - Bash test script

## Current Configuration
- Model: `openrouter/auto:free`
- Temperature: 0.7
- Tools: Disabled (for debugging)
- Enhanced logging: Enabled
