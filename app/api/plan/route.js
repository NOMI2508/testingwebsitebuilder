import { getCompletionText } from "../../lib/openrouter";
import { parseModelJson } from "../../lib/model-json";

export async function POST(req) {
  try {
    const { spec } = await req.json();

    if (!spec || typeof spec !== "object") {
      return Response.json(
        { error: "Project specification required hai." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "OPENROUTER_API_KEY missing hai." },
        { status: 500 }
      );
    }

    const systemPrompt = `
You are a senior frontend architect.

Create a professional file plan for a React + Mantine live-preview project. Do not write code.
Return valid JSON only. No markdown fences.

Architecture rules:
- The entry file must be src/App.jsx.
- App.jsx must only compose major page components.
- Put layout components in src/components/layout/.
- Put page sections in src/components/sections/.
- Put shared components in src/components/common/.
- Put ecommerce/product/cart components in src/components/product/ or src/components/cart/ when needed.
- Put reusable content and arrays in src/data/.
- Put React contexts in src/context/.
- Put utility functions in src/lib/.
- Put theme configuration in src/theme/.
- Use one primary component per file.
- React component filenames must use PascalCase.
- JavaScript data and utility filenames must use camelCase.
- Folder names must use lowercase.
- Do not create unnecessary files.
- Maximum 20 files for the first version.
- Arrange generation batches in dependency order.
- Each batch should contain 3 to 5 files, except the final batch may contain fewer.

Return exactly this shape:
{
  "entryFile": "src/App.jsx",
  "architectureSummary": "short explanation",
  "files": [
    {
      "path": "src/components/sections/HeroSection.jsx",
      "category": "entry | layout | section | feature | data | context | utility | theme",
      "responsibility": "what this file contains",
      "dependsOn": ["another/file.js"]
    }
  ],
  "batches": [
    ["src/data/siteContent.js", "src/theme/theme.js"],
    ["src/components/layout/Navbar.jsx", "src/components/sections/HeroSection.jsx"],
    ["src/App.jsx"]
  ]
}
`.trim();

    const raw = await getCompletionText(apiKey, {
      model: "poolside/laguna-m.1:free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(spec, null, 2) },
      ],
      temperature: 0.1,
    });

    const plan = parseModelJson(raw);
    return Response.json({ plan });
  } catch (error) {
    console.error("Plan route error:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "File plan generate nahi hua.",
      },
      { status: 500 }
    );
  }
}
