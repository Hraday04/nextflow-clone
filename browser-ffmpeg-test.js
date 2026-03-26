/**
 * Browser-Based FFmpeg Test
 *
 * Copy and paste this into your browser console at http://localhost:3001
 * to test if FFmpeg is working in your Trigger.dev tasks
 */

// Test FFmpeg Image Cropping
async function testFFmpegCrop() {
  console.log("🖼️  Testing FFmpeg Image Cropping...");
  console.log("=====================================");

  const startTime = Date.now();

  try {
    console.log("📤 Sending crop request to Trigger.dev...");

    const response = await fetch("/api/crop-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageUrl:
          "https://via.placeholder.com/400x300/FF0000/FFFFFF?text=TEST+IMAGE",
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

      console.log("📊 Response received!");
      console.log("📋 Result keys:", Object.keys(result));

      // Analyze the response to determine if it's real FFmpeg processing
      if (duration < 3) {
        console.log("⚠️  FAST RESPONSE: Might be mock data or error");
        if (result.success === false || result.error) {
          console.log("💥 ERROR DETECTED:", result.error || result);
          console.log("");
          console.log("🔧 POSSIBLE ISSUES:");
          console.log("   • FFmpeg not available in Trigger.dev environment");
          console.log("   • Network timeout");
          console.log("   • Invalid image URL");
          console.log("   • Trigger.dev task configuration error");
        }
      } else if (duration >= 3) {
        console.log("✅ SLOW RESPONSE: Real processing detected!");
        console.log("🎯 FFmpeg appears to be working");

        if (result.success && result.croppedImage) {
          console.log("🖼️  Cropped image received");
          console.log(`📏 Base64 length: ${result.base64?.length || 0} chars`);

          // Display the result image
          if (result.croppedImage.startsWith("data:image")) {
            console.log("🎨 Creating preview image...");
            displayImageResult(result.croppedImage, "Cropped Image Result");
          }
        }
      }

      console.log("📄 Full response:");
      console.log(result);

      return result;
    } else {
      console.log("❌ HTTP Error:", response.status, response.statusText);
      const errorText = await response.text();
      console.log("💥 Error details:", errorText);
    }
  } catch (error) {
    console.log("💥 Network/JS Error:", error.message);
  }
}

// Test FFmpeg Video Frame Extraction
async function testFFmpegFrame() {
  console.log("\n🎬 Testing FFmpeg Video Frame Extraction...");
  console.log("============================================");

  const startTime = Date.now();

  try {
    console.log("📤 Sending frame extraction request...");

    const response = await fetch("/api/extract-frame", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        videoUrl:
          "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        timestamp: 2.5,
      }),
    });

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log(`⏱️  Processing time: ${duration}s`);

    if (response.ok) {
      const result = await response.json();

      console.log("📊 Response received!");
      console.log("📋 Result keys:", Object.keys(result));

      if (duration < 3) {
        console.log("⚠️  FAST RESPONSE: Might be mock data or error");
        if (result.success === false || result.error) {
          console.log("💥 ERROR DETECTED:", result.error || result);
        }
      } else {
        console.log("✅ SLOW RESPONSE: Real processing detected!");
        console.log("🎯 FFmpeg appears to be working");

        if (result.success && result.extractedFrame) {
          console.log("🎬 Video frame extracted");
          console.log(`📏 Base64 length: ${result.base64?.length || 0} chars`);

          if (result.extractedFrame.startsWith("data:image")) {
            console.log("🎨 Creating preview image...");
            displayImageResult(result.extractedFrame, "Extracted Frame Result");
          }
        }
      }

      console.log("📄 Full response:");
      console.log(result);

      return result;
    } else {
      console.log("❌ HTTP Error:", response.status, response.statusText);
      const errorText = await response.text();
      console.log("💥 Error details:", errorText);
    }
  } catch (error) {
    console.log("💥 Network/JS Error:", error.message);
  }
}

// Helper function to display image results
function displayImageResult(base64Data, title) {
  // Remove any existing result windows
  const existing = document.getElementById("ffmpeg-test-result");
  if (existing) existing.remove();

  const img = new Image();
  img.src = base64Data;
  img.style.maxWidth = "300px";
  img.style.maxHeight = "200px";
  img.style.border = "2px solid #00ff00";

  const container = document.createElement("div");
  container.id = "ffmpeg-test-result";
  container.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    padding: 15px;
    border: 2px solid #00ff00;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    font-family: Arial, sans-serif;
  `;

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
      <h4 style="margin: 0; color: #00aa00;">${title}</h4>
      <button onclick="this.parentElement.parentElement.remove()" 
              style="background: red; color: white; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer;">✕</button>
    </div>
  `;

  container.appendChild(img);

  const info = document.createElement("div");
  info.style.marginTop = "10px";
  info.style.fontSize = "12px";
  info.style.color = "#666";
  info.innerHTML = `
    <div>✅ FFmpeg processing successful!</div>
    <div>📏 Size: ${img.naturalWidth || "?"} x ${img.naturalHeight || "?"}</div>
  `;
  container.appendChild(info);

  document.body.appendChild(container);

  console.log(`🖼️  ${title} displayed in top-right corner`);
}

// Run both FFmpeg tests
async function runFFmpegTests() {
  console.log("🧪 FFmpeg Integration Test Suite");
  console.log("=================================");
  console.log("");
  console.log("Testing if FFmpeg is working in your Trigger.dev tasks...");
  console.log("Real processing should take 5-15 seconds per task.");
  console.log("");

  // Test image cropping
  await testFFmpegCrop();

  console.log("\n⏳ Waiting 3 seconds before next test...\n");
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Test video frame extraction
  await testFFmpegFrame();

  console.log("\n🏁 FFmpeg Test Suite Complete!");
  console.log("==============================");
  console.log("");
  console.log("📊 Analysis Guide:");
  console.log("• ⚡ Fast (<3s) = Mock data, error, or cached response");
  console.log("• ⏳ Slow (5-15s) = Real FFmpeg processing");
  console.log("• 🖼️  Visual result = FFmpeg successfully processed media");
  console.log("• ❌ Error = Check Trigger.dev logs for details");
  console.log("");
  console.log("🔍 Monitor your tasks here:");
  console.log("https://cloud.trigger.dev/projects/proj_aekzrfphlnvpvojxxnrr/");
}

// Quick individual tests
window.ffmpegTest = {
  crop: testFFmpegCrop,
  frame: testFFmpegFrame,
  all: runFFmpegTests,
};

console.log(`
🧪 FFMPEG TEST COMMANDS LOADED

Quick Commands:
• ffmpegTest.crop()  - Test image cropping
• ffmpegTest.frame() - Test video frame extraction  
• ffmpegTest.all()   - Run full test suite

Full Test Suite:
runFFmpegTests()

Individual Tests:
testFFmpegCrop()
testFFmpegFrame()
`);

// Export for easy access
window.runFFmpegTests = runFFmpegTests;
window.testFFmpegCrop = testFFmpegCrop;
window.testFFmpegFrame = testFFmpegFrame;
