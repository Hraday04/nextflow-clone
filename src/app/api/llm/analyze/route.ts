import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model, text, image, video } = body;
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[Gemini API] Missing API key");
      return NextResponse.json(
        { success: false, error: "Missing Gemini API key in env." },
        { status: 500 },
      );
    }
    if (!model) {
      console.error("[Gemini API] No model provided");
      return NextResponse.json(
        { success: false, error: "No Gemini model provided." },
        { status: 400 },
      );
    }
    let input;
    if (text) {
      input = { contents: [{ parts: [{ text }] }] };
    } else if (image) {
      let base64 = image;
      if (base64.startsWith("data:")) {
        base64 = base64.split(",")[1];
      }
      input = {
        contents: [
          { parts: [{ inlineData: { mimeType: "image/png", data: base64 } }] },
        ],
      };
    } else if (video) {
      console.error("[Gemini API] Video input not supported");
      return NextResponse.json(
        {
          success: false,
          error:
            "Gemini API does not support direct video analysis. Please extract a frame or send a video URL as text.",
        },
        { status: 400 },
      );
    } else {
      console.error("[Gemini API] No valid input provided");
      return NextResponse.json(
        { success: false, error: "No valid input provided." },
        { status: 400 },
      );
    }
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    let res;
    try {
      res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
    } catch (err) {
      console.error("[Gemini API] Fetch error:", err);
      return NextResponse.json(
        { success: false, error: "Failed to reach Gemini API." },
        { status: 502 },
      );
    }
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error(
        "[Gemini API] Gemini error:",
        errData.error?.message || res.statusText,
      );
      return NextResponse.json(
        { success: false, error: errData.error?.message || res.statusText },
        { status: res.status },
      );
    }
    const data = await res.json();
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return NextResponse.json({
        success: true,
        result: data.candidates[0].content.parts[0].text,
      });
    }
    console.error("[Gemini API] No result from Gemini:", data);
    return NextResponse.json(
      { success: false, error: data.error?.message || "No result from Gemini" },
      { status: 500 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
