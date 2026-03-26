#!/bin/bash

# 🚀 Script to Switch from Mock to Real Trigger.dev Integration

echo "🔧 Trigger.dev Real Integration Setup"
echo "===================================="

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found!"
    exit 1
fi

# Check current credentials
echo "📋 Current Trigger.dev credentials:"
grep "TRIGGER_" .env.local || echo "❌ No Trigger.dev credentials found"

echo ""
echo "🎯 Current Status Check:"

# Check if using mock data
if grep -q "Mock:" src/app/api/crop-image/route.ts; then
    echo "❌ APIs are using MOCK data (not real Trigger.dev)"
else
    echo "✅ APIs are configured for real Trigger.dev"
fi

# Check if credentials are placeholder
if grep -q "your-project-id" .env.local; then
    echo "❌ Using placeholder Trigger.dev credentials"
else
    echo "✅ Real Trigger.dev credentials detected"
fi

# Check if FFmpeg is installed
if command -v ffmpeg &> /dev/null; then
    echo "✅ FFmpeg is installed"
    ffmpeg -version | head -n1
else
    echo "❌ FFmpeg not found - install with: brew install ffmpeg"
fi

echo ""
echo "🚀 Next Steps:"
echo ""
echo "1. 🔑 Get Real Credentials:"
echo "   - Go to https://trigger.dev"
echo "   - Create account and project"  
echo "   - Copy Project ID and Secret Key"
echo ""
echo "2. 📝 Update .env.local:"
echo "   TRIGGER_PROJECT_ID=proj_your_real_id_here"
echo "   TRIGGER_SECRET_KEY=tr_dev_sk_your_real_key_here"
echo ""
echo "3. 🚀 Deploy Tasks:"
echo "   npx trigger.dev deploy"
echo ""
echo "4. 🔄 Switch APIs to Real Mode:"
echo "   Run: ./enable-real-trigger.sh"
echo ""
echo "5. 🧪 Test Real Integration:"
echo "   Open browser console and run: runAllAPITests()"

echo ""
echo "💡 Pro Tip: You'll know it's working when:"
echo "   - Tasks appear in your Trigger.dev dashboard"  
echo "   - API calls take 5-10 seconds (real processing time)"
echo "   - Different crop parameters produce different results"
