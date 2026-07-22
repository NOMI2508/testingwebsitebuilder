// Pure path-safety helpers shared by the server (workspace writes, plan
// validation) and usable on the client. No Node APIs are used here so the
// module can run in any environment.
//
// Every generated file must live under src/ and use an allowed extension.
// Traversal, absolute paths, hidden files (.env, .git, ...), null bytes and
// blocked directories are rejected.

export const ALLOWED_EXTENSIONS = [".js", ".jsx", ".css", ".json", ".md", ".txt"];

const BLOCKED_SEGMENTS = new Set([
  "node_modules",
  ".next",
  ".git",
  ".sessions",
]);

function fail(error) {
  return { ok: false, error };
}

// Pure extension helper (no node:path dependency).
export function extnameOf(p) {
  const base = p.slice(p.lastIndexOf("/") + 1);
  const dot = base.lastIndexOf(".");
  return dot <= 0 ? "" : base.slice(dot).toLowerCase();
}

// Validate a repo-relative generated file path.
// Returns { ok: true, path } with the normalized path, or { ok: false, error }.
export function validateRelPath(input, options = {}) {
  const { requireSrc = true } = options;

  if (typeof input !== "string") return fail("Path must be a string.");
  const raw = input.trim();
  if (!raw) return fail("Path is empty.");
  if (raw.includes("\0")) return fail("Path contains a null byte.");
  if (raw.includes("\\")) return fail("Backslashes are not allowed in paths.");
  if (raw.startsWith("/")) return fail("Absolute paths are not allowed.");
  if (/^[a-zA-Z]:/.test(raw)) return fail("Windows drive paths are not allowed.");

  const segments = raw.split("/").filter((s) => s.length > 0);
  if (segments.length === 0) return fail("Path has no usable segments.");

  for (const seg of segments) {
    if (seg === "." || seg === "..") return fail("Path traversal ('.' / '..') is not allowed.");
    if (seg.startsWith(".")) return fail(`Hidden files or folders are not allowed: ${seg}`);
    if (BLOCKED_SEGMENTS.has(seg)) return fail(`Blocked path segment: ${seg}`);
    if (!/^[A-Za-z0-9._-]+$/.test(seg)) {
      return fail(`Invalid characters in path segment: ${seg}`);
    }
  }

  const normalized = segments.join("/");
  const lower = normalized.toLowerCase();
  if (lower.includes("package-lock")) return fail("package-lock files are not allowed.");
  if (lower.includes(".env")) return fail("Environment files are not allowed.");

  if (requireSrc && segments[0] !== "src") {
    return fail("Path must live inside src/.");
  }

  const ext = extnameOf(normalized);
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return fail(`Unsupported file extension: ${ext || "(none)"}`);
  }

  return { ok: true, path: normalized };
}

export function isValidRelPath(input, options) {
  return validateRelPath(input, options).ok;
}
