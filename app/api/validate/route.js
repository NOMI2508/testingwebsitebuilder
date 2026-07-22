import { validateProject } from "../../lib/project-validator";
import { readAllGeneratedFiles } from "../../lib/workspace";
import { isValidProjectId } from "../../lib/project-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/validate  { plan, files? }
// Runs static validation. If `files` is omitted, validates the selected
// project's persisted source files.
export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const projectId = typeof body.projectId === "string" ? body.projectId : "";
    if (!isValidProjectId(projectId)) {
      return Response.json({ error: "Valid projectId required." }, { status: 400 });
    }
    const plan = body && typeof body.plan === "object" ? body.plan : { files: [] };
    const files = Array.isArray(body.files)
      ? body.files
      : await readAllGeneratedFiles(projectId);
    const result = validateProject(files, plan);
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { ok: false, errors: [{ file: "", message: String(error?.message || error) }] },
      { status: 500 }
    );
  }
}
