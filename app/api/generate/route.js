import { runGeneration } from "../../lib/generate-core";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Accepts:
// { sessionId, mode: "initial"|"edit"|"repair"|"resume", spec, plan,
//   requestedPaths, currentFiles, messages, resumeState }
// Streams Server-Sent Events (session / delta / file-start / file-delta /
// file-complete / progress / validation / recoverable-error / done).
export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  return runGeneration(body, { signal: req.signal });
}
