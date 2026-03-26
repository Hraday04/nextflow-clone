// @ts-nocheck
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ error: "API not properly configured" });
}

export async function POST() {
  return NextResponse.json({ error: "API not properly configured" });
}

export async function PUT() {
  return NextResponse.json({ error: "API not properly configured" });
}

export async function DELETE() {
  return NextResponse.json({ error: "API not properly configured" });
}
