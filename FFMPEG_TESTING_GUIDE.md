# 🎬 FFmpeg Integration Testing Guide

## 🎯 What We're Testing

Your Trigger.dev tasks are now deployed and should be using **real FFmpeg processing** instead of mock data. Let's verify this is working!

## 🧪 How to Test FFmpeg

### Method 1: Browser Console Test (Recommended)

1. **Open** http://localhost:3001 in your browser
2. **Open Developer Tools** (F12) → Console tab
3. **Copy/paste** the code from `browser-ffmpeg-test.js`
4. **Run**: `runFFmpegTests()`

### Method 2: UI Visual Test

1. **Create workflow**: Image Node → Crop Node
2. **Set parameters**: x=50, y=50, width=200, height=150
3. **Click "Process"** and watch timing
4. **Check result** for actual cropped image

### Method 3: Direct API Test

```bash
# Test crop (should take 5-15 seconds for real processing)
curl -X POST http://localhost:3001/api/crop-image \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://via.placeholder.com/400x300", "x": 50, "y": 50, "width": 200, "height": 150}'
```

## 📊 How to Interpret Results

### ✅ **FFmpeg Working** (Real Processing)

- **Timing**: 5-15 seconds response time
- **Result**: Actual cropped/extracted media
- **Dashboard**: Tasks appear in Trigger.dev with logs
- **Output**: Different base64 data than input
- **Status**: `success: true` with real processed data

### ❌ **FFmpeg Not Working** (Still Mock/Error)

- **Timing**: <2 seconds (too fast)
- **Result**: Same as input or generic mock data
- **Dashboard**: No tasks or error logs in Trigger.dev
- **Output**: `error` field present
- **Status**: Mock response patterns

### 🔧 **Common FFmpeg Issues**

| Issue                    | Symptom                           | Solution                                  |
| ------------------------ | --------------------------------- | ----------------------------------------- |
| **FFmpeg not installed** | `ffmpeg: command not found` error | Install FFmpeg in Trigger.dev environment |
| **Network timeout**      | Tasks timeout after 5 minutes     | Use smaller test files                    |
| **Invalid URLs**         | `curl` or download errors         | Use publicly accessible URLs              |
| **Task not found**       | `Task 'crop-image' not found`     | Re-deploy with `npx trigger.dev deploy`   |

## 🎬 Expected FFmpeg Behavior

### Image Cropping (`crop-image` task):

1. **Downloads** image from URL using `curl`
2. **Processes** with FFmpeg: `ffmpeg -i input.jpg -vf "crop=W:H:X:Y" output.jpg`
3. **Returns** base64 encoded cropped image
4. **Time**: ~5-10 seconds depending on image size

### Frame Extraction (`extract-frame` task):

1. **Downloads** video from URL using `curl`
2. **Extracts** frame with FFmpeg: `ffmpeg -i input.mp4 -ss 2.5 -vframes 1 frame.jpg`
3. **Returns** base64 encoded frame + video metadata
4. **Time**: ~10-20 seconds depending on video size

## 🔍 Monitoring & Debugging

### Check Trigger.dev Dashboard

- **URL**: https://cloud.trigger.dev/projects/proj_aekzrfphlnvpvojxxnrr/
- **Look for**: Recent task executions
- **Check**: Logs for FFmpeg command output
- **Monitor**: Success/failure status

### Check Browser Network Tab

- **Look for**: API calls taking 5+ seconds
- **Check**: Response payloads for real data vs mocks
- **Monitor**: HTTP status codes (200 = success)

### Check Server Logs

```bash
# If running npm run dev, watch the terminal for:
# - Trigger.dev API calls
# - Task execution logs
# - FFmpeg command outputs
# - Error messages
```

## 🚀 Success Indicators

- [ ] **API calls take 5-15 seconds** (real processing time)
- [ ] **Tasks appear in Trigger.dev dashboard** with execution logs
- [ ] **Different results** when changing crop/frame parameters
- [ ] **Actual media processing** visible in returned base64 data
- [ ] **FFmpeg logs** visible in Trigger.dev task execution details
- [ ] **Visual confirmation** when displaying processed images

## 🔄 Troubleshooting Steps

1. **Check task deployment**: `npx trigger.dev deploy`
2. **Verify credentials**: `npx trigger.dev whoami`
3. **Test with simple URLs**: Use small, fast-loading test images
4. **Monitor dashboard**: Watch for real-time task execution
5. **Check browser console**: Look for detailed error messages

Run the tests and let's see if your FFmpeg integration is working! 🎉
