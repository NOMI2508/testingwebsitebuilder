// Overlap de-duplication for resume/continuation.
//
// When a stream is interrupted mid-file and the model is asked to continue,
// it frequently repeats a small tail of the text it already produced. This
// helper compares the suffix of what we already have with the prefix of the
// incoming continuation, removes the longest overlap, and returns ONLY the
// new text that should be appended.

export const MAX_OVERLAP = 4000;

// Returns the portion of `incomingText` that is new (overlap removed).
export function mergeContinuation(existingText, incomingText, maxOverlap = MAX_OVERLAP) {
  const existing = typeof existingText === "string" ? existingText : "";
  const incoming = typeof incomingText === "string" ? incomingText : "";

  if (!existing) return incoming;
  if (!incoming) return "";

  const tail = existing.slice(-maxOverlap);
  const limit = Math.min(tail.length, incoming.length);

  // Prefer the longest overlap so we never re-emit duplicated content.
  for (let len = limit; len > 0; len -= 1) {
    if (tail.slice(tail.length - len) === incoming.slice(0, len)) {
      return incoming.slice(len);
    }
  }

  return incoming;
}
