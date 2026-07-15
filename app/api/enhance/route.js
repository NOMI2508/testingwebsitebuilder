import { getCompletionText } from "../../lib/openrouter";
import { parseModelJson } from "../../lib/model-json";

export async function POST(req) {
  try {
    const body = await req.json();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const existingSpec = body.existingSpec && typeof body.existingSpec === "object"
      ? body.existingSpec
      : null;

    if (!prompt) {
      return Response.json({ error: "Prompt khaali hai." }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "OPENROUTER_API_KEY set nahi hai. .env.local check karein." },
        { status: 500 }
      );
    }

    const systemPrompt = `
You are a senior product strategist, UX designer and requirements analyst working inside an AI website builder.

Understand the user's real goal before code is generated. Infer sensible defaults, record assumptions, and ask at most 3 clarification questions only when missing details block implementation.

Return valid JSON only. No markdown fences.

Return exactly this shape:
{
  "status": "ready",
  "project": {
    "name": "short project name",
    "type": "landing-page | portfolio | ecommerce | saas | blog | dashboard | business | custom",
    "summary": "clear summary",
    "purpose": "main purpose",
    "targetAudience": "audience",
    "primaryGoal": "main conversion or user goal"
  },
  "assumptions": ["assumption"],
  "pages": [
    {
      "name": "Home",
      "route": "/",
      "purpose": "page purpose",
      "sections": [
        {
          "name": "Hero",
          "purpose": "section purpose",
          "contentRequirements": ["required content"],
          "interactions": ["interaction if any"]
        }
      ]
    }
  ],
  "features": [
    { "name": "feature name", "description": "what it does" }
  ],
  "userFlows": [
    { "name": "flow name", "steps": ["step one", "step two"] }
  ],
  "designSystem": {
    "styleKeywords": ["modern", "professional"],
    "colorDirection": {
      "primary": "color",
      "secondary": "color",
      "background": "color",
      "text": "color",
      "accent": "color"
    },
    "typographyDirection": "typography style",
    "spacing": "compact | comfortable | spacious",
    "borderRadius": "sharp | medium | rounded",
    "imagery": "image direction",
    "responsiveApproach": "mobile-first"
  },
  "content": {
    "tone": "content tone",
    "headlineIdeas": ["headline"],
    "ctaIdeas": ["CTA"],
    "requiredContent": ["required content"]
  },
  "technicalRequirements": {
    "previewTarget": "react-mantine",
    "language": "JavaScript",
    "responsive": true,
    "accessibility": true,
    "backendRequired": false,
    "databaseRequired": false,
    "authenticationRequired": false
  },
  "acceptanceCriteria": ["specific condition that can be checked"],
  "clarifyingQuestions": []
}

When an existing specification is provided:
- Update it according to the latest user request.
- Preserve unrelated existing decisions.
- Return the full updated specification.
`.trim();

    const userContent = existingSpec
      ? `Existing project specification:\n${JSON.stringify(existingSpec, null, 2)}\n\nLatest user request:\n${prompt}`
      : prompt;

    const raw = await getCompletionText(apiKey, {
      model: "poolside/laguna-m.1:free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      temperature: 0.2,
    });

    const spec = parseModelJson(raw);
    return Response.json({ spec });
  } catch (error) {
    console.error("Enhance route error:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Requirements analyze nahi ho sakin.",
      },
      { status: 500 }
    );
  }
}
