# Frame Extraction Implementation Guide

## Overview

The FrameNode component supports two methods for extracting frames from videos:

1. **Local Frame Extraction** (Canvas API) - For uploaded video files
2. **Remote Frame Extraction** (Trigger.dev + FFmpeg) - For public video URLs

## Implementation Details

### Local Frame Extraction (Canvas API)

**When used:**

- Video uploaded via file input (blob: URLs)
- VideoNode has `isLocal: true` flag set

**How it works:**

1. Uses HTML5 `<video>` element to load the local video file
2. Creates a hidden `<canvas>` element for frame capture
3. Seeks to specified timestamp in the video
4. Draws the video frame to canvas using `drawImage()`
5. Exports frame as base64 JPEG data using `toDataURL()`

**Advantages:**

- ✅ Works entirely in the browser
- ✅ No external dependencies required
- ✅ Instant processing (no API calls)
- ✅ Works offline
- ✅ No file upload to server needed

**Limitations:**

- ⚠️ Only works with files accessible to the browser
- ⚠️ Limited by browser video codec support
- ⚠️ File size limitations (browser memory)

### Remote Frame Extraction (Trigger.dev + FFmpeg)

**When used:**

- Video provided via public URL (http/https)
- VideoNode has `isLocal: false` flag set

**How it works:**

1. Sends video URL and timestamp to `/api/extract-frame` endpoint
2. API triggers FFmpeg processing via Trigger.dev
3. FFmpeg downloads video and extracts frame at specified time
4. Returns base64 encoded frame data
5. Node displays extracted frame

**Advantages:**

- ✅ Works with any public video URL
- ✅ Supports all video formats FFmpeg can handle
- ✅ No file size limitations
- ✅ Powerful FFmpeg capabilities

**Limitations:**

- ⚠️ Requires internet connection
- ⚠️ Processing time (3-8 seconds typically)
- ⚠️ Video must be publicly accessible
- ⚠️ Depends on external services

## Usage Instructions

### For Local Videos

1. **Upload Video:**
   - Click "📁 Upload local video" in VideoNode
   - Select a video file from your computer
   - Video preview will show with "⚠️ Local only" indicator

2. **Extract Frame:**
   - Connect VideoNode to FrameNode
   - Set desired timestamp in seconds
   - Click "🎬 Extract Frame"
   - Frame will be extracted instantly using Canvas API

3. **Debug Info:**
   - Check browser console for detailed logs
   - Local extraction shows Canvas API operations
   - Frame data is generated as base64 image

### For Remote Videos

1. **Add URL:**
   - Enter public video URL in VideoNode
   - Click "Add" to validate and load
   - Video preview will show with "✅ Remote ready" indicator

2. **Extract Frame:**
   - Connect VideoNode to FrameNode
   - Set desired timestamp in seconds
   - Click "🎬 Extract Frame"
   - Wait 3-8 seconds for processing

3. **Debug Info:**
   - Check browser console for API call logs
   - Remote extraction shows Trigger.dev processing
   - Real or mock response based on configuration

## Testing Both Methods

### Test Local Extraction

```bash
# Start development server
npm run dev

# In browser:
# 1. Add VideoNode and FrameNode to canvas
# 2. Upload a video file to VideoNode
# 3. Connect VideoNode → FrameNode
# 4. Set timestamp (e.g., 2.5 seconds)
# 5. Click "Extract Frame" in FrameNode
# 6. Check console for Canvas API logs
```

### Test Remote Extraction

```bash
# Test with public video URLs:
# - https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
# - https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4

# In browser:
# 1. Add VideoNode and FrameNode to canvas
# 2. Enter public video URL in VideoNode
# 3. Connect VideoNode → FrameNode
# 4. Set timestamp (e.g., 5 seconds)
# 5. Click "Extract Frame" in FrameNode
# 6. Wait for processing and check result
```

## Error Handling

### Local Extraction Errors

- **"Video element not available"** - Video ref not initialized
- **"Canvas context not available"** - Canvas creation failed
- **"Video loading failed"** - File format not supported
- **Canvas drawing errors** - Video dimensions issues

### Remote Extraction Errors

- **"No video input"** - No VideoNode connected
- **"Invalid video URL format"** - URL doesn't start with http/https
- **API errors** - Trigger.dev processing failures
- **Network errors** - Internet connectivity issues

## Code Structure

### Key Files

- `src/components/canvas/nodes/FrameNode.tsx` - Main component
- `src/components/canvas/nodes/VideoNode.tsx` - Video input handling
- `src/app/api/extract-frame/route.ts` - Remote processing endpoint
- `src/trigger/extract-frame.ts` - Trigger.dev FFmpeg task

### Key Functions

- `extractLocalFrame()` - Canvas API implementation
- `extractRemoteFrame()` - API call to Trigger.dev
- `extractFrame()` - Main orchestration logic
- Video event handlers for seeking and loading

## Debug Console Logs

### Local Extraction

```
🎬 Frame extraction debug info:
🔧 Using local extraction method (Canvas API)
📹 Video loaded, seeking to timestamp: 2.5
🎯 Video seeked, extracting frame at: 2.5
📐 Canvas size: 1920 x 1080
✅ Local frame extracted successfully, data length: 45678
```

### Remote Extraction

```
🎬 Frame extraction debug info:
🔧 Using remote extraction method (Trigger.dev API)
🚀 Calling extract-frame API with: {videoUrl: "...", timestamp: 5}
✅ Frame extraction successful: {url: "data:image/jpeg;base64,..."}
```

## Future Enhancements

- **Multiple frame extraction** - Extract several frames at once
- **Frame quality settings** - Adjustable JPEG quality
- **Video metadata display** - Duration, resolution, format info
- **Batch processing** - Process multiple videos
- **Custom frame sizes** - Resize extracted frames
- **Timeline scrubber** - Visual timestamp selection

## Troubleshooting

### Local Videos Not Working

1. Check browser console for errors
2. Verify video format is supported (MP4, WebM, etc.)
3. Ensure video file isn't corrupted
4. Try a smaller video file

### Remote Videos Not Working

1. Verify URL is publicly accessible
2. Check network connectivity
3. Ensure Trigger.dev is configured
4. Look for CORS or security issues

### Canvas Extraction Issues

1. Video must be fully loaded before extraction
2. Check video dimensions aren't too large
3. Ensure timestamp is within video duration
4. Verify browser supports canvas operations
