// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET → Fetch the latest workflow with nodes and edges
export async function GET() {
  try {
    const workflow = await prisma.workflow.findFirst({
      orderBy: { createdAt: "desc" },
      include: {
        nodes: true,
        edges: true,
      },
    });
    if (!workflow) {
      return NextResponse.json({ error: "No workflow found" }, { status: 404 });
    }
    // If definition exists, return it as JSON for frontend compatibility
    let definition = workflow.definition;
    if (typeof definition === "string") {
      try {
        definition = JSON.parse(definition);
      } catch {
        // fallback: keep as string
      }
    }
    return NextResponse.json({
      success: true,
      definition,
      workflowId: workflow.id,
    });
  } catch (error: any) {
    console.error("[Workflow GET Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// POST → Create workflow, nodes, and edges from flow definition
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { definition } = body;
    if (!definition || !definition.nodes || !definition.edges) {
      return NextResponse.json(
        {
          success: false,
          error: "definition with nodes and edges is required",
        },
        { status: 400 },
      );
    }
    // Create workflow
    const workflow = await prisma.workflow.create({
      data: {
        name: `Flow - ${new Date().toISOString()}`,
        definition: JSON.stringify(definition),
        nodes: {
          create: definition.nodes.map((node: any) => ({
            nodeId: node.id,
            type: node.type,
            position: node.position,
            data: node.data,
          })),
        },
        edges: {
          create: definition.edges.map((edge: any) => ({
            edgeId: edge.id,
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
          })),
        },
      },
      include: {
        nodes: true,
        edges: true,
      },
    });
    return NextResponse.json({ success: true, workflow });
  } catch (error: any) {
    console.error("[Workflow POST Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// PUT and DELETE can be implemented similarly if needed
