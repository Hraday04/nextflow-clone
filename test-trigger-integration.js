#!/usr/bin/env node

/**
 * Test Script for Trigger.dev + FFmpeg Integration
 *
 * This script tests the API endpoints to verify they're working correctly.
 * Run with: node test-trigger-integration.js
 */

const BASE_URL = "http://localhost:3001";

// Test data
const TEST_IMAGE_URL =
  "https://via.placeholder.com/400x300/0000FF/FFFFFF?text=Test+Image";
const TEST_VIDEO_URL =
  "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4";

async function testAPI(endpoint, data, testName) {
  console.log(`\n🧪 Testing ${testName}...`);
  console.log(`📝 Endpoint: POST ${BASE_URL}${endpoint}`);
  console.log(`📦 Payload:`, JSON.stringify(data, null, 2));

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`✅ ${testName} - SUCCESS`);
      console.log(`📊 Status: ${response.status}`);
      console.log(`📄 Response keys:`, Object.keys(result));

      // Check for base64 data
      if (result.base64) {
        console.log(
          `🖼️  Base64 data length: ${result.base64.length} characters`,
        );
      }
      if (result.croppedImage) {
        console.log(
          `🖼️  Cropped image type: ${result.croppedImage.substring(0, 30)}...`,
        );
      }
      if (result.extractedFrame) {
        console.log(
          `🖼️  Extracted frame type: ${result.extractedFrame.substring(0, 30)}...`,
        );
      }
    } else {
      console.log(`❌ ${testName} - FAILED`);
      console.log(`📊 Status: ${response.status}`);
      console.log(`❗ Error:`, result);
    }
  } catch (error) {
    console.log(`💥 ${testName} - ERROR`);
    console.log(`❗ Network/Parse Error:`, error.message);
  }
}

async function runAllTests() {
  console.log("🚀 Starting Trigger.dev + FFmpeg Integration Tests");
  console.log("=" * 50);

  // Test 1: Image Cropping
  await testAPI(
    "/api/crop-image",
    {
      imageUrl: TEST_IMAGE_URL,
      x: 50,
      y: 50,
      width: 200,
      height: 150,
    },
    "Image Cropping",
  );

  // Test 2: Video Frame Extraction (timestamp)
  await testAPI(
    "/api/extract-frame",
    {
      videoUrl: TEST_VIDEO_URL,
      timestamp: 2.5,
    },
    "Frame Extraction (Timestamp)",
  );

  // Test 3: Video Frame Extraction (frame number)
  await testAPI(
    "/api/extract-frame",
    {
      videoUrl: TEST_VIDEO_URL,
      frameNumber: 60,
    },
    "Frame Extraction (Frame Number)",
  );

  // Test 4: Error handling - missing parameters
  await testAPI(
    "/api/crop-image",
    {
      imageUrl: TEST_IMAGE_URL,
      // Missing x, y, width, height
    },
    "Error Handling (Missing Parameters)",
  );

  // Test 5: Error handling - invalid video URL
  await testAPI(
    "/api/extract-frame",
    {
      videoUrl: "https://invalid-url.com/nonexistent.mp4",
      timestamp: 1.0,
    },
    "Error Handling (Invalid URL)",
  );

  console.log("\n🏁 Test Suite Complete!");
  console.log("\n📋 Summary:");
  console.log("- ✅ Green checkmarks = API working correctly (mock responses)");
  console.log("- ❌ Red X marks = API errors that need fixing");
  console.log("- 💥 Explosion = Network/connection issues");
  console.log("\n🔧 Next Steps:");
  console.log("1. If tests pass, the mock APIs are working");
  console.log("2. To enable real FFmpeg processing, update the API routes");
  console.log("3. Set up Trigger.dev credentials in .env.local");
  console.log("4. Install FFmpeg on your system");
  console.log("5. See TRIGGER_TESTING_GUIDE.md for detailed instructions");
}

// Add fetch polyfill for Node.js
if (typeof fetch === "undefined") {
  global.fetch = require("node-fetch");
}

// Run the tests
runAllTests().catch(console.error);
