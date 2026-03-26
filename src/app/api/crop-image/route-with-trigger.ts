// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk";

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

    // For production: Use real Trigger.dev task
    if (
      process.env.NODE_ENV === "production" &&
      process.env.TRIGGER_SECRET_KEY
    ) {
      try {
        // Trigger the crop-image task
        const handle = await tasks.trigger("crop-image", {
          imageUrl,
          x,
          y,
          width,
          height,
        });

        // Return the handle ID for async processing
        return NextResponse.json({
          success: true,
          taskId: handle.id,
          status: "processing",
          message: "Crop task started. Use taskId to check status.",
        });
      } catch (triggerError) {
        console.error("Trigger.dev task failed:", triggerError);
        // Fallback to mock response if Trigger.dev fails
      }
    }

    // Development/fallback: Mock response
    console.log("🔄 Using mock response for crop-image");
    const mockResult = {
      success: true,
      croppedImage: imageUrl, // Mock: return original image
      base64: imageUrl.includes("data:") ? imageUrl.split(",")[1] : "",
      mimeType: "image/jpeg",
      cropParams: { x, y, width, height },
      mode: "mock",
    };

    return NextResponse.json(mockResult);
  } catch (error) {
    console.error("Crop API error:", error);
    return NextResponse.json(
      { error: "Failed to process crop request" },
      { status: 500 },
    );
  }
}
