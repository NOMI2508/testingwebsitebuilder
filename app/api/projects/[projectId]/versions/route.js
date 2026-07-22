import { listProjectVersions, restoreProjectVersion } from "../../../../lib/project-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  try {
    return Response.json({ versions: await listProjectVersions(params.projectId) });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 404 });
  }
}

export async function POST(req, { params }) {
  try {
    const body = await req.json();
    if (body.confirm !== true) return Response.json({ error: "Restore confirmation required." }, { status: 400 });
    const version = await restoreProjectVersion(params.projectId, body.versionId);
    return Response.json({ restored: true, version });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 400 });
  }
}
