// Simple workflow saving without database
export async function POST(req: Request) {
  console.log("SAVE API CALLED");

  const { name, nodes, edges } = await req.json();

  console.log("DATA:", name);

  // In a real app, this would save to database
  // For now, return a mock successful response
  const workflow = {
    id: `workflow_${Date.now()}`,
    name,
    nodes,
    edges,
    createdAt: new Date().toISOString(),
  };

  console.log("Saved workflow:", workflow);

  return Response.json(workflow);
}
