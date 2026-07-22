import {
  getProject,
  isValidProjectId,
  readProjectBuilder,
  writeProjectBuilder,
} from "../../../../lib/project-store";
import { normalizeSite } from "../../../../lib/builder/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SITE_BYTES = 1.5 * 1024 * 1024; // builder documents are plain JSON

// GET /api/projects/:id/builder — load the saved visual-builder document.
export async function GET(_req, { params }) {
  try {
    if (!isValidProjectId(params.projectId)) {
      return Response.json({ error: "Invalid project id." }, { status: 400 });
    }
    await getProject(params.projectId); // throws -> 404 when the project is gone
    const site = await readProjectBuilder(params.projectId);
    return Response.json({ projectId: params.projectId, site: site ? normalizeSite(site) : null });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 404 });
  }
}

// PUT /api/projects/:id/builder  { site } — validate + persist the document.
export async function PUT(req, { params }) {
  try {
    if (!isValidProjectId(params.projectId)) {
      return Response.json({ error: "Invalid project id." }, { status: 400 });
    }
    await getProject(params.projectId);
    const body = await req.json();
    if (!body?.site || typeof body.site !== "object") {
      return Response.json({ error: "A site document is required." }, { status: 400 });
    }
    if (Buffer.byteLength(JSON.stringify(body.site), "utf8") > MAX_SITE_BYTES) {
      return Response.json({ error: "Site document is too large." }, { status: 413 });
    }
    const site = normalizeSite(body.site);
    await writeProjectBuilder(params.projectId, site);
    return Response.json({ projectId: params.projectId, site, savedAt: new Date().toISOString() });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 400 });
  }
}
