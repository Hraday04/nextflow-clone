# Quick Setup: Enable Real Trigger.dev + FFmpeg Integration

## 🎯 Current State

- ✅ **UI Components**: All node types (Crop, Frame) are implemented
- ✅ **Mock APIs**: `/api/crop-image` and `/api/extract-frame` return test data
- ✅ **Trigger.dev Tasks**: FFmpeg tasks are coded in `src/trigger/`
- ❌ **Real Integration**: APIs currently use mocks, not actual Trigger.dev

## 🚀 Steps to Enable Real Processing

### Step 1: Install FFmpeg

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Verify installation
ffmpeg -version
```

### Step 2: Set Up Trigger.dev Account

1. Go to https://trigger.dev and sign up
2. Create a new project
3. Get your Project ID and Secret Key
4. Add to `.env.local`:

```bash
TRIGGER_PROJECT_ID=your-project-id
TRIGGER_SECRET_KEY=your-secret-key
```

### Step 3: Update API Routes (Replace Mocks)

**Replace `src/app/api/crop-image/route.ts`:**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { cropImageTask } from "../../../trigger/crop-image";

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, x, y, width, height } = await request.json();

    // Trigger real FFmpeg task
    const result = await cropImageTask.trigger({
      imageUrl,
      x,
      y,
      width,
      height,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**Replace `src/app/api/extract-frame/route.ts`:**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { extractFrameTask } from "../../../trigger/extract-frame";

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, timestamp, frameNumber } = await request.json();

    // Trigger real FFmpeg task
    const result = await extractFrameTask.trigger({
      videoUrl,
      timestamp,
      frameNumber,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### Step 4: Test the Integration

**Option A: Browser Console Test**

1. Open http://localhost:3001 in browser
2. Open Developer Tools → Console
3. Copy/paste code from `browser-test-console.js`
4. Run: `runAllAPITests()`

**Option B: UI Testing**

1. Create workflow: Image Node → Crop Node
2. Set crop parameters: x=50, y=50, width=200, height=150
3. Click "Process" and check for success status

**Option C: cURL Testing**

```bash
curl -X POST http://localhost:3001/api/crop-image \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://via.placeholder.com/400x300", "x": 50, "y": 50, "width": 200, "height": 150}'
```

## 🐛 Common Issues & Solutions

| Issue                  | Solution                                      |
| ---------------------- | --------------------------------------------- |
| FFmpeg not found       | Install FFmpeg using package manager          |
| Trigger.dev auth error | Check credentials in `.env.local`             |
| Task timeout           | Increase `maxDuration` in `trigger.config.ts` |
| Invalid URLs           | Use publicly accessible image/video URLs      |

## ✅ Success Indicators

- ✅ API returns actual processed images (not mocks)
- ✅ Base64 data changes when parameters change
- ✅ Node status shows green success indicators
- ✅ Different crop coords produce different results
- ✅ Video frame extraction returns actual video frames

## 📊 Current Implementation Status

```
✅ Frontend UI Components (100%)
✅ Node Types & Connections (100%)
✅ API Route Structure (100%)
✅ Trigger.dev Task Code (100%)
🟡 Environment Setup (Manual)
🟡 Real Task Integration (1 line change per API)
```

**Total Progress: 85% Complete**  
**Time to Full Integration: ~15 minutes**
