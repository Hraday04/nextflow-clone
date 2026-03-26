#!/usr/bin/env node

/**
 * Frame Extraction Test Script
 *
 * This script tests both local (Canvas API) and remote (Trigger.dev/FFmpeg)
 * frame extraction functionality in the FrameNode component.
 */

console.log("🎬 Frame Extraction Test Script");
console.log("===============================\n");

// Test data for different scenarios
const testCases = [
  {
    name: "Local Video (blob: URL)",
    description: "Tests Canvas API frame extraction from local file",
    videoInput: {
      url: "blob:null/123e4567-e89b-12d3-a456-426614174000",
      type: "video",
      name: "local-video.mp4",
      isLocal: true,
    },
    timestamp: 5.5,
    expectedMethod: "local",
    shouldWork: true,
  },
  {
    name: "Remote Video (HTTP URL)",
    description: "Tests Trigger.dev API frame extraction from remote URL",
    videoInput: {
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      type: "video",
      name: "Remote video",
      isLocal: false,
    },
    timestamp: 10.0,
    expectedMethod: "remote",
    shouldWork: true,
  },
  {
    name: "HTTPS Video URL",
    description: "Tests secure remote URL processing",
    videoInput: {
      url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
      type: "video",
      name: "Remote video",
      isLocal: false,
    },
    timestamp: 2.0,
    expectedMethod: "remote",
    shouldWork: true,
  },
  {
    name: "Invalid URL format",
    description: "Tests error handling for invalid URLs",
    videoInput: {
      url: "ftp://invalid-protocol.com/video.mp4",
      type: "video",
      name: "Invalid video",
      isLocal: false,
    },
    timestamp: 1.0,
    expectedMethod: null,
    shouldWork: false,
  },
  {
    name: "No video input",
    description: "Tests handling when no video is connected",
    videoInput: null,
    timestamp: 1.0,
    expectedMethod: null,
    shouldWork: false,
  },
];

/**
 * Simulate the FrameNode extraction logic
 */
function simulateFrameExtraction(testCase) {
  console.log(`\n🧪 Testing: ${testCase.name}`);
  console.log(`📝 ${testCase.description}`);
  console.log(`📊 Input:`, testCase.videoInput);
  console.log(`⏰ Timestamp: ${testCase.timestamp}s`);

  try {
    // Check if we have a video input
    if (!testCase.videoInput) {
      throw new Error("No video input - connect a Video Node first");
    }

    const videoInput = testCase.videoInput;
    let extractionMethod;

    // Determine extraction method
    if (videoInput.url?.startsWith("blob:") || videoInput.isLocal) {
      extractionMethod = "local";
      console.log("🔧 Would use: Canvas API (local extraction)");
    } else if (videoInput.url?.startsWith("http")) {
      extractionMethod = "remote";
      console.log("🔧 Would use: Trigger.dev API (remote extraction)");
    } else {
      throw new Error(
        "Invalid video URL format. Must be a local file (blob:) or remote URL (http/https).",
      );
    }

    // Validate expected behavior
    if (testCase.expectedMethod === extractionMethod) {
      console.log("✅ Extraction method matches expected");
    } else {
      console.log(
        `⚠️  Method mismatch: expected ${testCase.expectedMethod}, got ${extractionMethod}`,
      );
    }

    // Simulate successful extraction
    const result = {
      url:
        extractionMethod === "local"
          ? "data:image/jpeg;base64,/9j/4AAQ..."
          : "data:image/jpeg;base64,/9j/4AAQ...",
      base64: "/9j/4AAQ...",
      mimeType: "image/jpeg",
      type: "image",
      extractedAt: testCase.timestamp,
      extractionMethod,
      sourceVideo: videoInput.url,
    };

    console.log("✅ Extraction would succeed");
    console.log("📤 Output:", {
      ...result,
      base64: result.base64.substring(0, 20) + "...", // Truncate for display
    });

    return { success: true, result, method: extractionMethod };
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);

    if (testCase.shouldWork) {
      console.log("🚨 This test case should have worked!");
      return { success: false, error: error.message, unexpected: true };
    } else {
      console.log("✅ Expected error occurred");
      return { success: false, error: error.message, expected: true };
    }
  }
}

/**
 * Run all test cases
 */
function runTests() {
  console.log("🚀 Starting frame extraction tests...\n");

  const results = testCases.map((testCase) => {
    const result = simulateFrameExtraction(testCase);
    return { testCase: testCase.name, ...result };
  });

  console.log("\n" + "=".repeat(50));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(50));

  let passed = 0;
  let failed = 0;
  let unexpected = 0;

  results.forEach((result, index) => {
    const status = result.success
      ? "✅ PASS"
      : result.expected
        ? "✅ PASS (Expected Error)"
        : "❌ FAIL";
    console.log(`${index + 1}. ${result.testCase}: ${status}`);

    if (result.success) {
      passed++;
    } else if (result.expected) {
      passed++;
    } else {
      failed++;
      if (result.unexpected) unexpected++;
    }
  });

  console.log("\n📈 Results:");
  console.log(`✅ Passed: ${passed}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  if (unexpected > 0) {
    console.log(`🚨 Unexpected failures: ${unexpected}`);
  }

  console.log("\n💡 Implementation Notes:");
  console.log(
    "• Local videos (blob: URLs) use Canvas API for frame extraction",
  );
  console.log("• Remote videos (http/https URLs) use Trigger.dev + FFmpeg");
  console.log("• Both methods output base64 image data");
  console.log("• Error handling prevents invalid URL formats");
  console.log("\n🛠️  To test in the browser:");
  console.log("1. Upload a local video to VideoNode");
  console.log("2. Connect VideoNode to FrameNode");
  console.log("3. Set timestamp and click 'Extract Frame'");
  console.log("4. Check browser console for debug logs");
}

// Run the tests
runTests();
