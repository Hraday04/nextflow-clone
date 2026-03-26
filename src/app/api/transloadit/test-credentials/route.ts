import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  try {
    const authKey = process.env.NEXT_PUBLIC_TRANSLOADIT_AUTH_KEY;
    const authSecret = process.env.NEXT_PUBLIC_TRANSLOADIT_AUTH_SECRET;

    if (!authKey || !authSecret) {
      return NextResponse.json({
        success: false,
        error: "Missing Transloadit credentials",
        message:
          "NEXT_PUBLIC_TRANSLOADIT_AUTH_KEY and NEXT_PUBLIC_TRANSLOADIT_AUTH_SECRET must be set",
      });
    }

    // Create a simple test assembly to verify credentials
    const params = {
      auth: {
        key: authKey,
        expires: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      },
      steps: {
        import: { robot: "/upload/handle" },
      },
    };

    // Generate signature with SHA-384
    const paramsString = JSON.stringify(params);
    const signature = crypto
      .createHmac("sha384", authSecret)
      .update(paramsString)
      .digest("hex");

    // Test the credentials by making a request to Transloadit
    const testResponse = await fetch(
      "https://api2.transloadit.com/assemblies",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          params: paramsString,
          signature: signature,
        }),
      },
    );

    const result = await testResponse.json();

    if (result.error === "INVALID_SIGNATURE") {
      return NextResponse.json({
        success: false,
        error: "Invalid signature",
        message:
          "Your Transloadit credentials are incorrect or your account requires a different signature algorithm",
        suggestion: "Please verify your AUTH_KEY and AUTH_SECRET are correct",
      });
    } else if (result.error === "ASSEMBLY_INVALID_ACCOUNT") {
      return NextResponse.json({
        success: false,
        error: "Invalid account",
        message:
          "Your Transloadit account is inactive, suspended, or out of credits",
        suggestion: "Please check your Transloadit account status and billing",
      });
    } else if (result.error) {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: result.message || "Unknown Transloadit error",
        suggestion: "Please check the Transloadit documentation",
      });
    }

    // Success!
    return NextResponse.json({
      success: true,
      message: "Transloadit credentials are valid",
      account: authKey,
      signatureAlgorithm: "SHA-384",
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: "Test failed",
      message: error.message,
      suggestion: "Check your network connection and try again",
    });
  }
}
