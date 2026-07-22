import { readAllGeneratedFiles, writeGeneratedFile } from "../../../../lib/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  try {
    return Response.json({ projectId: params.projectId, files: await readAllGeneratedFiles(params.projectId) });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 404 });
  }
}

export async function POST(req, { params }) {
  try {
    const body = await req.json();
    const saved = [];
    for (const file of Array.isArray(body.files) ? body.files : []) {
      saved.push(await writeGeneratedFile(params.projectId, file.path, file.content));
    }
    return Response.json({ projectId: params.projectId, saved });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 400 });
  }
}
