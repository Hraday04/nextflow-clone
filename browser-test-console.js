/**
 * Browser Console Testing Script
 *
 * Copy and paste these functions into your browser's developer console
 * when you have the app open at http://localhost:3001
 */

// Test Crop Image API
async function testCropAPI() {
  console.log("🧪 Testing Crop Image API...");

  const response = await fetch("/api/crop-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageUrl:
        "https://via.placeholder.com/400x300/FF0000/FFFFFF?text=RED+BOX",
      x: 50,
      y: 50,
      width: 200,
      height: 150,
    }),
  });

  const result = await response.json();
  console.log("✅ Crop API Result:", result);

  if (result.success) {
    console.log("✅ SUCCESS: Crop API is working!");
    if (result.croppedImage) {
      console.log("🖼️ Cropped image data received");
    }
  } else {
    console.log("❌ FAILED: Crop API returned an error");
  }

  return result;
}

// Test Extract Frame API
async function testFrameAPI() {
  console.log("🧪 Testing Extract Frame API...");

  const response = await fetch("/api/extract-frame", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      videoUrl:
        "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
      timestamp: 2.5,
    }),
  });

  const result = await response.json();
  console.log("✅ Frame API Result:", result);

  if (result.success) {
    console.log("✅ SUCCESS: Frame extraction API is working!");
    if (result.extractedFrame) {
      console.log("🖼️ Extracted frame data received");
    }
  } else {
    console.log("❌ FAILED: Frame API returned an error");
  }

  return result;
}

// Test both APIs
async function runAllAPITests() {
  console.log("🚀 Running All API Tests...");
  console.log("=====================================");

  try {
    await testCropAPI();
    console.log(""); // spacing
    await testFrameAPI();

    console.log("");
    console.log("🏁 API Tests Complete!");
    console.log("📋 Current Status: Both APIs return mock data");
    console.log("🔧 To enable real FFmpeg processing:");
    console.log("   1. Set up Trigger.dev credentials");
    console.log("   2. Install FFmpeg");
    console.log("   3. Update API routes to use real tasks");
    console.log("   4. See TRIGGER_TESTING_GUIDE.md for details");
  } catch (error) {
    console.error("💥 Test Error:", error);
  }
}

// Display a visual indicator for cropped image (if base64 is returned)
function displayCroppedImage(base64Data) {
  if (!base64Data) {
    console.log("No image data to display");
    return;
  }

  const img = new Image();
  img.src = `data:image/jpeg;base64,${base64Data}`;
  img.style.border = "2px solid green";
  img.style.maxWidth = "200px";
  img.style.maxHeight = "200px";

  // Create a container
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "10px";
  container.style.right = "10px";
  container.style.background = "white";
  container.style.padding = "10px";
  container.style.border = "2px solid green";
  container.style.borderRadius = "8px";
  container.style.zIndex = "9999";
  container.innerHTML = "<h4>Cropped Image Result:</h4>";
  container.appendChild(img);

  // Add close button
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "✕";
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "5px";
  closeBtn.style.right = "5px";
  closeBtn.onclick = () => container.remove();
  container.appendChild(closeBtn);

  document.body.appendChild(container);

  console.log("🖼️ Image displayed in top-right corner");
}

// Usage instructions
console.log(`
🧪 TRIGGER.DEV + FFMPEG TESTING CONSOLE

Available functions:
- testCropAPI()          - Test image cropping
- testFrameAPI()         - Test video frame extraction  
- runAllAPITests()       - Test both APIs
- displayCroppedImage(base64) - Show image result

Quick Start:
runAllAPITests();

Or test individually:
testCropAPI().then(result => {
  if (result.base64) displayCroppedImage(result.base64);
});
`);

// Export for easy access
window.triggerTests = {
  testCropAPI,
  testFrameAPI,
  runAllAPITests,
  displayCroppedImage,
};
