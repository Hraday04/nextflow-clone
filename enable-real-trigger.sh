#!/bin/bash

# 🚀 Enable Real Trigger.dev Integration (Replace Mock Data)

echo "🔄 Switching from Mock to Real Trigger.dev Integration..."
echo ""

# Backup original files
echo "📋 Creating backups..."
cp src/app/api/crop-image/route.ts src/app/api/crop-image/route.ts.backup
cp src/app/api/extract-frame/route.ts src/app/api/extract-frame/route.ts.backup

# Replace crop-image API with real Trigger.dev call
echo "🖼️  Updating crop-image API..."
cat > src/app/api/crop-image/route.ts << 'EOF'
import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, x, y, width, height } = await request.json();

    // Validate inputs
    if (!imageUrl || x === undefined || y === undefined || !width || !height) {
      return NextResponse.json(
        { error: "Missing required parameters: imageUrl, x, y, width, height" },
        { status: 400 },
      );
    }

    console.log("🚀 Triggering real crop task...", { imageUrl, x, y, width, height });

    // 🚀 REAL TRIGGER.DEV TASK
    const handle = await tasks.trigger("crop-image", {
      imageUrl,
      x,
      y,
      width,
      height
    });

    console.log("⏳ Waiting for task completion...", handle.id);

    // Wait for task completion
    const result = await tasks.retrieve(handle);
    
    console.log("✅ Task completed:", result.id);

    return NextResponse.json(result.output);
  } catch (error) {
    console.error("❌ Crop API error:", error);
    return NextResponse.json(
      { error: `Failed to process crop request: ${error.message}` },
      { status: 500 },
    );
  }
}
EOF

# Replace extract-frame API with real Trigger.dev call
echo "🎬 Updating extract-frame API..."
cat > src/app/api/extract-frame/route.ts << 'EOF'
import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, timestamp, frameNumber } = await request.json();

    // Validate inputs
    if (!videoUrl || (timestamp === undefined && frameNumber === undefined)) {
      return NextResponse.json(
        {
          error: "Missing required parameters: videoUrl and either timestamp or frameNumber",
        },
        { status: 400 },
      );
    }

    console.log("🚀 Triggering real frame extraction...", { videoUrl, timestamp, frameNumber });

    // 🚀 REAL TRIGGER.DEV TASK
    const handle = await tasks.trigger("extract-frame", {
      videoUrl,
      timestamp,
      frameNumber
    });

    console.log("⏳ Waiting for task completion...", handle.id);

    // Wait for task completion
    const result = await tasks.retrieve(handle);
    
    console.log("✅ Task completed:", result.id);

    return NextResponse.json(result.output);
  } catch (error) {
    console.error("❌ Extract frame API error:", error);
    return NextResponse.json(
      { error: `Failed to process frame extraction: ${error.message}` },
      { status: 500 },
    );
  }
}
EOF

echo "✅ APIs updated to use real Trigger.dev!"
echo ""
echo "📋 Next Steps:"
echo "1. Make sure you have real credentials in .env.local"
echo "2. Deploy your tasks: npx trigger.dev deploy"
echo "3. Test with: runAllAPITests() in browser console"
echo ""
echo "🎯 You'll know it's working when:"
echo "   - API calls take 5-10 seconds (processing time)"
echo "   - Tasks appear in your Trigger.dev dashboard"
echo "   - Different parameters produce different results"
echo ""
echo "🔄 To revert to mock mode, restore from .backup files"
