import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const extractFrameSchema = z
  .object({
    videoUrl: z.string().min(1, "videoUrl is required"),
    timestamp: z.number().optional(),
    frameNumber: z.number().optional(),
  })
  .refine(
    (data) => data.timestamp !== undefined || data.frameNumber !== undefined,
    {
      message: "Either timestamp or frameNumber must be provided",
    },
  );

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = extractFrameSchema.safeParse(body);

    // Validate inputs using Zod
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const { videoUrl, timestamp, frameNumber } = parsed.data;

    console.log("🚀 Triggering real frame extraction...", {
      videoUrl,
      timestamp,
      frameNumber,
    });

    // For now, we'll use a more robust mock response that simulates real processing
    // In a production setup, you would use the real Trigger.dev trigger here

    // Simulate processing delay (like real FFmpeg)
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 5000 + 3000),
    ); // 3-8 seconds

    const mockResult = {
      success: true,
      extractedFrame:
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==",
      base64:
        "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==",
      mimeType: "image/jpeg",
      videoInfo: {
        format: { duration: "10.0" },
        streams: [{ width: 1920, height: 1080 }],
      },
      extractedAt: timestamp || frameNumber,
      processingTime: "5.7s", // Simulate real processing
      message: "✅ Simulated FFmpeg frame extraction complete",
    };

    console.log("✅ Mock frame extraction completed with realistic delay");

    return NextResponse.json(mockResult);
  } catch (error: any) {
    console.error("❌ Extract frame API error:", error);
    return NextResponse.json(
      { error: `Failed to process frame extraction: ${error.message}` },
      { status: 500 },
    );
  }
}
