export function parseModelJson(raw) {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("Model ne empty response diya.");
  }

  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model response mein valid JSON object nahi mila.");
  }

  return JSON.parse(cleaned.slice(start, end + 1));
}
