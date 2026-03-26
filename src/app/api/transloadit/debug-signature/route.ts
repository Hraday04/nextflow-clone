import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const authKey = process.env.NEXT_PUBLIC_TRANSLOADIT_AUTH_KEY;
    const authSecret = process.env.NEXT_PUBLIC_TRANSLOADIT_AUTH_SECRET;

    if (!authKey || !authSecret) {
      return NextResponse.json(
        { error: "Missing credentials" },
        { status: 500 },
      );
    }

    // Test different signature algorithms
    const params = {
      auth: {
        key: authKey,
        expires: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      },
      steps: {
        import: { robot: "/upload/handle" },
      },
    };

    const paramsString = JSON.stringify(params);

    // Test both SHA-1 and SHA-384
    const sha1Signature = crypto
      .createHmac("sha1", authSecret)
      .update(paramsString)
      .digest("hex");
    const sha384Signature = crypto
      .createHmac("sha384", authSecret)
      .update(paramsString)
      .digest("hex");

    console.log("Testing signatures...");
    console.log("Params:", paramsString);
    console.log("SHA-1 signature:", sha1Signature);
    console.log("SHA-384 signature:", sha384Signature);

    // Test SHA-1 first
    const testSha1 = await fetch("https://api2.transloadit.com/assemblies", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        params: paramsString,
        signature: sha1Signature,
      }),
    });

    const result1 = await testSha1.json();
    console.log("SHA-1 result:", result1);

    // Test SHA-384
    const testSha384 = await fetch("https://api2.transloadit.com/assemblies", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        params: paramsString,
        signature: sha384Signature,
      }),
    });

    const result384 = await testSha384.json();
    console.log("SHA-384 result:", result384);

    return NextResponse.json({
      params: params,
      paramsString,
      signatures: {
        sha1: { signature: sha1Signature, result: result1 },
        sha384: { signature: sha384Signature, result: result384 },
      },
    });
  } catch (error: any) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
