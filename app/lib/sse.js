// Tiny helpers for writing Server-Sent Events from a route (Phase 4).

// Serialize one SSE frame. `data` may be a string or any JSON-serializable value.
export function sseFrame(event, data) {
  const payload = typeof data === "string" ? data : JSON.stringify(data);
  // Split on newlines so multi-line data stays valid SSE.
  const lines = payload.split("\n").map((l) => `data: ${l}`).join("\n");
  return `event: ${event}\n${lines}\n\n`;
}
