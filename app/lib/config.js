// Central configuration for the AI website builder.
//
// The model name always comes from OPENROUTER_MODEL when present, with the
// free Laguna model as the fallback so the app keeps working out of the box.

export function getModel() {
  return process.env.OPENROUTER_MODEL ?? "poolside/laguna-m.1:free";
}

// Hard limits shared across routes.
// Initial planning is prompted to stay at 20 files, while evolved projects may
// grow beyond that without forcing a destructive re-plan.
export const MAX_PLAN_FILES = 60;
export const MAX_FILE_BYTES = 256 * 1024; // 256 KB per generated file
export const MAX_WORKSPACE_FILES = 200;
