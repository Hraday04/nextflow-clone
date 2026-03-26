# 🚀 Complete Trigger.dev Setup Guide

## Why You're Not Seeing Tasks in Trigger.dev

**Current Status**: Your APIs return mock data, so no actual tasks are being sent to Trigger.dev.

**The Issue**:

- `.env.local` has placeholder values (`your-project-id`, `your-secret-key`)
- API routes use mock responses instead of real Trigger.dev calls
- Tasks haven't been deployed to Trigger.dev

---

## 🔧 Step-by-Step Real Integration

### Step 1: Create Trigger.dev Account & Project

1. **Go to**: https://trigger.dev
2. **Sign up** with GitHub/email
3. **Create a new project**
4. **Copy your credentials** from the dashboard

### Step 2: Update Environment Variables

Replace the placeholder values in `.env.local`:

```bash
# Replace these placeholder values with your real Trigger.dev credentials
TRIGGER_PROJECT_ID=p # Your real project ID
TRIGGER_SECRET_KEY=t  # Your real secret key

# Keep your existing API keys
NEXT_PUBLIC_GEMINI_API_KEY=dummy
NEXT_PUBLIC_OPENAI_API_KEY=dummy
NEXT_PUBLIC_GROQ_API_KEY=dummy
```

### Step 3: Install Trigger.dev CLI

```bash
npm install -g @trigger.dev/cli
```

### Step 4: Deploy Your Tasks

```bash
# Deploy tasks to Trigger.dev
npx trigger.dev deploy

# Or run in development mode
npx trigger.dev dev
```

### Step 5: Update API Routes to Use Real Tasks

Currently your APIs use mock data. Update them to use real Trigger.dev tasks:

**Update `src/app/api/crop-image/route.ts`:**

```typescript
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

    // 🚀 REAL TRIGGER.DEV TASK (replace mock)
    const handle = await tasks.trigger("crop-image", {
      imageUrl,
      x,
      y,
      width,
      height,
    });

    // Wait for task completion
    const result = await tasks.retrieve(handle);

    return NextResponse.json(result.output);
  } catch (error) {
    console.error("Crop API error:", error);
    return NextResponse.json(
      { error: "Failed to process crop request" },
      { status: 500 },
    );
  }
}
```

**Update `src/app/api/extract-frame/route.ts`:**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, timestamp, frameNumber } = await request.json();

    // Validate inputs
    if (!videoUrl || (timestamp === undefined && frameNumber === undefined)) {
      return NextResponse.json(
        {
          error:
            "Missing required parameters: videoUrl and either timestamp or frameNumber",
        },
        { status: 400 },
      );
    }

    // 🚀 REAL TRIGGER.DEV TASK (replace mock)
    const handle = await tasks.trigger("extract-frame", {
      videoUrl,
      timestamp,
      frameNumber,
    });

    // Wait for task completion
    const result = await tasks.retrieve(handle);

    return NextResponse.json(result.output);
  } catch (error) {
    console.error("Extract frame API error:", error);
    return NextResponse.json(
      { error: "Failed to process frame extraction request" },
      { status: 500 },
    );
  }
}
```

---

## 🧪 Testing Real Integration

### After Setting Up Real Credentials:

1. **Deploy tasks**: `npx trigger.dev deploy`
2. **Run tests again** using the browser console
3. **Check Trigger.dev dashboard** - you should now see:
   - ✅ Tasks appearing in your dashboard
   - ✅ Real execution logs
   - ✅ Actual processing times
   - ✅ Success/failure status

### Verification Steps:

```javascript
// In browser console - this will now hit real Trigger.dev
testCropAPI().then((result) => {
  console.log("Real result from Trigger.dev:", result);
  // Should contain actual processed image data
});
```

---

## 🔍 How to Know It's Working

### ❌ **Current State (Mock Data)**:

- ✅ APIs return immediately
- ✅ Always shows "success"
- ❌ No tasks in Trigger.dev dashboard
- ❌ Same result regardless of parameters
- ❌ No FFmpeg processing

### ✅ **Real Integration Working**:

- ⏳ APIs take a few seconds (processing time)
- 📊 Tasks appear in Trigger.dev dashboard
- 🖼️ Different parameters produce different results
- 🔧 FFmpeg logs visible in Trigger.dev
- ✅ Real cropped/extracted images

---

## 🚨 Common Issues

| Issue                | Solution                                 |
| -------------------- | ---------------------------------------- |
| "Invalid project ID" | Check `.env.local` has real credentials  |
| "Tasks not found"    | Run `npx trigger.dev deploy` first       |
| "FFmpeg not found"   | Install FFmpeg: `brew install ffmpeg`    |
| "Permission denied"  | Check API key permissions in Trigger.dev |

---

## 🎯 Quick Test

After setup, run this in browser console:

```javascript
// This should now take 5-10 seconds and show real processing
testCropAPI().then((result) => {
  console.log("Processing time indicates real vs mock:", result);
});
```

**Mock = instant response**  
**Real = 5-10 second processing time**
