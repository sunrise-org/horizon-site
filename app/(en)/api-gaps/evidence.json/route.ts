import { getEvidence } from "@/lib/api-gaps/live";

export async function GET() {
  const evidence = await getEvidence();
  return Response.json(evidence, { headers: { "Cache-Control": "public, max-age=300", "X-Robots-Tag": "noindex" } });
}
