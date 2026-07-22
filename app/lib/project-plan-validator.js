// Server-side validation + normalization of the file/folder plan (Phase 2).
//
// The model produces a plan; we never trust it blindly. validatePlan() reports
// problems; normalizePlan() repairs the fixable ones (dedupe, cap to 20 files,
// ensure the entry file exists, rebuild batches in dependency order with the
// entry generated last) so the pipeline rarely has to hard-fail.

import { validateRelPath } from "./file-path-validator";
import { MAX_PLAN_FILES } from "./config";

export const ENTRY_FILE = "src/App.jsx";
const MAX_BATCH = 5;

export function validatePlan(plan) {
  const errors = [];

  if (!plan || typeof plan !== "object") {
    return { ok: false, errors: ["Plan is not an object."] };
  }

  const files = Array.isArray(plan.files) ? plan.files : [];
  if (files.length === 0) errors.push("Plan has no files.");
  if (files.length > MAX_PLAN_FILES) {
    errors.push(`Plan exceeds ${MAX_PLAN_FILES} files (${files.length}).`);
  }

  const known = new Set();
  for (const f of files) {
    const p = f && typeof f.path === "string" ? f.path.trim() : "";
    const v = validateRelPath(p);
    if (!v.ok) {
      errors.push(`Invalid file path "${p}": ${v.error}`);
      continue;
    }
    if (known.has(v.path)) {
      errors.push(`Duplicate path: ${v.path}`);
      continue;
    }
    known.add(v.path);
  }

  const entry = typeof plan.entryFile === "string" ? plan.entryFile.trim() : ENTRY_FILE;
  if (!known.has(entry)) {
    errors.push(`Entry file "${entry}" is not present in the file list.`);
  }

  const batches = Array.isArray(plan.batches) ? plan.batches : [];
  if (batches.length === 0) errors.push("Plan has no batches.");

  const batched = new Set();
  batches.forEach((batch, i) => {
    if (!Array.isArray(batch)) {
      errors.push(`Batch ${i} is not an array.`);
      return;
    }
    for (const bp of batch) {
      const p = typeof bp === "string" ? bp.trim() : "";
      if (!known.has(p)) {
        errors.push(`Batch ${i} references an unknown path: ${p || "(empty)"}`);
      } else {
        batched.add(p);
      }
    }
  });

  for (const p of known) {
    if (!batched.has(p)) errors.push(`File is not included in any batch: ${p}`);
  }

  const last = batches[batches.length - 1];
  if (Array.isArray(last) && known.has(entry)) {
    const lastPaths = last.map((s) => String(s).trim());
    if (!lastPaths.includes(entry)) {
      errors.push("Entry file must be generated in the final batch.");
    }
  }

  return { ok: errors.length === 0, errors, plan };
}

// Best-effort repair. Always returns a plan object; combine with validatePlan
// afterwards to decide whether it is usable.
export function normalizePlan(rawPlan) {
  const plan = rawPlan && typeof rawPlan === "object" ? rawPlan : {};
  const rawFiles = Array.isArray(plan.files) ? plan.files : [];

  const seen = new Set();
  const files = [];
  for (const f of rawFiles) {
    if (files.length >= MAX_PLAN_FILES) break;
    const p = f && typeof f.path === "string" ? f.path.trim() : "";
    const v = validateRelPath(p);
    if (!v.ok || seen.has(v.path)) continue;
    seen.add(v.path);
    files.push({
      path: v.path,
      category: typeof f.category === "string" ? f.category : "component",
      responsibility:
        typeof f.responsibility === "string" ? f.responsibility : "",
      dependsOn: Array.isArray(f.dependsOn)
        ? f.dependsOn.filter((d) => typeof d === "string")
        : [],
    });
  }

  // Guarantee the entry file exists.
  const entry =
    typeof plan.entryFile === "string" && seen.has(plan.entryFile.trim())
      ? plan.entryFile.trim()
      : ENTRY_FILE;
  if (!seen.has(entry) && files.length < MAX_PLAN_FILES) {
    seen.add(entry);
    files.push({
      path: entry,
      category: "entry",
      responsibility: "Root component composing the page sections.",
      dependsOn: [],
    });
  }

  // Rebuild batches from the model's batches, keeping only known paths and
  // preserving order, then append any files that were never batched. The entry
  // file is always pulled out and generated alone in the final batch.
  const ordered = [];
  const placed = new Set();
  const rawBatches = Array.isArray(plan.batches) ? plan.batches : [];
  for (const batch of rawBatches) {
    if (!Array.isArray(batch)) continue;
    for (const bp of batch) {
      const p = typeof bp === "string" ? bp.trim() : "";
      if (seen.has(p) && !placed.has(p) && p !== entry) {
        placed.add(p);
        ordered.push(p);
      }
    }
  }
  for (const f of files) {
    if (f.path !== entry && !placed.has(f.path)) {
      placed.add(f.path);
      ordered.push(f.path);
    }
  }

  const batches = [];
  for (let i = 0; i < ordered.length; i += MAX_BATCH) {
    batches.push(ordered.slice(i, i + MAX_BATCH));
  }
  batches.push([entry]);

  return {
    entryFile: entry,
    architectureSummary:
      typeof plan.architectureSummary === "string"
        ? plan.architectureSummary
        : "React + Mantine component architecture.",
    files,
    batches,
  };
}
