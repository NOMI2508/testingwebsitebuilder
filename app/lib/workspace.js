import fs from "node:fs/promises";
import path from "node:path";
import { validateRelPath } from "./file-path-validator";
import { MAX_FILE_BYTES, MAX_WORKSPACE_FILES } from "./config";
import { isValidProjectId, resolveProjectDirectory } from "./project-store";

export { isValidProjectId };

export async function resolveSafe(projectId, relPath) {
  const v = validateRelPath(relPath);
  if (!v.ok) throw new Error(`Unsafe path "${relPath}": ${v.error}`);
  const root = await resolveProjectDirectory(projectId);
  const abs = path.resolve(root, v.path);
  const rel = path.relative(root, abs);
  if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) throw new Error("Path escapes the project.");
  return { abs, path: v.path, root };
}

async function atomicWrite(abs, content) {
  await fs.mkdir(path.dirname(abs), { recursive: true });
  const tmp = `${abs}.tmp-${process.pid}`;
  await fs.writeFile(tmp, content, "utf8");
  await fs.rename(tmp, abs);
}

export async function writeGeneratedFile(projectId, relPath, content) {
  if (typeof content !== "string") throw new Error("File content must be a string.");
  if (Buffer.byteLength(content, "utf8") > MAX_FILE_BYTES) throw new Error(`File is too large: ${relPath}`);
  const { abs, path: safePath } = await resolveSafe(projectId, relPath);
  await atomicWrite(abs, content);
  return safePath;
}

export async function readAllGeneratedFiles(projectId) {
  const root = await resolveProjectDirectory(projectId);
  const src = path.join(root, "src");
  const out = [];
  async function walk(dir) {
    let entries = [];
    try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (out.length >= MAX_WORKSPACE_FILES) return;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile()) {
        const rel = path.relative(root, full).split(path.sep).join("/");
        const v = validateRelPath(rel);
        if (v.ok) out.push({ path: rel, content: await fs.readFile(full, "utf8") });
      }
    }
  }
  await walk(src);
  return out.sort((a, b) => a.path.localeCompare(b.path));
}

export async function clearWorkspace(projectId) {
  const root = await resolveProjectDirectory(projectId);
  await fs.rm(path.join(root, "src"), { recursive: true, force: true });
  await fs.mkdir(path.join(root, "src"), { recursive: true });
}
