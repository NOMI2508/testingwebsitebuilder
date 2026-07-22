import { getCompletionText } from "../../../lib/openrouter";
import { parseModelJson } from "../../../lib/model-json";
import { getModel } from "../../../lib/config";

export const runtime = "nodejs";

const PROMPT = `You classify messages for a multi-project AI website builder. Return JSON only.
Return exactly: {"action":"create_project|continue_project|fix_error|switch_project|question_only|needs_clarification","projectType":"portfolio|ecommerce|landing-page|saas|restaurant|blog|dashboard|business|custom|null","suggestedName":"string or null","suggestedSlug":"string or null","targetProjectId":"string or null","reason":"short reason","clarifyingQuestion":"string or null"}.
The selected project ID is the source of truth. With a selected project, implementation requests edit it unless the user explicitly asks for another/new project. Explanations and questions never modify files. An unrelated request with a selected project needs clarification. Never create a project for a component-level edit.
IMPORTANT — bug/error reports: With a selected project, if the user reports an error, a bug, a crash, an error message (e.g. "Cannot read properties of undefined", "X is not defined"), a blank/broken preview, or asks to fix/debug/"why isn't this working", use action "fix_error". The builder already has all the code and MUST locate and fix the problem itself — for "fix_error" NEVER use needs_clarification and NEVER ask which file or for a code snippet.`;

function normalize(value, knownIds) {
  const actions = new Set(["create_project", "continue_project", "fix_error", "switch_project", "question_only", "needs_clarification"]);
  const types = new Set(["portfolio", "ecommerce", "landing-page", "saas", "restaurant", "blog", "dashboard", "business", "custom"]);
  return {
    action: actions.has(value?.action) ? value.action : "needs_clarification",
    projectType: types.has(value?.projectType) ? value.projectType : null,
    suggestedName: typeof value?.suggestedName === "string" ? value.suggestedName : null,
    suggestedSlug: typeof value?.suggestedSlug === "string" ? value.suggestedSlug : null,
    targetProjectId: knownIds.has(value?.targetProjectId) ? value.targetProjectId : null,
    reason: typeof value?.reason === "string" ? value.reason : "Intent was ambiguous.",
    clarifyingQuestion: typeof value?.clarifyingQuestion === "string" ? value.clarifyingQuestion : null,
  };
}

export async function POST(req) {
  try {
    const body = await req.json();
    const prompt = String(body.prompt || "").trim();
    if (!prompt) return Response.json({ error: "Prompt required." }, { status: 400 });
    const projects = Array.isArray(body.projects) ? body.projects.map((p) => ({ id: p.id, name: p.name, type: p.type })) : [];
    const activeProject = body.activeProject || null;
    const raw = await getCompletionText(process.env.OPENROUTER_API_KEY, {
      model: getModel(),
      temperature: 0.05,
      messages: [
        { role: "system", content: PROMPT },
        { role: "user", content: JSON.stringify({ prompt, activeProject, existingProjects: projects }) },
      ],
    });
    return Response.json({ classification: normalize(parseModelJson(raw), new Set(projects.map((p) => p.id))) });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
}
