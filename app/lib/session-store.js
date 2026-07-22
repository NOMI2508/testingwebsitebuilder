import fs from "node:fs/promises";
import path from "node:path";
import { resolveProjectDirectory } from "./project-store";

export function isValidSessionId(id) {
  return typeof id === "string" && /^[A-Za-z0-9_-]{6,80}$/.test(id);
}

export function newSessionId() {
  return `gen-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

async function sessionDir(projectId, id) {
  if (!isValidSessionId(id)) throw new Error("Invalid session id.");
  const root = await resolveProjectDirectory(projectId);
  const base = path.join(root, "sessions");
  const dir = path.resolve(base, id);
  if (path.relative(base, dir).startsWith("..")) throw new Error("Session path escaped project.");
  return dir;
}

async function atomicWriteJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp-${process.pid}`;
  await fs.writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
  await fs.rename(tmp, file);
}

async function readJson(file, fallback) {
  try { return JSON.parse(await fs.readFile(file, "utf8")); } catch { return fallback; }
}

export async function createSession(projectId, id, data) {
  const dir = await sessionDir(projectId, id);
  const now = new Date().toISOString();
  const metadata = { sessionId: id, projectId, status: "generating", mode: "initial", createdAt: now, updatedAt: now, currentBatch: 0, requestedPaths: [], completedPaths: [], currentFilePath: null, streamOffset: 0, lastError: null, spec: null, plan: null, ...data };
  await atomicWriteJson(path.join(dir, "metadata.json"), metadata);
  await atomicWriteJson(path.join(dir, "completed-files.json"), []);
  return metadata;
}

export async function readSession(projectId, id) {
  return readJson(path.join(await sessionDir(projectId, id), "metadata.json"), null);
}

export async function updateSession(projectId, id, patch) {
  const dir = await sessionDir(projectId, id);
  const current = (await readJson(path.join(dir, "metadata.json"), null)) || { sessionId: id, projectId };
  const next = { ...current, ...patch, projectId, updatedAt: new Date().toISOString() };
  await atomicWriteJson(path.join(dir, "metadata.json"), next);
  return next;
}

export async function appendTranscript(projectId, id, text) {
  const file = path.join(await sessionDir(projectId, id), "transcript.txt");
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.appendFile(file, text, "utf8");
}

export async function writePartialFile(projectId, id, partial) {
  await atomicWriteJson(path.join(await sessionDir(projectId, id), "partial-file.json"), partial);
}
export async function readPartialFile(projectId, id) {
  return readJson(path.join(await sessionDir(projectId, id), "partial-file.json"), null);
}
export async function clearPartialFile(projectId, id) {
  await fs.rm(path.join(await sessionDir(projectId, id), "partial-file.json"), { force: true });
}
export async function readCompletedFiles(projectId, id) {
  return readJson(path.join(await sessionDir(projectId, id), "completed-files.json"), []);
}
export async function upsertCompletedFile(projectId, id, file) {
  const dir = await sessionDir(projectId, id);
  const files = await readJson(path.join(dir, "completed-files.json"), []);
  const map = new Map(files.map((f) => [f.path, f]));
  map.set(file.path, file);
  await atomicWriteJson(path.join(dir, "completed-files.json"), Array.from(map.values()));
}

export async function findResumableSession(projectId) {
  const root = await resolveProjectDirectory(projectId);
  const base = path.join(root, "sessions");
  let ids = [];
  try { ids = await fs.readdir(base); } catch { return null; }
  const candidates = [];
  for (const id of ids) {
    if (!isValidSessionId(id)) continue;
    const meta = await readJson(path.join(base, id, "metadata.json"), null);
    if (meta?.projectId === projectId && ["interrupted", "generating"].includes(meta.status)) candidates.push(meta);
  }
  return candidates.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))[0] || null;
}
