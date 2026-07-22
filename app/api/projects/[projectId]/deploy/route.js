import {
  getProject,
  isValidProjectId,
  readProjectDeployment,
  writeProjectDeployment,
} from "../../../../lib/project-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_HTML_BYTES = 4 * 1024 * 1024; // 4 MB self-contained document cap

// POST /api/projects/:id/deploy  { html, versionId? }
// Saves the built, self-contained preview document as the deployed site.
export async function POST(req, { params }) {
  try {
    const projectId = params.projectId;
    if (!isValidProjectId(projectId)) {
      return Response.json({ error: "Invalid project id." }, { status: 400 });
    }
    await getProject(projectId); // throws -> 404 if the project is gone
    const body = await req.json();
    const html = typeof body.html === "string" ? body.html : "";
    if (!html.trim() || !/<html[\s>]/i.test(html)) {
      return Response.json(
        { error: "A built preview document is required to deploy." },
        { status: 400 }
      );
    }
    if (Buffer.byteLength(html, "utf8") > MAX_HTML_BYTES) {
      return Response.json({ error: "Deployment document is too large." }, { status: 413 });
    }
    const project = await writeProjectDeployment(projectId, html, body.versionId || null);
    return Response.json({
      deploymentUrl: project.deploymentUrl,
      deployedAt: project.deployedAt,
      project,
    });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 400 });
  }
}

// GET /api/projects/:id/deploy — serves the deployed site.
// Served under a `sandbox` CSP so the generated site (which runs arbitrary JS)
// cannot read the builder origin's storage/cookies.
export async function GET(_req, { params }) {
  const notFound = () =>
    new Response("This project has not been deployed yet.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  try {
    if (!isValidProjectId(params.projectId)) return notFound();
    const html = await readProjectDeployment(params.projectId);
    if (!html) return notFound();
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Content-Security-Policy": "sandbox allow-scripts allow-popups;",
      },
    });
  } catch {
    return notFound();
  }
}
