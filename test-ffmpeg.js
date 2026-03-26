#!/usr/bin/env node

/**
 * FFmpeg Integration Test Script
 *
 * This tests if FFmpeg is working inside your Trigger.dev tasks
 */

const BASE_URL = "http://localhost:3001";

// Test images and videos that should work
const TEST_URLS = {
  image: "https://via.placeholder.com/400x300/FF0000/FFFFFF?text=TEST+IMAGE",
  video: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
};

async function testFFmpegCrop() {
  console.log("\n🖼️  Testing FFmpeg Image Cropping...");
  console.log("=====================================");

  const startTime = Date.now();

  try {
    console.log("📤 Sending crop request to Trigger.dev...");

    const response = await fetch(`${BASE_URL}/api/crop-image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageUrl: TEST_URLS.image,
        x: 50,
        y: 50,
        width: 200,
        height: 150,
      }),
    });

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log(`⏱️  Processing time: ${duration}s`);

    if (response.ok) {
      const result = await response.json();

      if (duration < 2) {
        console.log(
          "⚠️  WARNING: Response too fast - might still be using mock data",
        );
        console.log("📋 Result keys:", Object.keys(result));
      } else {
        console.log("✅ SUCCESS: Real FFmpeg processing detected!");
        console.log("📊 Processing took realistic time");

        if (result.success && result.croppedImage) {
          console.log("🖼️  Cropped image received");
          console.log(`📏 Base64 length: ${result.base64?.length || 0} chars`);

          // Check if it's real data vs mock
          if (result.croppedImage !== TEST_URLS.image) {
            console.log(
              "✅ CONFIRMED: Real image processing (different from input)",
            );
          }
        }
      }

      console.log("📄 Full response:", JSON.stringify(result, null, 2));
    } else {
      console.log("❌ FAILED:", response.status, response.statusText);
      const error = await response.text();
      console.log("💥 Error:", error);
    }
  } catch (error) {
    console.log("💥 Network Error:", error.message);
  }
}

async function testFFmpegFrameExtraction() {
  console.log("\n🎬 Testing FFmpeg Video Frame Extraction...");
  console.log("============================================");

  const startTime = Date.now();

  try {
    console.log("📤 Sending frame extraction request to Trigger.dev...");

    const response = await fetch(`${BASE_URL}/api/extract-frame`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        videoUrl: TEST_URLS.video,
        timestamp: 2.5,
      }),
    });

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log(`⏱️  Processing time: ${duration}s`);

    if (response.ok) {
      const result = await response.json();

      if (duration < 2) {
        console.log(
          "⚠️  WARNING: Response too fast - might still be using mock data",
        );
      } else {
        console.log("✅ SUCCESS: Real FFmpeg processing detected!");
        console.log("📊 Processing took realistic time");

        if (result.success && result.extractedFrame) {
          console.log("🎬 Video frame extracted");
          console.log(`📏 Base64 length: ${result.base64?.length || 0} chars`);

          if (result.videoInfo) {
            console.log("📹 Video info received:", result.videoInfo);
          }
        }
      }

      console.log("📄 Full response:", JSON.stringify(result, null, 2));
    } else {
      console.log("❌ FAILED:", response.status, response.statusText);
      const error = await response.text();
      console.log("💥 Error:", error);
    }
  } catch (error) {
    console.log("💥 Network Error:", error.message);
  }
}

async function runFFmpegTests() {
  console.log("🧪 FFmpeg Integration Test Suite");
  console.log("=================================");
  console.log("");
  console.log(
    "This will test if FFmpeg is working inside your Trigger.dev tasks.",
  );
  console.log("Real processing should take 5-15 seconds per task.");
  console.log("");

  // Test image cropping
  await testFFmpegCrop();

  console.log("\n⏳ Waiting 2 seconds before next test...\n");
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Test video frame extraction
  await testFFmpegFrameExtraction();

  console.log("\n🏁 FFmpeg Test Suite Complete!");
  console.log("==============================");
  console.log("");
  console.log("📊 Summary:");
  console.log("• ✅ Fast responses (<2s) = Mock data still active");
  console.log("• ⏳ Slow responses (5-15s) = Real FFmpeg processing");
  console.log("• 🖼️  Different output = FFmpeg successfully processed");
  console.log("");
  console.log("🔍 Check your Trigger.dev dashboard for task execution logs:");
  console.log("https://cloud.trigger.dev/projects/proj_aekzrfphlnvpvojxxnrr/");
}

// Add fetch polyfill for Node.js if needed
if (typeof fetch === "undefined") {
  console.log("Installing node-fetch...");
  try {
    global.fetch = require("node-fetch");
  } catch (e) {
    console.log("Please install node-fetch: npm install node-fetch");
    process.exit(1);
  }
}

// Run the tests
runFFmpegTests().catch(console.error);
