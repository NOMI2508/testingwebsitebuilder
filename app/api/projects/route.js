import { createProject, listProjects } from "../../lib/project-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json({ projects: await listProjects() });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    if (!body?.name || typeof body.name !== "string") {
      return Response.json({ error: "Project name is required." }, { status: 400 });
    }
    const project = await createProject(body);
    return Response.json({ project }, { status: 201 });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
}
