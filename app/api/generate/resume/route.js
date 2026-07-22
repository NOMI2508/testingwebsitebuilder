import { runGeneration } from "../../../lib/generate-core";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Dedicated resume endpoint. Body: { sessionId, mode?: "resume" }.
// Equivalent to POST /api/generate with mode "resume".
export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  return runGeneration({ ...body, mode: "resume" }, { signal: req.signal });
}
