// Simple workflow listing without database
export async function GET() {
  // In a real app, this would fetch from database
  // For now, return empty array since we don't have persistent storage
  const workflows: any[] = [];

  console.log("Listed workflows:", workflows);

  return Response.json(workflows);
}
