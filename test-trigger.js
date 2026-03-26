import { cropImageTask } from "../trigger/crop-image";
import { extractFrameTask } from "../trigger/extract-frame";

// Test function to check if Trigger.dev tasks work locally
export async function testTriggerTasks() {
  console.log("🧪 Testing Trigger.dev FFmpeg Tasks...");

  try {
    // Test 1: Test crop task locally
    console.log("1️⃣ Testing crop image task...");
    const cropResult = await cropImageTask.run({
      imageUrl: "https://via.placeholder.com/300x200.jpg",
      x: 50,
      y: 25,
      width: 150,
      height: 100,
    });
    console.log("Crop result:", cropResult);

    // Test 2: Test extract frame task locally
    console.log("2️⃣ Testing extract frame task...");
    const frameResult = await extractFrameTask.run({
      videoUrl:
        "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
      timestamp: 2,
    });
    console.log("Frame result:", frameResult);

    return {
      success: true,
      cropTest: cropResult,
      frameTest: frameResult,
    };
  } catch (error) {
    console.error("❌ Test failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Run the test
if (require.main === module) {
  testTriggerTasks().then((result) => {
    console.log("🎯 Test Results:", JSON.stringify(result, null, 2));
  });
}
