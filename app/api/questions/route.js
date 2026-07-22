import { getCompletionText } from "../../lib/openrouter";
import { getModel } from "../../lib/config";
import { appendProjectChatMessage, readProjectChat } from "../../lib/project-store";
import { readAllGeneratedFiles } from "../../lib/workspace";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { projectId, question } = await req.json();
    let context = "No project is selected.";
    if (projectId) {
      const [files, chat] = await Promise.all([readAllGeneratedFiles(projectId), readProjectChat(projectId, 12)]);
      context = `Project files:\n${files.slice(0, 12).map((f) => `${f.path}:\n${f.content.slice(0, 1800)}`).join("\n\n")}\n\nRecent chat:\n${JSON.stringify(chat)}`;
      await appendProjectChatMessage(projectId, { role: "user", content: question });
    }
    const answer = await getCompletionText(process.env.OPENROUTER_API_KEY, {
      model: getModel(),
      temperature: 0.2,
      messages: [
        { role: "system", content: "Answer the user's question clearly and concisely. Do not output code-generation file markers and do not claim to modify files." },
        { role: "user", content: `${context}\n\nQuestion: ${question}` },
      ],
    });
    if (projectId) await appendProjectChatMessage(projectId, { role: "assistant", content: answer });
    return Response.json({ answer });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
}
