import {
  appendProjectChatMessage,
  clearProjectChat,
  readProjectChat,
} from "../../../../lib/project-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  try {
    return Response.json({ messages: await readProjectChat(params.projectId) });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 404 });
  }
}

export async function POST(req, { params }) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body.messages) ? body.messages : [body];
    const saved = [];
    for (const message of messages) {
      saved.push(await appendProjectChatMessage(params.projectId, message));
    }
    return Response.json({ messages: saved });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const body = await req.json().catch(() => ({}));
    if (body.confirm !== true) return Response.json({ error: "Confirmation required." }, { status: 400 });
    await clearProjectChat(params.projectId);
    return Response.json({ cleared: true });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 400 });
  }
}
