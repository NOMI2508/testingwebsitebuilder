import {
  writeGeneratedFile,
  readAllGeneratedFiles,
  clearWorkspace,
  isValidProjectId,
} from "../../lib/workspace";
import { findResumableSession } from "../../lib/session-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function resolveProjectId(input) {
  const id = typeof input === "string" ? input : "";
  return isValidProjectId(id) ? id : null;
}

// GET /api/workspace?projectId=project_...
// Returns saved files + the most recent resumable session (for reload/resume).
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const projectId = resolveProjectId(url.searchParams.get("projectId"));
    if (!projectId) return Response.json({ error: "Invalid project id." }, { status: 400 });

    const files = await readAllGeneratedFiles(projectId);
    const resumable = await findResumableSession(projectId);
    return Response.json({
      projectId,
      files,
      resumableSession: resumable
        ? {
            sessionId: resumable.sessionId,
            status: resumable.status,
            mode: resumable.mode,
            currentFilePath: resumable.currentFilePath,
            completedPaths: resumable.completedPaths || [],
            updatedAt: resumable.updatedAt,
          }
        : null,
    });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
}

// POST /api/workspace  { projectId?, files: [{ path, content }] }
// Saves complete generated files (used for manual saves; generation writes
// files directly as they complete).
export async function POST(req) {
  try {
    const body = await req.json();
    const projectId = resolveProjectId(body.projectId);
    if (!projectId) return Response.json({ error: "Invalid project id." }, { status: 400 });

    const files = Array.isArray(body.files) ? body.files : [];
    const saved = [];
    const failed = [];
    for (const f of files) {
      if (!f || typeof f.path !== "string" || typeof f.content !== "string") {
        failed.push({ path: f?.path ?? null, error: "Invalid file entry." });
        continue;
      }
      try {
        saved.push(await writeGeneratedFile(projectId, f.path, f.content));
      } catch (e) {
        failed.push({ path: f.path, error: String(e?.message || e) });
      }
    }
    const status = failed.length && !saved.length ? 400 : 200;
    return Response.json({ projectId, saved, failed }, { status });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
}

// DELETE /api/workspace?projectId=project_... — clears source files only.
export async function DELETE(req) {
  try {
    const url = new URL(req.url);
    const projectId = resolveProjectId(url.searchParams.get("projectId"));
    if (!projectId) return Response.json({ error: "Invalid project id." }, { status: 400 });
    await clearWorkspace(projectId);
    return Response.json({ projectId, cleared: true });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
}
