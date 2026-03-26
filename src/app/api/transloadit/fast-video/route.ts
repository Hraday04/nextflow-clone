import { NextRequest, NextResponse } from "next/server";

// Server-side crypto for signature generation
import crypto from "crypto";

// Check if Transloadit is configured
const isTransloaditConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_TRANSLOADIT_AUTH_KEY &&
    process.env.NEXT_PUBLIC_TRANSLOADIT_AUTH_SECRET
  );
};

// Generate assembly parameters for fast video upload (no processing)
const createFastVideoParams = () => {
  return {
    auth: {
      key: process.env.NEXT_PUBLIC_TRANSLOADIT_AUTH_KEY!,
      expires: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    },
    steps: {
      ":original": { robot: "/upload/handle" }, // Fixed: must be ":original"
      // Only generate thumbnail, no video encoding for speed
      thumbnail: {
        robot: "/video/thumbs",
        use: ":original", // Fixed: reference the correct step name
        count: 1,
        format: "jpg",
        width: 320,
        height: 240,
      },
    },
    notify_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/transloadit/notify`,
  };
};

// Generate HMAC signature manually using SHA-1 (confirmed working)
const generateSignature = (params: any, secret: string): string => {
  const paramsString = JSON.stringify(params);
  return crypto.createHmac("sha1", secret).update(paramsString).digest("hex");
};

export async function POST(request: NextRequest) {
  try {
    if (!isTransloaditConfigured()) {
      return NextResponse.json(
        {
          error:
            "Transloadit is not configured. Please set your API credentials in environment variables.",
        },
        { status: 500 },
      );
    }

    // Generate fast upload parameters (no video processing)
    const params = createFastVideoParams();
    const signature = generateSignature(
      params,
      process.env.NEXT_PUBLIC_TRANSLOADIT_AUTH_SECRET!,
    );

    return NextResponse.json({
      params,
      signature,
      endpoint: "https://api2.transloadit.com/assemblies",
      mode: "fast",
    });
  } catch (error: any) {
    console.error("❌ Error creating fast video signature:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create upload signature" },
      { status: 500 },
    );
  }
}
