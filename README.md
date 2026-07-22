# 🛠️ AI Website Builder (Laguna M.1 + React + Mantine)

A Next.js app that turns a short prompt into a complete, multi-file React + Mantine
website. It deeply analyses the request, creates a distinct art direction and
content-rich section plan, streams the generated code live, writes real files to disk,
previews the result in the browser, validates it, and **survives interruptions** — a
dropped stream resumes exactly where it left off without regenerating finished files.

Uses the free **Poolside Laguna M.1** model via OpenRouter (override with
`OPENROUTER_MODEL`).

## 🔄 The pipeline

```
prompt → /api/enhance  → structured JSON spec (requirements, pages, features, design)
       → /api/plan     → validated file/folder manifest + generation batches
       → /api/generate → batched streaming generation (SSE)
                          • live token deltas + current file name
                          • incremental file parsing
                          • each finished file written to generated-workspace/current/
                          • per-file checkpoints for resume
                          • static validation at the end
       → preview        → live iframe (React/Mantine/Tabler from CDN + Babel)
```

Say “make the hero dark” afterwards and only the affected files are regenerated.

## 🎨 Design standard

New projects are deliberately planned as complete, modern experiences—not sparse
templates. The generator selects an art direction appropriate to the brief, builds
out meaningful proof/content sections, uses Mantine components and a generated
Mantine theme as its primary design system, and adds only client-side interactions
that improve the journey. Remote imagery is optional and never the sole visual layer,
so a failed image does not leave an empty card or hero.

Tailwind is not enabled in the live-preview runtime; generated projects use Mantine
props, theme tokens, CSS variables, and component style objects for custom polish.

## ⚡ Resume after interruption (core feature)

Every generation runs under a **session** persisted in
`generated-workspace/.sessions/<id>/` (metadata, transcript, completed files,
current partial file). If the stream drops (network, timeout, tab close, upstream
error):

- All completed files are kept (on disk + in the UI).
- The in-progress file is checkpointed as a partial.
- The client shows a **Resume** button and auto-retries with backoff (1s / 2s / 4s, max 3).
- Resume continues the interrupted file with **overlap de-duplication**, finishes the
  remaining files, and never regenerates completed ones. If exact continuation fails,
  only that one file is regenerated — never the whole project.

## 🚀 Setup

```bash
npm install
cp .env.example .env.local     # add your OpenRouter key (sk-or-...)
npm run dev                     # http://localhost:3000
```

Free key: https://openrouter.ai/keys

## 🧪 Try it

1. Prompt: *“Build a modern coffee shop website with hero, menu and contact form. Use brown and cream colors.”*
2. Watch files stream in and appear under `generated-workspace/current/`.
3. Refresh the page → saved files reload; an interrupted session offers Resume.
4. To test resume: kill the dev request mid-generation, then click **Resume**.

## 📁 Where things live

| Area | Files |
|------|-------|
| Client UI + preview | `app/page.js` |
| Requirement analysis | `app/api/enhance/route.js` |
| File plan | `app/api/plan/route.js` (+ `app/lib/project-plan-validator.js`) |
| Generation engine | `app/api/generate/route.js`, `app/api/generate/resume/route.js`, `app/lib/generate-core.js` |
| Workspace files | `app/api/workspace/route.js`, `app/lib/workspace.js` |
| Validation | `app/api/validate/route.js`, `app/lib/project-validator.js` |
| Streaming parser | `app/lib/file-stream-parser.js` |
| Resume helpers | `app/lib/continuation-merge.js`, `app/lib/session-store.js` |
| Path safety | `app/lib/file-path-validator.js` |
| OpenRouter transport | `app/lib/openrouter.js` (IPv4-forced `https`) |

## 🔒 Safety

Generated code is confined to `generated-workspace/current/`. Every path is validated
(no traversal, absolute paths, hidden/`.env`/`node_modules` files, or unsupported
extensions), only planned files are written, and builder source can never be touched.
The OpenRouter key stays server-side; client-supplied `system` messages are rejected.

## 🆓 Free tier note

The free model is slow (~30–60s per batch) and can rate-limit — the checkpoint/resume
system is what makes long generations reliable on it.

> Technical note: routes call OpenRouter with Node’s built-in `https` and `family: 4`
> (IPv4) because Node 20’s default `fetch` times out on IPv6 on some machines. See
> `app/lib/openrouter.js`.
