import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const WORKSPACE_BASE = path.join(process.cwd(), "generated-workspace");
export const PROJECTS_BASE = path.join(WORKSPACE_BASE, "projects");
const MIGRATION_MARKER = path.join(WORKSPACE_BASE, ".projects-migrated-v1.json");

export function isValidProjectId(id) {
  return typeof id === "string" && /^project_[a-z0-9]{10,40}$/.test(id);
}

export function safeSlug(value) {
  const slug = String(value || "project")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || "project";
}

function newProjectId() {
  return `project_${crypto.randomBytes(8).toString("hex")}`;
}

async function readJson(file, fallback = null) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

async function atomicWriteJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp-${process.pid}`;
  await fs.writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
  await fs.rename(tmp, file);
}

function assertInsideProjects(candidate) {
  const resolved = path.resolve(candidate);
  const rel = path.relative(PROJECTS_BASE, resolved);
  if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error("Project path escaped the projects directory.");
  }
  return resolved;
}

// projectId -> resolved directory. A single generation calls the project-scoped
// fs helpers dozens of times; without this each call would rescan every project.
const dirCache = new Map();

function invalidateProjectDir(projectId) {
  dirCache.delete(projectId);
}

export async function resolveProjectDirectory(projectId) {
  if (!isValidProjectId(projectId)) throw new Error("Invalid project id.");
  const cached = dirCache.get(projectId);
  if (cached) {
    // Project directories never move, so a cheap existence check is enough to
    // trust the cache; only a deleted project forces a rescan.
    try {
      await fs.access(path.join(cached, "project.json"));
      return cached;
    } catch {
      dirCache.delete(projectId);
    }
  }
  let entries = [];
  try {
    entries = await fs.readdir(PROJECTS_BASE, { withFileTypes: true });
  } catch {
    throw new Error("Project not found.");
  }
  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith(`${projectId}-`)) continue;
    const dir = assertInsideProjects(path.join(PROJECTS_BASE, entry.name));
    const metadata = await readJson(path.join(dir, "project.json"));
    if (metadata?.id === projectId) {
      dirCache.set(projectId, dir);
      return dir;
    }
  }
  throw new Error("Project not found.");
}

export async function createProject({ name, type = "custom", description = "", spec = null }) {
  await fs.mkdir(PROJECTS_BASE, { recursive: true });
  const id = newProjectId();
  const projectName = String(name || "Untitled Website").trim().slice(0, 100) || "Untitled Website";
  const slug = safeSlug(projectName);
  const dir = assertInsideProjects(path.join(PROJECTS_BASE, `${id}-${slug}`));
  const now = new Date().toISOString();
  const project = {
    id,
    name: projectName,
    slug,
    type: String(type || "custom"),
    description: String(description || "").slice(0, 500),
    status: "active",
    createdAt: now,
    updatedAt: now,
    activeSessionId: null,
    entryFile: "src/App.jsx",
    previewStatus: "idle",
    lastWorkingVersionId: null,
    deploymentUrl: null,
    deployedAt: null,
    deployedVersionId: null,
  };
  await fs.mkdir(path.join(dir, "src"), { recursive: true });
  await fs.mkdir(path.join(dir, "sessions"), { recursive: true });
  await fs.mkdir(path.join(dir, "versions"), { recursive: true });
  await atomicWriteJson(path.join(dir, "project.json"), project);
  if (spec) await atomicWriteJson(path.join(dir, "spec.json"), spec);
  await fs.writeFile(path.join(dir, "chat.jsonl"), "", { flag: "a" });
  dirCache.set(id, dir);
  return project;
}

export async function listProjects() {
  await ensureCurrentWorkspaceMigrated();
  let entries = [];
  try {
    entries = await fs.readdir(PROJECTS_BASE, { withFileTypes: true });
  } catch {
    return [];
  }
  const projects = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const dir = assertInsideProjects(path.join(PROJECTS_BASE, entry.name));
    const item = await readJson(path.join(dir, "project.json"));
    if (item && isValidProjectId(item.id)) projects.push(item);
  }
  return projects.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

export async function getProject(projectId) {
  const dir = await resolveProjectDirectory(projectId);
  return readJson(path.join(dir, "project.json"));
}

export async function updateProject(projectId, patch) {
  const dir = await resolveProjectDirectory(projectId);
  const current = await readJson(path.join(dir, "project.json"));
  if (!current) throw new Error("Project metadata is missing.");
  const allowed = {};
  for (const key of ["name", "description", "status", "activeSessionId", "entryFile", "previewStatus", "lastWorkingVersionId", "deploymentUrl", "deployedAt", "deployedVersionId"]) {
    if (Object.prototype.hasOwnProperty.call(patch, key)) allowed[key] = patch[key];
  }
  const next = { ...current, ...allowed, id: current.id, slug: current.slug, updatedAt: new Date().toISOString() };
  await atomicWriteJson(path.join(dir, "project.json"), next);
  return next;
}

export async function deleteProject(projectId) {
  const dir = await resolveProjectDirectory(projectId);
  await fs.rm(assertInsideProjects(dir), { recursive: true, force: true });
  invalidateProjectDir(projectId);
}

export async function readProjectSpec(projectId) {
  const dir = await resolveProjectDirectory(projectId);
  return readJson(path.join(dir, "spec.json"));
}

export async function writeProjectSpec(projectId, spec) {
  const dir = await resolveProjectDirectory(projectId);
  await atomicWriteJson(path.join(dir, "spec.json"), spec);
  await updateProject(projectId, {});
}

export async function readProjectPlan(projectId) {
  const dir = await resolveProjectDirectory(projectId);
  return readJson(path.join(dir, "plan.json"));
}

export async function writeProjectPlan(projectId, plan) {
  const dir = await resolveProjectDirectory(projectId);
  await atomicWriteJson(path.join(dir, "plan.json"), plan);
  await updateProject(projectId, { entryFile: plan?.entryFile || "src/App.jsx" });
}

/* Drag-and-drop builder site document (builder.json), stored alongside
   spec.json/plan.json. The route validates before calling this. */
export async function readProjectBuilder(projectId) {
  const dir = await resolveProjectDirectory(projectId);
  return readJson(path.join(dir, "builder.json"));
}

export async function writeProjectBuilder(projectId, site) {
  const dir = await resolveProjectDirectory(projectId);
  await atomicWriteJson(path.join(dir, "builder.json"), site);
  await updateProject(projectId, {}); // bump updatedAt
}

export async function appendProjectChatMessage(projectId, message) {
  const dir = await resolveProjectDirectory(projectId);
  const item = {
    id: `msg_${crypto.randomBytes(8).toString("hex")}`,
    role: ["user", "assistant", "system-event"].includes(message.role) ? message.role : "system-event",
    content: String(message.content || ""),
    createdAt: new Date().toISOString(),
    ...(message.generationSessionId ? { generationSessionId: message.generationSessionId } : {}),
    ...(Array.isArray(message.relatedFiles) ? { relatedFiles: message.relatedFiles } : {}),
  };
  await fs.appendFile(path.join(dir, "chat.jsonl"), `${JSON.stringify(item)}\n`, "utf8");
  await updateProject(projectId, {});
  return item;
}

export async function readProjectChat(projectId, limit = 100) {
  const dir = await resolveProjectDirectory(projectId);
  try {
    const lines = (await fs.readFile(path.join(dir, "chat.jsonl"), "utf8")).split("\n").filter(Boolean);
    return lines.slice(-Math.max(1, Math.min(limit, 200))).flatMap((line) => {
      try { return [JSON.parse(line)]; } catch { return []; }
    });
  } catch {
    return [];
  }
}

export async function clearProjectChat(projectId) {
  const dir = await resolveProjectDirectory(projectId);
  await fs.writeFile(path.join(dir, "chat.jsonl"), "", "utf8");
  await updateProject(projectId, {});
}

export async function createProjectVersion(projectId, prompt, files) {
  const dir = await resolveProjectDirectory(projectId);
  const id = `version_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;
  const versionDir = path.join(dir, "versions", id);
  await fs.mkdir(path.join(versionDir, "src"), { recursive: true });
  for (const file of files || []) {
    if (!file.path?.startsWith("src/") || typeof file.content !== "string") continue;
    const target = path.resolve(versionDir, file.path);
    if (!path.relative(versionDir, target).startsWith("src")) continue;
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, file.content, "utf8");
  }
  await atomicWriteJson(path.join(versionDir, "metadata.json"), {
    id,
    prompt: String(prompt || "Edit snapshot"),
    createdAt: new Date().toISOString(),
    changedFiles: [],
    status: "snapshot",
  });
  return id;
}

export async function markProjectVersionWorking(projectId, versionId, changedFiles) {
  const dir = await resolveProjectDirectory(projectId);
  const file = path.join(dir, "versions", versionId, "metadata.json");
  const current = await readJson(file, { id: versionId });
  await atomicWriteJson(file, { ...current, changedFiles: changedFiles || [], status: "working" });
  await updateProject(projectId, { lastWorkingVersionId: versionId });
}

export async function listProjectVersions(projectId) {
  const dir = await resolveProjectDirectory(projectId);
  const base = path.join(dir, "versions");
  let entries = [];
  try { entries = await fs.readdir(base, { withFileTypes: true }); } catch { return []; }
  const versions = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || !/^version_[a-z0-9_]+$/.test(entry.name)) continue;
    const metadata = await readJson(path.join(base, entry.name, "metadata.json"));
    if (metadata) versions.push(metadata);
  }
  return versions.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export async function restoreProjectVersion(projectId, versionId) {
  if (typeof versionId !== "string" || !/^version_[a-z0-9_]+$/.test(versionId)) {
    throw new Error("Invalid version id.");
  }
  const dir = await resolveProjectDirectory(projectId);
  const versionsBase = path.join(dir, "versions");
  const versionDir = path.resolve(versionsBase, versionId);
  if (path.relative(versionsBase, versionDir).startsWith("..")) throw new Error("Version path escaped project.");
  const metadata = await readJson(path.join(versionDir, "metadata.json"));
  if (!metadata) throw new Error("Version not found.");
  const source = path.join(versionDir, "src");
  const target = path.join(dir, "src");
  await fs.rm(target, { recursive: true, force: true });
  await fs.cp(source, target, { recursive: true });
  await updateProject(projectId, { previewStatus: "ready", lastWorkingVersionId: versionId });
  await appendProjectChatMessage(projectId, {
    role: "system-event",
    content: `Restored project version ${versionId}.`,
  });
  return metadata;
}

/* ------------------------------- deployment ------------------------------ */

// Save the self-contained preview HTML as the project's deployed site and
// record the deployment metadata. The served URL renders that exact document.
export async function writeProjectDeployment(projectId, html, versionId = null) {
  const dir = await resolveProjectDirectory(projectId);
  const deployDir = path.join(dir, "deploy");
  await fs.mkdir(deployDir, { recursive: true });
  await fs.writeFile(path.join(deployDir, "index.html"), String(html || ""), "utf8");
  return updateProject(projectId, {
    deploymentUrl: `/api/projects/${projectId}/deploy`,
    deployedAt: new Date().toISOString(),
    deployedVersionId: versionId || null,
  });
}

export async function readProjectDeployment(projectId) {
  const dir = await resolveProjectDirectory(projectId);
  try {
    return await fs.readFile(path.join(dir, "deploy", "index.html"), "utf8");
  } catch {
    return null;
  }
}

export async function ensureCurrentWorkspaceMigrated() {
  const existingMarker = await readJson(MIGRATION_MARKER);
  if (existingMarker) {
    if (isValidProjectId(existingMarker.migratedProjectId)) {
      try {
        const dir = await resolveProjectDirectory(existingMarker.migratedProjectId);
        const [spec, plan] = await Promise.all([
          readJson(path.join(dir, "spec.json")),
          readJson(path.join(dir, "plan.json")),
        ]);
        const legacy = await readLatestLegacySession();
        if (!spec || !plan) {
          if (!spec && legacy?.spec) await atomicWriteJson(path.join(dir, "spec.json"), legacy.spec);
          if (!plan && legacy?.plan) await atomicWriteJson(path.join(dir, "plan.json"), legacy.plan);
        }
        const metadata = await readJson(path.join(dir, "project.json"));
        if (metadata?.name === "Migrated Project" && legacy?.spec?.project) {
          await atomicWriteJson(path.join(dir, "project.json"), {
            ...metadata,
            name: legacy.spec.project.name || metadata.name,
            type: legacy.spec.project.type || metadata.type,
            description: legacy.spec.project.summary || metadata.description,
            updatedAt: new Date().toISOString(),
          });
        }
      } catch { /* migrated project was removed */ }
    }
    return;
  }
  await fs.mkdir(PROJECTS_BASE, { recursive: true });
  const currentDir = path.join(WORKSPACE_BASE, "current");
  let hasFiles = false;
  try {
    const entries = await fs.readdir(currentDir);
    hasFiles = entries.length > 0;
  } catch { /* no legacy workspace */ }
  let migratedProjectId = null;
  if (hasFiles) {
    const legacy = await readLatestLegacySession();
    const project = await createProject({
      name: legacy?.spec?.project?.name || "Migrated Project",
      type: legacy?.spec?.project?.type || "custom",
      description: legacy?.spec?.project?.summary || "Imported from the previous single-project workspace.",
      spec: legacy?.spec || null,
    });
    const dir = await resolveProjectDirectory(project.id);
    await fs.cp(currentDir, dir, { recursive: true });
    if (legacy?.plan) await atomicWriteJson(path.join(dir, "plan.json"), legacy.plan);
    const legacySessions = path.join(WORKSPACE_BASE, ".sessions");
    try { await fs.cp(legacySessions, path.join(dir, "sessions"), { recursive: true }); } catch { /* none */ }
    migratedProjectId = project.id;
  }
  await atomicWriteJson(MIGRATION_MARKER, { migratedAt: new Date().toISOString(), migratedProjectId });
}

async function readLatestLegacySession() {
  const base = path.join(WORKSPACE_BASE, ".sessions");
  let ids = [];
  try { ids = await fs.readdir(base); } catch { return null; }
  const sessions = [];
  for (const id of ids) {
    const metadata = await readJson(path.join(base, id, "metadata.json"));
    if (metadata?.spec && metadata?.plan) sessions.push(metadata);
  }
  return sessions.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))[0] || null;
}
