import {
  deleteProject,
  getProject,
  readProjectChat,
  readProjectPlan,
  readProjectSpec,
  updateProject,
} from "../../../lib/project-store";
import { readAllGeneratedFiles } from "../../../lib/workspace";
import { findResumableSession as findProjectSession } from "../../../lib/session-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  try {
    const projectId = params.projectId;
    const [project, spec, plan, files, chat, resumableSession] = await Promise.all([
      getProject(projectId),
      readProjectSpec(projectId),
      readProjectPlan(projectId),
      readAllGeneratedFiles(projectId),
      readProjectChat(projectId),
      findProjectSession(projectId),
    ]);
    return Response.json({ project, spec, plan, files, chat, resumableSession });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 404 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const body = await req.json();
    const patch = {};
    if (typeof body.name === "string" && body.name.trim()) patch.name = body.name.trim().slice(0, 100);
    if (typeof body.description === "string") patch.description = body.description.slice(0, 500);
    return Response.json({ project: await updateProject(params.projectId, patch) });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const project = await getProject(params.projectId);
    const body = await req.json().catch(() => ({}));
    if (body.confirmName !== project.name) {
      return Response.json({ error: "Exact project name confirmation is required." }, { status: 400 });
    }
    await deleteProject(params.projectId);
    return Response.json({ deleted: true, projectId: params.projectId });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 400 });
  }
}
