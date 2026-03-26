#!/bin/bash

# Test Transloadit authentication and signature validation
echo "🧪 Testing Transloadit Authentication..."

# Get fresh signature
echo "📝 Getting fresh signature..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/transloadit/signature \
  -H "Content-Type: application/json" \
  -d '{"fileType": "image"}')

echo "✅ Signature Response: $RESPONSE"

# Extract signature and params
SIGNATURE=$(echo $RESPONSE | jq -r '.signature')
PARAMS=$(echo $RESPONSE | jq -r '.params | tostring')

echo "🔐 Signature: $SIGNATURE"
echo "📋 Params: $PARAMS"

# Create test file
echo "test content for transloadit" > test_auth.txt

# Test upload with generated signature  
echo "🚀 Testing upload with generated signature..."
UPLOAD_RESPONSE=$(curl -s -X POST https://api2.transloadit.com/assemblies \
  -F "params=$PARAMS" \
  -F "signature=$SIGNATURE" \
  -F "file=@test_auth.txt")

echo "📥 Upload Response:"
echo $UPLOAD_RESPONSE | jq '.'

# Check for errors
ERROR=$(echo $UPLOAD_RESPONSE | jq -r '.error // empty')
if [ ! -z "$ERROR" ]; then
  echo "❌ Upload failed with error: $ERROR"
  echo "💬 Message: $(echo $UPLOAD_RESPONSE | jq -r '.message // empty')"
else
  echo "✅ Upload successful!"
fi

# Clean up
rm -f test_auth.txt
