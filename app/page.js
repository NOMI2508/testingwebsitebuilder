"use client";

import { useState, useRef, useEffect } from "react";
import BuilderEditor from "./components/builder/BuilderEditor";

/* ============================================================
   Safe merge of streamed/completed files into the file list.
   Never replaces the whole list — only upserts by path.
   ============================================================ */
function mergeFiles(existingFiles, incomingFiles) {
  const map = new Map(existingFiles.map((file) => [file.path, file]));
  for (const file of incomingFiles) {
    const prev = map.get(file.path) || {};
    map.set(file.path, { ...prev, ...file });
  }
  return Array.from(map.values()).sort((a, b) => a.path.localeCompare(b.path));
}

function compactSpec(spec) {
  if (!spec) return "";
  const project = spec.project || {};
  const sections = (spec.pages || [])
    .flatMap((page) => page.sections || [])
    .map((section) => section.name)
    .filter(Boolean);
  return [
    project.name,
    project.summary,
    sections.length ? "Sections: " + sections.join(", ") : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/* ============================================================
   Preview bundler (unchanged, working): flatten every file into
   one module, strip imports/exports, resolve Mantine + Tabler from
   a global scope injected by the iframe host.
   ============================================================ */
function bundleFiles(files) {
  const packageBindings = new Map();
  // react-icons ships one module per icon pack, so each used pack
  // (react-icons/fa, /md, …) needs its own namespace import in the preview.
  const iconModules = new Map(); // "react-icons/fa" -> "__RI0"
  const importBrace = /import\s*\{([\s\S]*?)\}\s*from\s*['"]([^'"]+)['"]\s*;?/g;

  const bodyOf = (code) => {
    let m;
    importBrace.lastIndex = 0;
    while ((m = importBrace.exec(code))) {
      const source = m[2];
      const isPackage = ["@mantine/core", "@mantine/hooks", "@tabler/icons-react", "react"].includes(source);
      const isReactIcons = source.startsWith("react-icons/");
      if (!isPackage && !isReactIcons) continue;
      let ns;
      if (isReactIcons) {
        if (!iconModules.has(source)) iconModules.set(source, "__RI" + iconModules.size);
        ns = iconModules.get(source);
      }
      for (const item of m[1].split(",")) {
        const parts = item.trim().split(/\s+as\s+/);
        const imported = parts[0]?.trim();
        const local = (parts[1] || parts[0])?.trim();
        if (imported && local) packageBindings.set(local, { imported, source, ns });
      }
    }
    let out = code
      .replace(/import[\s\S]*?from\s*['"][^'"]+['"]\s*;?/g, "")
      .replace(/import\s+['"][^'"]+['"]\s*;?/g, "")
      .replace(/export\s+default\s+function/g, "function")
      .replace(/export\s+default\s+class/g, "class")
      .replace(/^\s*export\s+default\s+\w+\s*;?\s*$/gm, "")
      .replace(/export\s+const/g, "const")
      .replace(/export\s+function/g, "function")
      .replace(/export\s+let/g, "let")
      .replace(/export\s+var/g, "var")
      .replace(/export\s+class/g, "class")
      .replace(/export\s*\{[^}]*\}\s*;?/g, "");
    return out.trim();
  };

  const entry =
    files.find((f) => /(^|\/)App\.jsx?$/i.test(f.path)) || files[files.length - 1];
  const others = files.filter((f) => f !== entry);
  const ordered = [...others, entry].filter(Boolean);

  const bodies = ordered
    .map((f) => "/* ---- " + f.path + " ---- */\n" + bodyOf(f.content))
    .join("\n\n");

  const header = [...packageBindings]
    .map(([local, binding]) => {
      const namespace =
        binding.ns // react-icons pack namespace (e.g. __RI0)
          ? binding.ns
          : binding.source === "@tabler/icons-react"
            ? "__I"
            : binding.source === "@mantine/hooks"
              ? "__H"
              : binding.source === "react"
                ? "React"
                : "__M";
      return `const ${local} = ${namespace}.${binding.imported};\nif (!${local}) throw new Error("Package export ${binding.imported} was not found in ${binding.source}");`;
    })
    .join("\n");

  // Real ES namespace imports for each react-icons pack actually used. These are
  // hoisted module imports; the importmap resolves them from esm.sh.
  const iconImports = [...iconModules]
    .map(([source, ns]) => `import * as ${ns} from '${source}';`)
    .join("\n");

  return (iconImports ? iconImports + "\n" : "") + header + "\n" + bodies;
}

function buildPreviewDoc(bundledCode) {
  const code = bundledCode
    .split("\n")
    .filter((line) => {
      const t = line.trim();
      if (/^import\s+React\b/.test(t)) return false;
      if (/^import\s+ReactDOM\b/.test(t)) return false;
      if (/from\s+['"]react-dom['"]/.test(t)) return false;
      if (/createRoot\s*\(/.test(t)) return false;
      if (/ReactDOM\./.test(t)) return false;
      return true;
    })
    .join("\n");
  const safeCode = code.replace(/<\/script>/gi, "<\\/script>");

  const importMap = {
    imports: {
      react: "https://esm.sh/react@18.3.1",
      "react/jsx-runtime": "https://esm.sh/react@18.3.1/jsx-runtime",
      "react/jsx-dev-runtime": "https://esm.sh/react@18.3.1/jsx-dev-runtime",
      "react-dom": "https://esm.sh/react-dom@18.3.1?external=react",
      "react-dom/client": "https://esm.sh/react-dom@18.3.1/client?external=react",
      "@mantine/core": "https://esm.sh/@mantine/core@7.13.4?external=react,react-dom",
      "@mantine/hooks": "https://esm.sh/@mantine/hooks@7.13.4?external=react",
      "@tabler/icons-react": "https://esm.sh/@tabler/icons-react@3?external=react",
      // Prefix mapping: react-icons/fa -> https://esm.sh/*react-icons@5/fa. The
      // leading "*" externalizes react (and react-icons/lib), so every pack shares
      // the single React instance from this map instead of bundling its own.
      "react-icons/": "https://esm.sh/*react-icons@5/",
    },
  };

  // A minimal react-router-dom v6-compatible router for the sandboxed preview.
  // The iframe has no real History API (opaque origin), so navigation is kept in
  // memory. Generated code imports these names from "react-router-dom"; the bundler
  // strips that import and the names resolve to these host-provided module globals.
  // Written with NO regex/backslashes so it is safe inside this template literal.
  const routerShim = `
let __previewLoc = { pathname: '/', search: '', hash: '', state: null, key: 'default' };
const __routeListeners = new Set();
function __trimSlashes(s) { s = String(s == null ? '' : s); let a = 0, b = s.length; while (a < b && s.charAt(a) === '/') a++; while (b > a && s.charAt(b - 1) === '/') b--; return s.slice(a, b); }
function __parseTo(to) {
  if (to && typeof to === 'object') return { pathname: to.pathname || '/', search: to.search || '', hash: to.hash || '' };
  let s = String(to == null ? '/' : to); let hash = ''; let search = '';
  const h = s.indexOf('#'); if (h >= 0) { hash = s.slice(h); s = s.slice(0, h); }
  const q = s.indexOf('?'); if (q >= 0) { search = s.slice(q); s = s.slice(0, q); }
  if (!s) s = '/'; if (s.charAt(0) !== '/') s = '/' + s;
  return { pathname: s, search: search, hash: hash };
}
const __navigate = (to, opts) => {
  if (typeof to === 'number') return;
  const p = __parseTo(to);
  __previewLoc = { pathname: p.pathname, search: p.search || '', hash: p.hash || '', state: (opts && opts.state) || null, key: String(Date.now()) };
  __routeListeners.forEach((fn) => fn());
};
const __subscribeRoute = (cb) => { __routeListeners.add(cb); return () => { __routeListeners.delete(cb); }; };
const __getLoc = () => __previewLoc;
const useLocation = () => React.useSyncExternalStore(__subscribeRoute, __getLoc, __getLoc);
const useNavigate = () => __navigate;
const __RouteCtx = React.createContext({ params: {}, outlet: null });
const useParams = () => React.useContext(__RouteCtx).params;
const Outlet = () => React.useContext(__RouteCtx).outlet;
const useSearchParams = () => {
  useLocation();
  const sp = new URLSearchParams(__previewLoc.search || '');
  const setSp = (next) => { const n = next instanceof URLSearchParams ? next : new URLSearchParams(next || {}); const str = n.toString(); __navigate(__previewLoc.pathname + (str ? '?' + str : '')); };
  return [sp, setSp];
};
const Link = React.forwardRef((props, ref) => {
  const to = props.to == null ? '/' : props.to;
  const rest = Object.assign({}, props); delete rest.to; delete rest.replace; delete rest.state; delete rest.onClick; delete rest.children; delete rest.reloadDocument;
  const href = typeof to === 'string' ? to : (to && to.pathname) || '/';
  return React.createElement('a', Object.assign({}, rest, { ref: ref, href: href, onClick: (e) => {
    if (props.onClick) props.onClick(e);
    if (!e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) { e.preventDefault(); __navigate(to, { state: props.state, replace: props.replace }); }
  } }), props.children);
});
const NavLink = React.forwardRef((props, ref) => {
  useLocation();
  const to = props.to == null ? '/' : props.to;
  const target = __trimSlashes(__parseTo(to).pathname);
  const cur = __trimSlashes(__previewLoc.pathname || '/');
  const isActive = props.end ? cur === target : (target === '' || cur === target || cur.indexOf(target + '/') === 0);
  const rest = Object.assign({}, props); delete rest.className; delete rest.style; delete rest.children; delete rest.end;
  const cbArg = { isActive: isActive, isPending: false, isTransitioning: false };
  const className = typeof props.className === 'function' ? props.className(cbArg) : props.className;
  const style = typeof props.style === 'function' ? props.style(cbArg) : props.style;
  const kids = typeof props.children === 'function' ? props.children(cbArg) : props.children;
  return React.createElement(Link, Object.assign({}, rest, { ref: ref, to: to, className: className, style: style, 'aria-current': isActive ? 'page' : undefined }), kids);
});
function Navigate(props) { React.useEffect(() => { __navigate(props.to, { state: props.state, replace: props.replace }); }, []); return null; }
const BrowserRouter = (props) => props.children;
const HashRouter = (props) => props.children;
const MemoryRouter = (props) => props.children;
const Router = (props) => props.children;
function __segs(p) { const s = __trimSlashes(p); return s === '' ? [] : s.split('/'); }
function __buildRoutes(children) {
  const out = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const p = child.props || {};
    out.push({ path: p.path, index: !!p.index, element: p.element, caseSensitive: !!p.caseSensitive, children: p.children ? __buildRoutes(p.children) : [] });
  });
  return out;
}
function __rank(route) { if (route.index) return 1000; const pat = __segs(route.path || ''); let s = 0; for (let i = 0; i < pat.length; i++) { const seg = pat[i]; if (seg === '*') s -= 20; else if (seg.charAt(0) === ':') s += 4; else s += 10; } return s; }
function __matchBranch(routes, segs) {
  const ordered = routes.slice().sort((a, b) => __rank(b) - __rank(a));
  for (let r = 0; r < ordered.length; r++) {
    const route = ordered[r];
    if (route.index) { if (segs.length === 0) return [{ route: route, params: {} }]; continue; }
    const pat = __segs(route.path || '');
    const params = {}; let ok = true; let star = false; let used = pat.length;
    for (let i = 0; i < pat.length; i++) {
      const ps = pat[i];
      if (ps === '*') { params['*'] = segs.slice(i).join('/'); star = true; used = segs.length; break; }
      const seg = segs[i];
      if (seg === undefined) { ok = false; break; }
      if (ps.charAt(0) === ':') { params[ps.slice(1)] = decodeURIComponent(seg); }
      else if (route.caseSensitive ? ps === seg : ps.toLowerCase() === seg.toLowerCase()) {}
      else { ok = false; break; }
    }
    if (!ok) continue;
    const remaining = star ? [] : segs.slice(used);
    if (route.children && route.children.length) {
      const child = __matchBranch(route.children, remaining);
      if (child) return [{ route: route, params: params }].concat(child);
      if (remaining.length === 0) return [{ route: route, params: params }];
    } else if (remaining.length === 0) { return [{ route: route, params: params }]; }
  }
  return null;
}
function __renderRoutes(routes) {
  useLocation();
  const segs = __segs(__previewLoc.pathname);
  const branch = __matchBranch(routes, segs);
  if (!branch) return null;
  let acc = {}; const chain = [];
  for (let i = 0; i < branch.length; i++) { acc = Object.assign({}, acc, branch[i].params); chain.push({ route: branch[i].route, params: acc }); }
  let outlet = null;
  for (let i = chain.length - 1; i >= 0; i--) {
    const element = chain[i].route.element == null ? React.createElement(Outlet) : chain[i].route.element;
    outlet = React.createElement(__RouteCtx.Provider, { value: { params: chain[i].params, outlet: outlet } }, element);
  }
  return outlet;
}
function Routes(props) { return __renderRoutes(__buildRoutes(props.children)); }
const Route = () => null;
const useRoutes = (routes) => __renderRoutes(routes || []);
const useResolvedPath = (to) => __parseTo(to);
`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="stylesheet" href="https://esm.sh/@mantine/core@7.13.4/styles.css" />
<script type="importmap">${JSON.stringify(importMap)}</script>
<style>body{margin:0}</style>
</head>
<body>
<div id="root">Loading…</div>
<script type="text/plain" id="usercode">
${safeCode}
</script>
<script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7.25.6/babel.min.js"></script>
<script>
  var previewTimer = setTimeout(function () {
    showError("Preview dependencies did not load in time. Check the CDN connection and try again.");
  }, 15000);

  function report(msg) {
    try { window.parent.postMessage({ source: "preview", type: "error", message: String(msg) }, "*"); } catch (e) {}
  }
  function showError(msg) {
    clearTimeout(previewTimer);
    window.__previewFailed = true;
    var r = document.getElementById("root");
    if (r)
      r.innerHTML =
        '<pre style="color:#dc2626;padding:20px;white-space:pre-wrap;font-family:monospace;font-size:13px">⚠️ ' +
        String(msg) + "</pre>";
    report(msg);
  }
  window.__previewShowError = showError;
  window.addEventListener("error", function (e) {
    if (!e) return;
    showError(e.message && e.message !== "Script error." ? e.message : "Preview module failed to load.");
  });
  window.addEventListener("unhandledrejection", function (e) {
    showError((e.reason && e.reason.message) || e.reason);
  });
  try {
    var userCode = document.getElementById("usercode").textContent;
    var wrapped =
      "import * as __M from '@mantine/core';\\n" +
      "import * as __H from '@mantine/hooks';\\n" +
      "import * as __I from '@tabler/icons-react';\\n" +
      "import React from 'react';\\n" +
      "import { createRoot as __cr } from 'react-dom/client';\\n" +
      "Object.assign(window, __M, __I, React);\\n" +
      "const __MP = __M.MantineProvider;\\n" +
      "const __previewStorageMap = new Map();\\n" +
      "const __previewStorage = { getItem: (key) => __previewStorageMap.has(String(key)) ? __previewStorageMap.get(String(key)) : null, setItem: (key, value) => __previewStorageMap.set(String(key), String(value)), removeItem: (key) => __previewStorageMap.delete(String(key)), clear: () => __previewStorageMap.clear(), key: (index) => Array.from(__previewStorageMap.keys())[index] || null, get length() { return __previewStorageMap.size; } };\\n" +
      "const localStorage = __previewStorage;\\n" +
      "const sessionStorage = __previewStorage;\\n" +
      ${JSON.stringify(routerShim)} +
      "class __PreviewBoundary extends React.Component { constructor(props) { super(props); this.state = { error: null }; } static getDerivedStateFromError(error) { return { error }; } componentDidCatch(error) { window.__previewShowError(error && error.message ? error.message : error); } render() { return this.state.error ? null : this.props.children; } }\\n" +
      userCode + "\\n" +
      "const __previewTheme = typeof siteTheme !== 'undefined' && siteTheme ? siteTheme : undefined;\\n" +
      "__cr(document.getElementById('root')).render(" +
      "React.createElement(__PreviewBoundary, null, React.createElement(__MP, { defaultColorScheme: 'light', theme: __previewTheme }, React.createElement(App))));\\n" +
      "setTimeout(() => { if (!window.__previewFailed) { clearTimeout(previewTimer); window.parent.postMessage({ source: 'preview', type: 'ready' }, '*'); } }, 500);";
    var out = Babel.transform(wrapped, { presets: ["react"] }).code;
    // Run the compiled module as an INLINE <script type="module">, NOT a blob: URL.
    // This iframe is sandboxed with allow-scripts only (no allow-same-origin), so it
    // runs in an opaque origin where the browser BLOCKS blob:-URL module imports —
    // import(blobUrl) silently hangs and the preview stays stuck on "Loading…".
    // An inline module script executes in the document's own context and still
    // resolves bare specifiers (react, @mantine/core, …) via the importmap above.
    // Setting textContent (rather than HTML) means a literal closing-script tag
    // inside the user code cannot break out, so it is also safe. Uncaught errors
    // and failed specifier resolutions surface through the window "error" /
    // "unhandledrejection" handlers registered above.
    var moduleScript = document.createElement("script");
    moduleScript.type = "module";
    moduleScript.textContent = out;
    document.body.appendChild(moduleScript);
  } catch (err) {
    showError("Compile error: " + (err && err.message ? err.message : err));
  }
</script>
</body>
</html>`;
}

/* ============================================================
   SSE frame parsing on the client.
   ============================================================ */
function dispatchFrame(frame, onEvent) {
  const lines = frame.split("\n");
  let event = "message";
  const dataLines = [];
  for (const line of lines) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).replace(/^ /, ""));
  }
  if (!dataLines.length) return;
  const dataStr = dataLines.join("\n");
  let data;
  try {
    data = JSON.parse(dataStr);
  } catch {
    data = dataStr;
  }
  onEvent(event, data);
}

async function consumeStream(res, onEvent) {
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf("\n\n")) >= 0) {
      const frame = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      if (frame.trim()) dispatchFrame(frame, onEvent);
    }
  }
  // Any remainder is an incomplete frame (abrupt disconnect). Every complete
  // server frame is terminated with "\n\n", so we deliberately discard partials
  // rather than feed half-parsed JSON to the handlers.
}

/* Pick the files most likely affected by an edit instruction. */
function relevantFiles(text, files, plan) {
  const lower = text.toLowerCase();
  const tokens = lower.split(/[^a-z0-9]+/).filter((t) => t.length > 2);
  const picked = [];
  for (const f of files) {
    const base = f.path.split("/").pop().replace(/\.(jsx?|js)$/i, "");
    const words = base.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
    const hit = tokens.some((t) => words.includes(t) || f.path.toLowerCase().includes(t));
    if (hit) picked.push(f.path);
  }
  const existingPaths = new Set(files.map((file) => file.path));
  const newPlannedPaths = (plan?.files || [])
    .map((file) => file.path)
    .filter((path) => !existingPaths.has(path));
  let result = [...picked, ...newPlannedPaths];
  if (!result.length) {
    const cats = new Set(["entry", "section", "layout"]);
    const byPlan = (plan?.files || []).filter((f) => cats.has(f.category)).map((f) => f.path);
    result = byPlan.length ? byPlan : files.map((f) => f.path);
  }
  const entry = plan?.entryFile || "src/App.jsx";
  if (files.some((f) => f.path === entry) && !result.includes(entry)) result.push(entry);
  return Array.from(new Set(result));
}

const BUSY_STATUSES = new Set([
  "analyzing",
  "planning",
  "generating",
  "resuming",
  "saving",
  "repairing",
]);

/* ============================================================
   Main component
   ============================================================ */
export default function Home() {
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeProject, setActiveProject] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState([]); // [{ path, content, saved }]
  const [activeFile, setActiveFile] = useState("");
  const [doc, setDoc] = useState("");
  const [tab, setTab] = useState("preview"); // preview | files | stream

  const [projectSpec, setProjectSpec] = useState(null);
  const [projectPlan, setProjectPlan] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [buildStatus, setBuildStatus] = useState("idle");
  const [statusText, setStatusText] = useState("");
  const [progress, setProgress] = useState(null);
  const [streamingOutput, setStreamingOutput] = useState("");
  const [activeFilePath, setActiveFilePath] = useState(null);
  const [activePartialContent, setActivePartialContent] = useState("");
  const [generationSession, setGenerationSession] = useState(null);
  const [recoverableError, setRecoverableError] = useState(null);
  const [validation, setValidation] = useState(null);
  const [previewReady, setPreviewReady] = useState(false);
  const [repairAttempts, setRepairAttempts] = useState(0);
  const [error, setError] = useState("");
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [versions, setVersions] = useState([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [restoringId, setRestoringId] = useState(null);
  const [deploying, setDeploying] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderLaunching, setBuilderLaunching] = useState(false);

  // Refs to avoid stale state inside async stream loops / listeners. Any value
  // read from inside the long-lived generation/resume/repair async chain (which
  // is a closure from a single render) MUST come from a ref, not state.
  const filesRef = useRef([]);
  const rawRef = useRef("");
  const partialRef = useRef({ path: null, content: "" });
  const docRef = useRef("");
  const validationRef = useRef(null);
  const autoResumeRef = useRef(0);
  const autoTimerRef = useRef(null);
  const previewErrorHandlerRef = useRef(() => {});
  const lastRepairedErrorRef = useRef("");
  const buildScrollRef = useRef(null);
  const generationSessionRef = useRef(null);
  const recoverableErrorRef = useRef(null);
  const projectSpecRef = useRef(null);
  const projectPlanRef = useRef(null);
  const repairAttemptsRef = useRef(0);
  const workspaceReloadingRef = useRef(false);
  const activeProjectIdRef = useRef(null);
  const projectLoadRef = useRef(0);
  const lastPromptRef = useRef("");

  const busy = BUSY_STATUSES.has(buildStatus);

  function setActiveId(id) {
    activeProjectIdRef.current = id;
    setActiveProjectId(id);
    if (id) localStorage.setItem("activeProjectId", id);
    else localStorage.removeItem("activeProjectId");
  }

  function clearProjectView() {
    clearAutoTimer();
    setActiveProject(null);
    setMessages([]);
    applyFiles([]);
    setSpec(null);
    setPlan(null);
    setSession(null);
    setRecoverable(null);
    setDoc("");
    docRef.current = "";
    setActiveFile("");
    setQuestions([]);
    setValidation(null);
    setPreviewReady(false);
    validationRef.current = null;
    repairAttemptsRef.current = 0;
    setRepairAttempts(0);
    lastRepairedErrorRef.current = "";
    setProgress(null);
    setStreamingOutput("");
    setActivePartialContent("");
    setActiveFilePath(null);
    setBuildStatus("idle");
    setStatusText("");
    setError("");
  }

  function applyFiles(next) {
    filesRef.current = next;
    setFiles(next);
  }
  function setSession(id) {
    generationSessionRef.current = id;
    setGenerationSession(id);
  }
  function setRecoverable(v) {
    recoverableErrorRef.current = v;
    setRecoverableError(v);
  }
  function setSpec(s) {
    projectSpecRef.current = s;
    setProjectSpec(s);
  }
  function setPlan(p) {
    projectPlanRef.current = p;
    setProjectPlan(p);
  }
  function clearAutoTimer() {
    if (autoTimerRef.current) {
      clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }
  }

  function rebuildPreview(fileList) {
    const list = (fileList || filesRef.current).filter((f) => f && f.content);
    if (!list.length) return;
    try {
      setPreviewReady(false);
      const nextDoc = buildPreviewDoc(bundleFiles(list));
      docRef.current = nextDoc;
      setDoc(nextDoc);
    } catch (e) {
      // Keep the last working preview; surface the error only.
      setError("Preview build error: " + (e?.message || String(e)));
    }
  }

  async function reloadWorkspaceFiles() {
    const projectId = activeProjectIdRef.current;
    if (!projectId) return;
    if (workspaceReloadingRef.current) return;
    workspaceReloadingRef.current = true;
    try {
      const res = await fetch(`/api/projects/${projectId}/files`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.files) && data.files.length) {
        const loaded = data.files.map((f) => ({ ...f, saved: true }));
        applyFiles(loaded);
        rebuildPreview(loaded);
        setActiveFile((current) => current || loaded[0]?.path || "");
        setBuildStatus("ready");
      }
    } finally {
      workspaceReloadingRef.current = false;
    }
  }

  async function refreshProjects() {
    const res = await fetch("/api/projects");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not load projects.");
    setProjects(data.projects || []);
    return data.projects || [];
  }

  async function loadProject(projectId) {
    const requestId = ++projectLoadRef.current;
    clearProjectView();
    setActiveId(projectId);
    setBuildStatus("analyzing");
    setStatusText("Loading project…");
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load project.");
      if (requestId !== projectLoadRef.current || activeProjectIdRef.current !== projectId) return;
      setActiveProject(data.project);
      setSpec(data.spec);
      setPlan(data.plan);
      setMessages(data.chat || []);
      const loaded = (data.files || []).map((file) => ({ ...file, saved: true }));
      applyFiles(loaded);
      if (loaded.length) {
        setActiveFile(loaded[0].path);
        const validationResponse = await fetch("/api/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, plan: data.plan, files: loaded }),
        });
        const loadedValidation = await validationResponse.json();
        if (!validationResponse.ok) {
          throw new Error(loadedValidation.error || "Project validation could not run.");
        }
        validationRef.current = loadedValidation;
        setValidation(loadedValidation);
        // Always render the preview on load; if it genuinely fails at runtime the
        // preview-error listener will trigger a bounded repair. We do NOT auto-run
        // a repair just because static validation flagged something on open.
        rebuildPreview(loaded);
      }
      if (data.resumableSession && ["interrupted", "generating"].includes(data.resumableSession.status)) {
        setSession(data.resumableSession.sessionId);
        setRecoverable({ ...data.resumableSession, canResume: true });
        setBuildStatus("stream-interrupted");
        setStatusText("An interrupted generation can be resumed.");
      } else {
        setBuildStatus(loaded.length ? "ready" : "idle");
        setStatusText("");
      }
    } catch (error) {
      if (requestId === projectLoadRef.current) {
        setError(error?.message || String(error));
        setBuildStatus("failed");
      }
    }
  }

  function beginNewProject() {
    projectLoadRef.current += 1;
    clearProjectView();
    setActiveId(null);
  }

  useEffect(() => {
    if (buildStatus === "generating" && buildScrollRef.current) {
      buildScrollRef.current.scrollTop = buildScrollRef.current.scrollHeight;
    }
  }, [streamingOutput, activePartialContent, buildStatus]);

  /* ---- Load project list and the last selected project on mount ---- */
  useEffect(() => {
    (async () => {
      try {
        const list = await refreshProjects();
        const remembered = localStorage.getItem("activeProjectId");
        const selected = list.find((project) => project.id === remembered) || list[0];
        if (selected) await loadProject(selected.id);
      } catch {
        setError("Projects could not be loaded.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- Preview runtime error listener (autonomous auto-repair) ---- */
  previewErrorHandlerRef.current = (message) => {
    if (buildStatus !== "ready") return;
    if (!isRepairableError(message)) return;
    setPreviewReady(false);
    const runtimeValidation = {
      ok: false,
      errors: [{ file: filesForPreviewError(message, filesRef.current)[0] || "", message }],
    };
    validationRef.current = runtimeValidation;
    setValidation(runtimeValidation);
    if (!projectPlanRef.current) {
      reloadWorkspaceFiles();
      return;
    }
    // autoFix locates the responsible file(s) itself (statically, or via AI
    // diagnosis over the whole codebase) and repairs them. Loop guards live
    // inside autoFix so a single error is never chased forever.
    autoFix(message);
  };

  useEffect(() => {
    function onMsg(e) {
      const d = e.data;
      if (d && d.source === "preview" && d.type === "error") {
        previewErrorHandlerRef.current(d.message);
      } else if (d && d.source === "preview" && d.type === "ready") {
        setPreviewReady(true);
        // A clean render closes the current error episode: give any future,
        // unrelated error a fresh repair budget instead of inheriting a spent one.
        repairAttemptsRef.current = 0;
        setRepairAttempts(0);
      }
    }
    window.addEventListener("message", onMsg);
    return () => {
      window.removeEventListener("message", onMsg);
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, []);

  /* ------------------------- network steps ------------------------- */

  async function classifyIntent(prompt) {
    const res = await fetch("/api/projects/classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, activeProject, projects }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not classify the request.");
    return data.classification;
  }

  async function analyze(prompt, existingSpec, projectId) {
    const res = await fetch("/api/enhance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, existingSpec, projectId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Requirement analysis failed.");
    return data.spec;
  }

  async function makePlan(spec, projectId, existingPlan) {
    const res = await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spec, projectId, existingPlan }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Planning failed.");
    return data.plan;
  }

  async function createNewProject(spec, fallbackName) {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: spec.project?.name || fallbackName || "Untitled Website",
        type: spec.project?.type || "custom",
        description: spec.project?.summary || "",
        spec,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not create project.");
    setProjects((current) => [data.project, ...current]);
    setActiveId(data.project.id);
    setActiveProject(data.project);
    return data.project;
  }

  async function appendChat(projectId, role, content, relatedFiles) {
    const res = await fetch(`/api/projects/${projectId}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, content, relatedFiles }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not save chat.");
    return data.messages?.[0];
  }

  async function answerQuestion(question) {
    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: activeProjectIdRef.current, question }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not answer the question.");
    setMessages((current) => [
      ...current,
      { role: "user", content: question },
      { role: "assistant", content: data.answer },
    ]);
  }

  function handleStreamEvent(event, data) {
    if (data?.projectId && data.projectId !== activeProjectIdRef.current) return;
    switch (event) {
      case "session":
        setSession(data.sessionId);
        break;
      case "delta":
        rawRef.current += data.text || "";
        setStreamingOutput(rawRef.current);
        break;
      case "file-start":
        partialRef.current = { path: data.path, content: "" };
        setActiveFilePath(data.path);
        setActivePartialContent("");
        setActiveFile(data.path);
        break;
      case "file-delta":
        if (partialRef.current.path !== data.path) {
          partialRef.current = { path: data.path, content: "" };
        }
        partialRef.current.content += data.text || "";
        setActivePartialContent(partialRef.current.content);
        break;
      case "file-complete": {
        const next = mergeFiles(filesRef.current, [
          { path: data.path, content: data.content, saved: true },
        ]);
        applyFiles(next);
        partialRef.current = { path: null, content: "" };
        setActivePartialContent("");
        setActiveFilePath(null);
        break;
      }
      case "progress":
        setProgress(data);
        break;
      case "validation":
        validationRef.current = data;
        setValidation(data);
        break;
      case "rejected-path":
        // A path outside the plan was refused server-side; ignore in UI.
        break;
      case "recoverable-error":
        setRecoverable(data);
        break;
      case "done":
        if (data.validation) {
          validationRef.current = data.validation;
          setValidation(data.validation);
        }
        break;
      default:
        break;
    }
  }

  // Returns "done" | "interrupted".
  async function streamGenerate(payload) {
    const res = await fetch(payload.mode === "resume" ? "/api/generate/resume" : "/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok || !res.body) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || "Generation request failed.");
    }
    let outcome = "interrupted";
    await consumeStream(res, (event, data) => {
      handleStreamEvent(event, data);
      if (event === "done") outcome = "done";
      if (event === "recoverable-error") outcome = "interrupted";
    });
    return outcome;
  }

  /* ------------------------- orchestration ------------------------- */

  async function startGeneration(mode, opts) {
    const projectId = opts.projectId || activeProjectIdRef.current;
    if (!projectId) throw new Error("Select or create a project first.");
    setProjects((current) => current.map((project) =>
      project.id === projectId ? { ...project, previewStatus: "generating" } : project
    ));
    clearAutoTimer();
    autoResumeRef.current = 0;
    setRecoverable(null);
    setBuildStatus(mode === "repair" ? "repairing" : "generating");
    setTab("stream");
    rawRef.current = "";
    setStreamingOutput("");
    setProgress(null);

    const currentFiles =
      mode === "edit" || mode === "repair"
        ? Object.fromEntries(filesRef.current.map((f) => [f.path, f.content]))
        : undefined;

    try {
      const outcome = await streamGenerate({
        projectId,
        mode,
        prompt: opts.prompt ?? lastPromptRef.current,
        spec: opts.spec,
        plan: opts.plan,
        requestedPaths: opts.requestedPaths || [],
        currentFiles,
        messages: opts.messages || [],
      });
      if (activeProjectIdRef.current !== projectId) {
        await refreshProjects();
        return;
      }
      if (outcome === "interrupted") {
        setBuildStatus("stream-interrupted");
        scheduleAutoResume();
      } else {
        finishGeneration();
      }
    } catch (e) {
      // Network drop / server crash mid-stream: still resumable if we have a session.
      const sid = generationSessionRef.current;
      if (sid) {
        if (!recoverableErrorRef.current) {
          setRecoverable({ message: e?.message || "Connection lost.", sessionId: sid, canResume: true });
        }
        setBuildStatus("stream-interrupted");
        scheduleAutoResume();
      } else {
        setError(e?.message || String(e));
        setBuildStatus("failed");
      }
    }
  }

  async function runResume(isAuto) {
    clearAutoTimer();
    const sid = recoverableErrorRef.current?.sessionId || generationSessionRef.current;
    if (!sid) return;
    setBuildStatus("resuming");
    setStatusText("Resuming interrupted generation…");
    setTab("stream");
    try {
      const outcome = await streamGenerate({
        mode: "resume",
        projectId: activeProjectIdRef.current,
        sessionId: sid,
      });
      if (outcome === "interrupted") {
        setBuildStatus("stream-interrupted");
        if (isAuto) scheduleAutoResume();
      } else {
        autoResumeRef.current = 0;
        finishGeneration();
      }
    } catch (e) {
      setRecoverable({ message: e?.message || "Connection lost.", sessionId: sid, canResume: true });
      setBuildStatus("stream-interrupted");
      if (isAuto) scheduleAutoResume();
    }
  }

  function scheduleAutoResume() {
    const attempt = autoResumeRef.current;
    if (attempt >= 3) {
      setStatusText("Automatic resume attempts used. Click Resume to continue.");
      return;
    }
    autoResumeRef.current = attempt + 1;
    const delay = 1000 * Math.pow(2, attempt); // 1s, 2s, 4s
    setStatusText(`Auto-resume in ${Math.round(delay / 1000)}s (attempt ${attempt + 1}/3)…`);
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    autoTimerRef.current = setTimeout(() => runResume(true), delay);
  }

  function finishGeneration() {
    setBuildStatus("ready");
    setStatusText("");
    setRecoverable(null);
    setActiveFilePath(null);
    setActivePartialContent("");
    // Always render the preview from the completed files — the iframe runtime is
    // the real test. Static-validation issues additionally kick off a bounded
    // repair, but they must NEVER blank the preview.
    rebuildPreview(filesRef.current);
    setTab("preview");
    if (validationRef.current && !validationRef.current.ok) {
      maybeRepairFromValidation();
    }
    refreshProjects().catch(() => {});
  }

  function maybeRepairFromValidation() {
    const v = validationRef.current;
    if (!v || v.ok) return;
    if (repairAttemptsRef.current >= 3) return;
    const failing = Array.from(
      new Set((v.errors || []).map((e) => e.file).filter(Boolean))
    );
    const summary = (v.errors || [])
      .map((e) => `- ${e.file || "(project)"}: ${e.message}`)
      .join("\n");
    startRepair(failing, summary);
  }

  async function startRepair(failingFiles, errorSummary) {
    const plan = projectPlanRef.current;
    if (repairAttemptsRef.current >= 3 || !plan) return;
    repairAttemptsRef.current += 1;
    setRepairAttempts(repairAttemptsRef.current);
    const requestedPaths = failingFiles.length
      ? failingFiles
      : filesRef.current.map((f) => f.path);
    const messages = [
      {
        role: "user",
        content: `Fix the following problem in the project. You have the current code for the affected files as context. Diagnose the root cause, correct it, and return ONLY the corrected files using the ===FILE:path=== / ===END_FILE=== markers. Do not ask questions; do not redesign unrelated parts:\n\n${errorSummary}`,
      },
    ];
    await startGeneration("repair", {
      spec: projectSpecRef.current,
      plan,
      requestedPaths,
      messages,
    });
  }

  // Autonomous debugging entry point. Used by BOTH the live preview-error
  // listener and typed "fix this" requests. It locates the responsible file(s)
  // itself — a fast static match when the error names an identifier, otherwise an
  // AI diagnosis pass over the WHOLE codebase — then runs a scoped repair. It
  // never asks the user which file the error is in.
  // Reset the UI out of any busy state without leaving it soft-locked.
  function endRepairIdle() {
    setBuildStatus(filesRef.current.length ? "ready" : "idle");
    setStatusText("");
  }

  async function autoFix(rawError, { fromUser = false } = {}) {
    const projectId = activeProjectIdRef.current;
    const message = String(rawError || "").trim();
    if (!projectId || !message) return;

    // Without a saved file plan a scoped repair cannot run. Never leave the UI
    // stuck on a busy status — reset it and tell the user how to recover.
    if (!projectPlanRef.current) {
      endRepairIdle();
      if (fromUser) {
        setError("This project has no saved file plan yet, so it can't be auto-repaired. Regenerate it and try again.");
      }
      return;
    }

    // Loop guards: never chase the same error twice, cap attempts. Explicit user
    // requests bypass these (a person can always ask again), and reset the count.
    if (fromUser) {
      repairAttemptsRef.current = 0;
      setRepairAttempts(0);
      lastRepairedErrorRef.current = "";
    } else {
      if (lastRepairedErrorRef.current === message) return;
      if (repairAttemptsRef.current >= 3) return;
      lastRepairedErrorRef.current = message;
    }

    setBuildStatus("repairing");
    setStatusText("Finding the cause of the error…");

    // Fast path: the error names an identifier we can locate statically.
    let files = filesForPreviewError(message, filesRef.current);
    let brief = `Error: ${message}`;

    if (!files.length) {
      // Autonomous AI diagnosis across the whole project.
      try {
        const res = await fetch("/api/repair/diagnose", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, error: message }),
        });
        const data = await res.json();
        // Only accept a CONFIDENT diagnosis (specific file[s], not the whole-
        // project fallback). A blind all-files repair would regenerate and
        // overwrite working code, so we never do that automatically.
        if (res.ok && Array.isArray(data.files) && data.files.length && !data.usedFallback) {
          files = data.files;
          const parts = [`Error: ${message}`];
          if (data.rootCause) parts.push(`Root cause: ${data.rootCause}`);
          if (data.fix) parts.push(`Fix to apply: ${data.fix}`);
          brief = parts.join("\n");
        }
      } catch {
        // Ignore; handled by the "could not locate" guard below.
      }
    }

    if (!files.length) {
      // Could not confidently pinpoint the fault. Do NOT regenerate the whole
      // project (that would clobber working files). Recover cleanly instead.
      endRepairIdle();
      if (fromUser) {
        setError("I couldn't automatically pinpoint the cause. Tell me what you see on screen (or which section) and I'll fix it.");
      }
      return;
    }

    await startRepair(files, brief);
  }

  async function submit() {
    if (!input.trim() || busy) return;
    clearAutoTimer();
    const userText = input.trim();
    lastPromptRef.current = userText;
    setInput("");
    setError("");
    setQuestions([]);
    setValidation(null);
    validationRef.current = null;
    repairAttemptsRef.current = 0;
    setRepairAttempts(0);
    lastRepairedErrorRef.current = "";

    try {
      setBuildStatus("analyzing");
      setStatusText("Understanding your request…");
      const intent = await classifyIntent(userText);

      if (intent.action === "question_only") {
        setStatusText("Preparing an answer…");
        await answerQuestion(userText);
        setBuildStatus(filesRef.current.length ? "ready" : "idle");
        setStatusText("");
        return;
      }

      if (intent.action === "switch_project" && intent.targetProjectId) {
        await loadProject(intent.targetProjectId);
        return;
      }

      // Bug/error reports are fixed autonomously — the builder has all the code
      // and must locate the fault itself. These NEVER go to requirement analysis
      // (which, knowing nothing about the code, would ask the user where the
      // error is). The heuristic is a safety net for a misclassified report.
      const isFixRequest =
        intent.action === "fix_error" ||
        (intent.action !== "create_project" && looksLikeFixRequest(userText));
      if (isFixRequest && activeProjectIdRef.current) {
        const savedUser = await appendChat(activeProjectIdRef.current, "user", userText);
        setMessages((current) => [...current, savedUser || { role: "user", content: userText }]);
        await autoFix(userText, { fromUser: true });
        return;
      }
      // A fix request with no project selected: don't ship an error message into
      // requirement analysis — ask the user to pick the project to fix.
      if (isFixRequest && !activeProjectIdRef.current) {
        setMessages((current) => [...current, { role: "user", content: userText }]);
        setQuestions(["Select the project you want me to fix first."]);
        setBuildStatus("waiting-for-clarification");
        setStatusText("");
        return;
      }

      if (intent.action === "needs_clarification") {
        setMessages((current) => [...current, { role: "user", content: userText }]);
        setQuestions([intent.clarifyingQuestion || "Should this be a new project or an edit to the selected project?"]);
        setBuildStatus(activeProjectIdRef.current ? "ready" : "waiting-for-clarification");
        setStatusText("");
        return;
      }

      const creating = intent.action === "create_project" || !activeProjectIdRef.current;
      if (!creating && !activeProjectIdRef.current) {
        setQuestions(["Select a project first, or ask to create a new one."]);
        setBuildStatus("waiting-for-clarification");
        return;
      }

      setStatusText(creating ? "Analyzing new project requirements…" : `Editing ${activeProject?.name || "project"}…`);
      const spec = await analyze(
        userText,
        creating ? null : projectSpecRef.current,
        creating ? null : activeProjectIdRef.current
      );
      setSpec(spec);

      if (spec.status === "needs_clarification") {
        setQuestions(spec.clarifyingQuestions || []);
        setMessages((current) => [...current, { role: "user", content: userText }]);
        setBuildStatus(creating ? "waiting-for-clarification" : "ready");
        setStatusText("");
        return;
      }

      if (creating) {
        setBuildStatus("planning");
        setStatusText("Creating the project workspace…");
        const project = await createNewProject(spec, intent.suggestedName);
        const savedUser = await appendChat(project.id, "user", userText);
        setMessages([savedUser || { role: "user", content: userText }]);
        setBuildStatus("planning");
        setStatusText("Planning the file architecture…");
        const plan = await makePlan(spec, project.id, null);
        setPlan(plan);
        await startGeneration("initial", { projectId: project.id, spec, plan });
      } else {
        const projectId = activeProjectIdRef.current;
        const savedUser = await appendChat(projectId, "user", userText);
        setMessages((current) => [...current, savedUser || { role: "user", content: userText }]);
        let plan = projectPlanRef.current;
        if (requiresPlanEvolution(userText) || !plan) {
          setBuildStatus("planning");
          setStatusText("Updating the project architecture…");
          plan = await makePlan(spec, projectId, plan);
          setPlan(plan);
        }
        const requestedPaths = relevantFiles(userText, filesRef.current, plan);
        await startGeneration("edit", {
          projectId,
          spec,
          plan,
          requestedPaths,
          messages: [{ role: "user", content: userText }],
        });
      }
    } catch (e) {
      setError(e?.message || String(e));
      setBuildStatus("failed");
      setStatusText("");
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  async function renameActiveProject() {
    if (!activeProjectIdRef.current || !activeProject) return;
    const name = window.prompt("Project name", activeProject.name);
    if (!name?.trim() || name.trim() === activeProject.name) return;
    try {
      const res = await fetch(`/api/projects/${activeProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rename failed.");
      setActiveProject(data.project);
      setProjects((current) => current.map((project) => project.id === data.project.id ? data.project : project));
    } catch (error) {
      setError(error?.message || String(error));
    }
  }

  async function confirmDeleteProject() {
    if (!activeProject || deletingProject) return;
    setDeletingProject(true);
    try {
      const res = await fetch(`/api/projects/${activeProject.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmName: activeProject.name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed.");
      const remaining = projects.filter((project) => project.id !== activeProject.id);
      setProjects(remaining);
      setDeleteDialogOpen(false);
      if (remaining[0]) await loadProject(remaining[0].id);
      else beginNewProject();
    } catch (error) {
      setError(error?.message || String(error));
    } finally {
      setDeletingProject(false);
    }
  }

  async function openVersions() {
    const projectId = activeProjectIdRef.current;
    if (!projectId) return;
    setVersionsOpen(true);
    setVersionsLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/versions`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load versions.");
      setVersions(data.versions || []);
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setVersionsLoading(false);
    }
  }

  async function restoreVersion(versionId) {
    const projectId = activeProjectIdRef.current;
    if (!projectId || restoringId) return;
    setRestoringId(versionId);
    try {
      const res = await fetch(`/api/projects/${projectId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true, versionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Restore failed.");
      setVersionsOpen(false);
      await loadProject(projectId); // reload files + preview from the restored state
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setRestoringId(null);
    }
  }

  async function deployProject() {
    const projectId = activeProjectIdRef.current;
    if (!projectId || deploying) return;
    if (!docRef.current) {
      setError("Preview build ready nahi — deploy karne se pehle project ka valid preview banna chahiye.");
      return;
    }
    setDeploying(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          html: docRef.current,
          versionId: activeProject?.lastWorkingVersionId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deploy failed.");
      setActiveProject((current) =>
        current ? { ...current, deploymentUrl: data.deploymentUrl, deployedAt: data.deployedAt } : current
      );
      setProjects((current) =>
        current.map((p) =>
          p.id === projectId ? { ...p, deploymentUrl: data.deploymentUrl, deployedAt: data.deployedAt } : p
        )
      );
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setDeploying(false);
    }
  }

  // Open the visual drag-and-drop editor. Both build paths share one project:
  // the AI chat on the left, and this manual editor. With no active project a
  // blank one is created first so the builder has somewhere to save.
  async function openBuilder() {
    if (builderLaunching) return;
    try {
      setError("");
      if (!activeProjectIdRef.current) {
        setBuilderLaunching(true);
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Untitled Website",
            type: "visual",
            description: "Built with the visual drag-and-drop editor.",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not create the project.");
        setProjects((current) => [data.project, ...current]);
        setActiveId(data.project.id);
        setActiveProject(data.project);
      }
      setBuilderOpen(true);
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setBuilderLaunching(false);
    }
  }

  function copyDeploymentUrl() {
    if (!activeProject?.deploymentUrl) return;
    const full = window.location.origin + activeProject.deploymentUrl;
    navigator.clipboard?.writeText(full).catch(() => {});
  }

  async function downloadZip() {
    try {
      const JSZip = (await import(/* webpackIgnore: true */ "https://esm.sh/jszip@3.10.1")).default;
      const zip = new JSZip();
      filesRef.current.forEach((f) => zip.file(f.path, f.content));
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "website-project.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError("ZIP download failed: " + String(e));
    }
  }

  const active = files.find((f) => f.path === activeFile);
  const totalBatches = progress?.totalBatches ?? 0;
  const completedFiles = progress?.completedFiles ?? 0;
  const totalFiles = progress?.totalFiles ?? 0;
  const pct = totalFiles ? Math.round((completedFiles / totalFiles) * 100) : 0;

  return (
    <main style={{ display: "flex", height: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <aside
        style={{
          width: 238,
          minWidth: 238,
          display: "flex",
          flexDirection: "column",
          background: "#08111f",
          color: "white",
          borderRight: "1px solid #1e293b",
        }}
      >
        <div style={{ padding: 14, borderBottom: "1px solid #1e293b" }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Projects</div>
          <button onClick={beginNewProject} style={newProjectBtnStyle}>
            + New Project
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
          {projects.map((project) => {
            const selected = project.id === activeProjectId;
            return (
              <button
                key={project.id}
                onClick={() => loadProject(project.id)}
                style={projectItemStyle(selected)}
              >
                <span style={{ display: "block", fontWeight: 650, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {project.name}
                </span>
                <span style={{ display: "flex", justifyContent: "space-between", gap: 6, marginTop: 4, fontSize: 10.5, opacity: 0.68 }}>
                  <span>{project.type}</span>
                  <span>{project.previewStatus === "generating" ? "Generating" : formatProjectTime(project.updatedAt)}</span>
                </span>
              </button>
            );
          })}
          {!projects.length && (
            <div style={{ padding: 10, color: "#94a3b8", fontSize: 12, lineHeight: 1.5 }}>
              Your generated websites will appear here.
            </div>
          )}
        </div>
        {activeProject && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, padding: 10, borderTop: "1px solid #1e293b" }}>
            <button onClick={openVersions} style={projectActionStyle}>🕘 Versions</button>
            <button onClick={renameActiveProject} style={projectActionStyle}>Rename</button>
            <button onClick={() => setDeleteDialogOpen(true)} style={{ ...projectActionStyle, gridColumn: "1 / -1", color: "#fca5a5" }}>Delete</button>
          </div>
        )}
      </aside>
      {/* LEFT: prompt panel */}
      <div
        style={{
          width: 380,
          minWidth: 380,
          borderRight: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          background: "#0f172a",
          color: "white",
        }}
      >
        <div style={{ padding: "16px 18px", borderBottom: "1px solid #1e293b" }}>
          <h1 style={{ margin: 0, fontSize: 17 }}>🛠️ AI Website Builder</h1>
          <p style={{ margin: "3px 0 0", fontSize: 11, opacity: 0.6 }}>
            {activeProject ? `${activeProject.name} · ${activeProject.type}` : "New project · describe what you want to build"}
          </p>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
          {messages.length === 0 && (
            <p style={{ fontSize: 13, opacity: 0.55, lineHeight: 1.6 }}>
              Describe your website, e.g.
              <br />
              <em>&quot;A modern coffee shop site with hero, menu and contact form. Brown &amp; cream colors.&quot;</em>
              <br />
              <br />
              After it builds, ask for changes: <em>&quot;make the hero dark&quot;</em>.
            </p>
          )}

          {messages
            .filter((m) => m.role === "user" || m.role === "assistant")
            .map((m, i) => (
              <div key={m.id || i} style={messageBubbleStyle(m.role)}>
                {m.content}
              </div>
            ))}

          {projectSpec && (
            <div style={cardStyle("#0b2a3a", "#164e63")}>
              <div style={{ fontWeight: 700, marginBottom: 4, color: "#7dd3fc" }}>📋 Project spec</div>
              <div style={{ whiteSpace: "pre-wrap" }}>{compactSpec(projectSpec)}</div>
              {projectSpec.assumptions?.length > 0 && (
                <div style={{ marginTop: 6, opacity: 0.85 }}>
                  <strong>Assumptions:</strong> {projectSpec.assumptions.slice(0, 3).join("; ")}
                </div>
              )}
            </div>
          )}

          {projectPlan && (
            <div style={cardStyle("#132014", "#166534")}>
              <div style={{ fontWeight: 700, marginBottom: 4, color: "#86efac" }}>🗂️ File plan</div>
              {projectPlan.files?.length || 0} files · entry {projectPlan.entryFile || "src/App.jsx"}
            </div>
          )}

          {questions.length > 0 && (
            <div style={cardStyle("#2a1f0b", "#92400e")}>
              <div style={{ fontWeight: 700, marginBottom: 4, color: "#fde68a" }}>Please clarify:</div>
              {questions.map((q, i) => (
                <div key={i} style={{ color: "#fde68a" }}>
                  • {q}
                </div>
              ))}
            </div>
          )}

          {busy && statusText && (
            <div style={{ fontSize: 13, opacity: 0.9, marginTop: 8 }}>⏳ {statusText}</div>
          )}

          {progress && buildStatus !== "ready" && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>
                {completedFiles}/{totalFiles} files
                {totalBatches ? ` · batch ${(progress.batchIndex ?? 0) + 1}/${totalBatches}` : ""}
              </div>
              <div style={{ height: 6, background: "#1e293b", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: "#22c55e", transition: "width .2s" }} />
              </div>
              {activeFilePath && (
                <div style={{ fontSize: 11.5, opacity: 0.7, marginTop: 5, fontFamily: "ui-monospace, monospace" }}>
                  ✍️ {activeFilePath}
                </div>
              )}
            </div>
          )}

          {recoverableError && buildStatus !== "resuming" && (
            <div style={cardStyle("#2a0b0b", "#991b1b")}>
              <div style={{ fontWeight: 700, marginBottom: 4, color: "#fca5a5" }}>
                ⚠️ Generation interrupted
              </div>
              <div style={{ color: "#fecaca" }}>{recoverableError.message}</div>
              {recoverableError.currentFilePath && (
                <div style={{ marginTop: 4, fontSize: 11.5, fontFamily: "ui-monospace, monospace", opacity: 0.8 }}>
                  Current file: {recoverableError.currentFilePath}
                </div>
              )}
              <div style={{ marginTop: 4, fontSize: 11.5, opacity: 0.8 }}>
                {files.length} file(s) are safe.
              </div>
              <button onClick={() => runResume(false)} style={resumeBtnStyle}>
                ↻ Resume generation
              </button>
            </div>
          )}

          {validation && (
            <div style={cardStyle(validation.ok && previewReady ? "#0b2a14" : "#2a1f0b", validation.ok && previewReady ? "#166534" : "#92400e")}>
              <div style={{ fontWeight: 700, color: validation.ok && previewReady ? "#86efac" : "#fde68a" }}>
                {validation.ok && previewReady
                  ? "✅ Validation passed"
                  : validation.ok
                    ? "Checking preview runtime…"
                    : `⚠️ Validation: ${validation.errors?.length || 0} issue(s)`}
              </div>
              {!validation.ok && validationIssuesByFile(validation.errors).length > 0 && (
                <div style={{ marginTop: 8, maxHeight: 190, overflowY: "auto" }}>
                  <div style={{ color: "#fde68a", fontSize: 11, fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase", marginBottom: 5 }}>
                    Issues by file
                  </div>
                  {validationIssuesByFile(validation.errors).map(([filePath, issues]) => (
                    <div key={filePath} style={{ marginTop: 7 }}>
                      {filePath === "Project-wide" ? (
                        <div style={{ color: "#e2e8f0", fontSize: 11.5, fontWeight: 700 }}>
                          {filePath}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveFile(filePath);
                            setTab("files");
                          }}
                          title={`Open ${filePath} in Files`}
                          style={validationFileButtonStyle}
                        >
                          {filePath}
                        </button>
                      )}
                      <ul style={{ margin: "3px 0 0", paddingLeft: 17, color: "#fef3c7" }}>
                        {issues.map((message, index) => (
                          <li key={`${filePath}-${index}`} style={{ marginBottom: 2 }}>
                            {message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
              {!validation.ok && repairAttempts > 0 && (
                <div style={{ fontSize: 11.5, opacity: 0.85, marginTop: 3 }}>
                  Repair attempts: {repairAttempts}/3
                </div>
              )}
            </div>
          )}

          {activeProject?.deploymentUrl && (
            <div style={cardStyle("#0b1f2a", "#155e75")}>
              <div style={{ fontWeight: 700, color: "#7dd3fc", marginBottom: 4 }}>🚀 Deployed</div>
              <a
                href={activeProject.deploymentUrl}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#7dd3fc", wordBreak: "break-all", textDecoration: "underline" }}
              >
                {activeProject.deploymentUrl}
              </a>
              <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
                <button onClick={copyDeploymentUrl} style={{ ...projectActionStyle, padding: "4px 8px", fontSize: 11.5 }}>
                  Copy URL
                </button>
                {activeProject.deployedAt && (
                  <span style={{ opacity: 0.7, fontSize: 11 }}>
                    {formatProjectTime(activeProject.deployedAt)} ago
                  </span>
                )}
              </div>
            </div>
          )}

          {error && (
            <div style={{ color: "#fca5a5", fontSize: 12, marginTop: 8 }}>{error}</div>
          )}
        </div>

        <div style={{ padding: 14, borderTop: "1px solid #1e293b" }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={3}
            placeholder="Describe your website or a change… (Enter to send)"
            style={{
              width: "100%",
              boxSizing: "border-box",
              resize: "none",
              padding: 10,
              fontSize: 14,
              borderRadius: 8,
              border: "1px solid #334155",
              background: "#0b1220",
              color: "white",
              fontFamily: "inherit",
            }}
          />
          <button
            onClick={submit}
            disabled={busy || !input.trim()}
            style={{
              width: "100%",
              marginTop: 8,
              padding: "11px",
              fontSize: 15,
              fontWeight: 600,
              color: "white",
              background: busy || !input.trim() ? "#475569" : "#2563eb",
              border: "none",
              borderRadius: 8,
              cursor: busy || !input.trim() ? "default" : "pointer",
            }}
          >
            {busy ? "Working…" : activeProject ? "Update project" : "Create project"}
          </button>
        </div>
      </div>

      {/* RIGHT: preview / files / stream */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 16px",
            borderBottom: "1px solid #e2e8f0",
            background: "#f8fafc",
            fontSize: 13,
          }}
        >
          <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button onClick={() => setTab("preview")} style={tabStyle(tab === "preview")}>
              🔴 Preview
            </button>
            <button onClick={() => setTab("files")} style={tabStyle(tab === "files")}>
              📁 Files ({files.length})
            </button>
            <button onClick={() => setTab("stream")} style={tabStyle(tab === "stream")}>
              📡 Stream
            </button>
            {busy && <span style={{ color: "#64748b", marginLeft: 6 }}>● live</span>}
          </span>

          <span style={{ display: "flex", gap: 6 }}>
            <button
              onClick={openBuilder}
              disabled={builderLaunching}
              title="Open the drag-and-drop visual editor"
              style={{ ...btnStyle, background: "#7c3aed", border: "1px solid #7c3aed", color: "white", fontWeight: 600, opacity: builderLaunching ? 0.6 : 1 }}
            >
              {builderLaunching ? "Opening…" : "🎨 Visual Editor"}
            </button>
            {files.length > 0 && (
              <>
                <button
                  onClick={deployProject}
                  disabled={deploying || !previewReady}
                  title={previewReady ? "Deploy the current working build" : "Preview must be working before deploy"}
                  style={{ ...btnStyle, opacity: deploying || !previewReady ? 0.55 : 1 }}
                >
                  {deploying ? "Deploying…" : "🚀 Deploy"}
                </button>
                <button onClick={downloadZip} style={btnStyle}>
                  ⬇️ Download (.zip)
                </button>
              </>
            )}
          </span>
        </div>

        <div style={{ flex: 1, background: "#fff", minHeight: 0 }}>
          {tab === "stream" ? (
            <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
              {activeFilePath && (
                <div
                  style={{
                    padding: "6px 14px",
                    fontSize: 12,
                    borderBottom: "1px solid #1e293b",
                    background: "#0b1220",
                    color: "#7dd3fc",
                    fontFamily: "ui-monospace, monospace",
                  }}
                >
                  ✍️ {activeFilePath}
                </div>
              )}
              <pre
                ref={buildScrollRef}
                style={{
                  margin: 0,
                  flex: 1,
                  overflow: "auto",
                  padding: 16,
                  background: "#0f172a",
                  color: "#9ae6b4",
                  fontSize: 12.5,
                  fontFamily: "ui-monospace, monospace",
                  whiteSpace: "pre-wrap",
                }}
              >
                {activePartialContent || streamingOutput || "⏳ Waiting for the model…"}
              </pre>
            </div>
          ) : tab === "preview" ? (
            doc ? (
              <iframe
                title="preview"
                srcDoc={doc}
                sandbox="allow-scripts"
                style={{ width: "100%", height: "100%", border: "none" }}
              />
            ) : (
              <div style={{ ...emptyStyle, flexDirection: "column", gap: 12 }}>
                <div>Describe your website on the left →</div>
                <div style={{ fontSize: 12.5, color: "#cbd5e1" }}>— or build it by hand —</div>
                <button
                  onClick={openBuilder}
                  disabled={builderLaunching}
                  style={{ ...btnStyle, background: "#7c3aed", border: "1px solid #7c3aed", color: "white", fontWeight: 600, padding: "9px 18px", fontSize: 14 }}
                >
                  {builderLaunching ? "Opening…" : "🎨 Open the Visual Editor"}
                </button>
              </div>
            )
          ) : files.length ? (
            <div style={{ display: "flex", height: "100%", minHeight: 0 }}>
              <div
                style={{
                  width: 250,
                  minWidth: 250,
                  borderRight: "1px solid #e2e8f0",
                  overflowY: "auto",
                  background: "#f8fafc",
                  padding: 8,
                }}
              >
                {files.map((f) => (
                  <div
                    key={f.path}
                    onClick={() => setActiveFile(f.path)}
                    style={{
                      padding: "6px 10px",
                      fontSize: 12.5,
                      borderRadius: 6,
                      cursor: "pointer",
                      marginBottom: 2,
                      fontFamily: "ui-monospace, monospace",
                      background: f.path === activeFile ? "#dbeafe" : "transparent",
                      color: f.path === activeFile ? "#1e40af" : "#334155",
                      fontWeight: f.path === activeFile ? 600 : 400,
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 6,
                    }}
                  >
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      📄 {f.path.replace(/^src\//, "")}
                    </span>
                    {f.saved && <span title="Saved to disk" style={{ color: "#16a34a" }}>●</span>}
                  </div>
                ))}
              </div>
              <pre
                style={{
                  margin: 0,
                  flex: 1,
                  overflow: "auto",
                  padding: 16,
                  background: "#0f172a",
                  color: "#e2e8f0",
                  fontSize: 13,
                  fontFamily: "ui-monospace, monospace",
                }}
              >
                {active ? active.content : "Select a file"}
              </pre>
            </div>
          ) : (
            <div style={emptyStyle}>No files yet →</div>
          )}
        </div>
      </div>
      {versionsOpen && (
        <div style={dialogBackdropStyle} role="presentation">
          <div
            style={{ ...dialogStyle, width: "min(560px, 100%)", maxHeight: "80vh", overflowY: "auto" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="versions-title"
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 id="versions-title" style={{ margin: 0, fontSize: 18 }}>Version history</h2>
              <button onClick={() => setVersionsOpen(false)} style={dialogCancelStyle}>Close</button>
            </div>
            <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: 12 }}>
              A restore point is saved after each successful build. Restoring replaces the current files.
            </p>
            {versionsLoading ? (
              <p style={{ color: "#475569", fontSize: 13, marginTop: 14 }}>Loading versions…</p>
            ) : versions.length === 0 ? (
              <p style={{ color: "#475569", fontSize: 13, marginTop: 14 }}>No saved versions yet.</p>
            ) : (
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                {versions.map((v) => (
                  <div key={v.id} style={versionRowStyle}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {v.prompt || "Snapshot"}
                      </div>
                      <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>
                        {formatProjectTime(v.createdAt)} ago · {v.changedFiles?.length || 0} file(s) · {v.status}
                      </div>
                    </div>
                    <button
                      onClick={() => restoreVersion(v.id)}
                      disabled={!!restoringId}
                      style={dialogRestoreStyle}
                    >
                      {restoringId === v.id ? "Restoring…" : "Restore"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {builderOpen && activeProject && (
        <BuilderEditor
          project={activeProject}
          onClose={() => {
            setBuilderOpen(false);
            refreshProjects().catch(() => {});
          }}
          onProjectPatched={(project) => {
            if (!project) return;
            setActiveProject(project);
            setProjects((current) => current.map((p) => (p.id === project.id ? project : p)));
          }}
        />
      )}
      {deleteDialogOpen && activeProject && (
        <div style={dialogBackdropStyle} role="presentation">
          <div style={dialogStyle} role="dialog" aria-modal="true" aria-labelledby="delete-project-title">
            <h2 id="delete-project-title" style={{ margin: 0, fontSize: 18 }}>
              Delete “{activeProject.name}”?
            </h2>
            <p style={{ margin: "10px 0", color: "#475569", fontSize: 13, lineHeight: 1.55 }}>
              This permanently deletes its generated files, specification, plan, chat history, saved versions, and incomplete sessions.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
              <button disabled={deletingProject} onClick={() => setDeleteDialogOpen(false)} style={dialogCancelStyle}>
                Cancel
              </button>
              <button disabled={deletingProject} onClick={confirmDeleteProject} style={dialogDeleteStyle}>
                {deletingProject ? "Deleting…" : "Delete Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* ------------------------------ helpers/styles ------------------------------ */

// Heuristic safety net: does a typed message describe an error/bug to fix?
// Used only when a project is selected, to keep bug reports out of the
// requirement-analysis path even if the intent classifier misfires.
function looksLikeFixRequest(text) {
  const t = (text || "").toLowerCase();
  // A feature request that merely mentions "error" (e.g. "add an error message")
  // is NOT a bug report. Only treat it as one when it also says "fix".
  if (/\b(add|create|include|build|implement|design|make)\b/.test(t) && !/\bfix\b/.test(t)) {
    return false;
  }
  // Actual error-message-like text.
  if (/(cannot read|is not defined|is not a function|is not iterable|undefined is not|null is not|type ?error|reference ?error|syntax ?error|maximum update depth|before initialization)/.test(t)) {
    return true;
  }
  // Explicit broken-runtime language.
  if (/\b(not working|isn'?t working|does ?n'?t work|wo ?n'?t work|not showing|nothing (shows|renders|appears)|broken|crash(es|ing)?|blank (screen|page|preview)|white screen)\b/.test(t)) {
    return true;
  }
  // "fix" paired with a fault word.
  if (/\bfix\b[\s\S]*\b(error|bug|crash|broken|not working|preview|blank|undefined)\b/.test(t)) return true;
  return false;
}

function isRepairableError(msg) {
  if (typeof msg !== "string") return false;
  if (/dependencies did not load|module failed to load|failed to fetch dynamically imported module|cdn connection/i.test(msg)) {
    return false;
  }
  return /is not defined|Cannot read|Unexpected|SyntaxError|is not a function|Compile error|Invalid|import|export|component was not found in the tree/i.test(
    msg
  );
}

function filesForPreviewError(message, files) {
  const text = message || "";
  const match =
    /(?:ReferenceError:\s*)?([A-Za-z_$][\w$]*) is not defined/.exec(text) ||
    /Identifier ['"]([A-Za-z_$][\w$]*)['"] has already been declared/.exec(text) ||
    /(?:Package export|Uncaught Error:\s*)([A-Z][A-Za-z0-9_$]*)\b/.exec(text) ||
    /\b([A-Z][A-Za-z0-9_$]*) component was not found in the tree/.exec(text);
  if (!match) return [];
  const identifier = match[1];
  const identifierRe = new RegExp(`\\b${identifier}\\b`);
  return files
    .filter((file) => identifierRe.test(file.content || ""))
    .map((file) => file.path);
}

function requiresPlanEvolution(message) {
  return /\b(add|create|include|introduce|build|new)\b[\s\S]{0,60}\b(section|page|component|feature|cart|checkout|dashboard|blog|form)\b/i.test(
    message || ""
  );
}

function validationIssuesByFile(errors) {
  const groups = new Map();
  for (const error of Array.isArray(errors) ? errors : []) {
    const filePath = typeof error?.file === "string" && error.file.trim()
      ? error.file.trim()
      : "Project-wide";
    const message = typeof error?.message === "string" && error.message.trim()
      ? error.message.trim()
      : "Unknown validation issue.";
    const messages = groups.get(filePath) || [];
    messages.push(message);
    groups.set(filePath, messages);
  }
  return Array.from(groups.entries());
}

function messageBubbleStyle(role) {
  return {
  background: role === "assistant" ? "#0b2a3a" : "#1e293b",
  border: role === "assistant" ? "1px solid #164e63" : "1px solid transparent",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 13,
  marginBottom: 8,
  lineHeight: 1.5,
  whiteSpace: "pre-wrap",
  };
}

function formatProjectTime(value) {
  if (!value) return "";
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 1) return "Now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

const newProjectBtnStyle = {
  width: "100%",
  padding: "8px 10px",
  background: "#2563eb",
  color: "white",
  border: 0,
  borderRadius: 6,
  fontWeight: 650,
  cursor: "pointer",
};

function projectItemStyle(selected) {
  return {
    width: "100%",
    textAlign: "left",
    padding: "9px 10px",
    marginBottom: 4,
    color: "white",
    background: selected ? "#1e3a5f" : "transparent",
    border: selected ? "1px solid #2563eb" : "1px solid transparent",
    borderRadius: 6,
    cursor: "pointer",
  };
}

const projectActionStyle = {
  padding: "7px",
  background: "#111c2e",
  color: "#cbd5e1",
  border: "1px solid #334155",
  borderRadius: 6,
  cursor: "pointer",
};

const dialogBackdropStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 50,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
  background: "rgba(2, 6, 23, 0.72)",
};

const dialogStyle = {
  width: "min(460px, 100%)",
  padding: 22,
  background: "white",
  color: "#0f172a",
  borderRadius: 8,
  boxShadow: "0 24px 60px rgba(0,0,0,.3)",
};

const dialogCancelStyle = { padding: "8px 12px", background: "white", border: "1px solid #cbd5e1", borderRadius: 6, cursor: "pointer" };
const dialogDeleteStyle = { padding: "8px 12px", background: "#dc2626", color: "white", border: 0, borderRadius: 6, cursor: "pointer", fontWeight: 650 };
const dialogRestoreStyle = { padding: "6px 12px", background: "#2563eb", color: "white", border: 0, borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 12.5, whiteSpace: "nowrap" };
const versionRowStyle = { border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px", display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" };

function cardStyle(bg, border) {
  return {
    background: bg,
    border: `1px solid ${border}`,
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 12,
    lineHeight: 1.55,
    marginBottom: 8,
  };
}

const resumeBtnStyle = {
  marginTop: 8,
  width: "100%",
  padding: "8px",
  fontSize: 13,
  fontWeight: 600,
  color: "white",
  background: "#dc2626",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

const validationFileButtonStyle = {
  display: "block",
  maxWidth: "100%",
  padding: 0,
  background: "transparent",
  border: 0,
  color: "#93c5fd",
  cursor: "pointer",
  fontSize: 11.5,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontWeight: 700,
  overflow: "hidden",
  textAlign: "left",
  textDecoration: "underline",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const emptyStyle = {
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#94a3b8",
  fontSize: 15,
};

const btnStyle = {
  padding: "4px 12px",
  fontSize: 13,
  background: "white",
  border: "1px solid #cbd5e1",
  borderRadius: 6,
  cursor: "pointer",
};

function tabStyle(activeTab) {
  return {
    padding: "4px 12px",
    fontSize: 13,
    background: activeTab ? "#2563eb" : "white",
    color: activeTab ? "white" : "#334155",
    border: "1px solid " + (activeTab ? "#2563eb" : "#cbd5e1"),
    borderRadius: 6,
    cursor: "pointer",
  };
}
