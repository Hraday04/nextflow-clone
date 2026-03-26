# Testing Trigger.dev + FFmpeg Integration Guide

This guide shows you how to test the Trigger.dev tasks for image cropping and video frame extraction.

## 🚀 Current Implementation Status

### ✅ What's Already Implemented

1. **Trigger.dev Tasks**:
   - `src/trigger/crop-image.ts` - FFmpeg-based image cropping
   - `src/trigger/extract-frame.ts` - FFmpeg-based video frame extraction
   - `trigger/tasks/croptask.ts` - Simple crop task
   - `trigger/tasks/llmtask.ts` - LLM processing task

2. **API Endpoints**:
   - `/api/crop-image` - Currently returns mock data
   - `/api/extract-frame` - Currently returns mock data

3. **Node Integration**:
   - `CropNode.tsx` - Calls `/api/crop-image`
   - `FrameNode.tsx` - Calls `/api/extract-frame`

## 🔧 Setup Requirements

### 1. Install Dependencies

```bash
npm install @trigger.dev/sdk@^4.4.3
```

### 2. Environment Variables

Create/update `.env.local`:

```bash
# Trigger.dev Configuration
TRIGGER_PROJECT_ID=your-project-id-here
TRIGGER_SECRET_KEY=your-secret-key-here
TRIGGER_API_URL=https://api.trigger.dev
```

### 3. FFmpeg Installation

Ensure FFmpeg is installed on your system:

**macOS:**

```bash
brew install ffmpeg
```

**Ubuntu/Debian:**

```bash
sudo apt update && sudo apt install ffmpeg
```

**Windows:**
Download from https://ffmpeg.org/download.html

Verify installation:

```bash
ffmpeg -version
```

## 🧪 Testing Methods

### Method 1: Test API Endpoints Directly

#### Test Crop Image API

```bash
curl -X POST http://localhost:3000/api/crop-image \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://via.placeholder.com/400x300/0000FF/FFFFFF?text=Test+Image",
    "x": 50,
    "y": 50,
    "width": 200,
    "height": 150
  }'
```

#### Test Extract Frame API

```bash
curl -X POST http://localhost:3000/api/extract-frame \
  -H "Content-Type: application/json" \
  -d '{
    "videoUrl": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    "timestamp": 2.5
  }'
```

### Method 2: Test Through UI

1. **Start the development server**:

   ```bash
   npm run dev
   ```

2. **Create a test workflow**:
   - Add an Image node with a test image URL
   - Add a Crop node and connect it to the Image node
   - Configure crop parameters (x: 50, y: 50, width: 200, height: 150)
   - Click "Process" on the Crop node

3. **Test video frame extraction**:
   - Add a Video node with a test video URL
   - Add a Frame node and connect it to the Video node
   - Configure timestamp (e.g., 2.5 seconds)
   - Click "Extract" on the Frame node

### Method 3: Enable Real Trigger.dev Tasks

To use actual Trigger.dev tasks instead of mocks, update the API endpoints:

#### Update `/api/crop-image/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { cropImageTask } from "../../../trigger/crop-image";

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, x, y, width, height } = await request.json();

    // Validate inputs
    if (!imageUrl || x === undefined || y === undefined || !width || !height) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    // Trigger the actual Trigger.dev task
    const result = await cropImageTask.trigger({
      imageUrl,
      x,
      y,
      width,
      height,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Crop API error:", error);
    return NextResponse.json(
      { error: "Failed to process crop request" },
      { status: 500 },
    );
  }
}
```

#### Update `/api/extract-frame/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { extractFrameTask } from "../../../trigger/extract-frame";

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, timestamp, frameNumber } = await request.json();

    // Validate inputs
    if (!videoUrl || (timestamp === undefined && frameNumber === undefined)) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    // Trigger the actual Trigger.dev task
    const result = await extractFrameTask.trigger({
      videoUrl,
      timestamp,
      frameNumber,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Extract frame API error:", error);
    return NextResponse.json(
      { error: "Failed to process frame extraction" },
      { status: 500 },
    );
  }
}
```

## 🎯 Testing Scenarios

### Scenario 1: Basic Image Cropping

1. Use image URL: `https://via.placeholder.com/400x300/FF0000/FFFFFF?text=RED+IMAGE`
2. Crop parameters: x=100, y=75, width=200, height=150
3. Expected: Returns cropped image as base64

### Scenario 2: Video Frame Extraction

1. Use video URL: `https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4`
2. Extract frame at: timestamp=3.0 seconds
3. Expected: Returns extracted frame as base64 image

### Scenario 3: Error Handling

1. Test with invalid URLs
2. Test with negative crop coordinates
3. Test with missing parameters

## 🐛 Troubleshooting

### Common Issues

1. **FFmpeg not found**:

   ```
   Error: ffmpeg: command not found
   ```

   **Solution**: Install FFmpeg using the methods above

2. **Trigger.dev authentication error**:

   ```
   Error: Unauthorized
   ```

   **Solution**: Check `TRIGGER_PROJECT_ID` and `TRIGGER_SECRET_KEY` in `.env.local`

3. **Network timeout**:

   ```
   Error: Request timeout
   ```

   **Solution**: Increase `maxDuration` in `trigger.config.ts`

4. **Invalid video/image URLs**:
   **Solution**: Test with publicly accessible URLs first

## 🚀 Running Trigger.dev Development Server

To run the Trigger.dev development server:

```bash
npm run trigger:dev
```

This will:

- Start the Trigger.dev development environment
- Watch for changes in your tasks
- Provide a dashboard for monitoring task execution

## 📊 Monitoring Task Execution

1. **Check Console Logs**: Both in your app and Trigger.dev dashboard
2. **Use Run History Panel**: The UI panel shows task execution status
3. **API Response Inspection**: Check network tab in browser dev tools

## ✅ Success Indicators

- **API endpoints return 200 status**
- **Base64 image data is returned**
- **No FFmpeg errors in logs**
- **Trigger.dev dashboard shows successful task execution**
- **UI nodes show "success" status with green indicators**

## 🔄 Next Steps

1. **Set up Trigger.dev account** and get real project credentials
2. **Replace mock responses** with actual task triggers
3. **Add more robust error handling**
4. **Implement file upload/storage** for larger media files
5. **Add progress indicators** for long-running tasks
