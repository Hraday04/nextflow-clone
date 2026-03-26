import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    console.log("📡 Transloadit notification received:", data);

    // Handle the completed assembly
    if (data.ok === "ASSEMBLY_COMPLETED") {
      console.log("✅ Assembly completed successfully");
      console.log("📄 Results:", data.results);

      // You can add webhook logic here to notify your frontend
      // or store the results in a database

      return NextResponse.json({
        status: "success",
        message: "Assembly completed successfully",
      });
    }

    if (data.ok === "ASSEMBLY_EXECUTING") {
      console.log("⚡ Assembly is executing...");
      return NextResponse.json({
        status: "executing",
        message: "Assembly is being processed",
      });
    }

    if (data.error) {
      console.error("❌ Assembly error:", data.error);
      return NextResponse.json(
        {
          status: "error",
          message: data.error,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      status: "received",
      message: "Notification received",
    });
  } catch (error: any) {
    console.error("❌ Error handling Transloadit notification:", error);
    return NextResponse.json(
      { error: "Failed to process notification" },
      { status: 500 },
    );
  }
}
