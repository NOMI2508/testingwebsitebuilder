"use client";

import { useState, useRef, useEffect } from "react";

/* ============================================================
   1) Model ke stream ko alag-alag files mein parse karna
   Format:  ===FILE: path===\n<content>
   ============================================================ */
function parseFiles(raw) {
  const cleaned = raw
    .replace(/```[a-zA-Z]*\s*/g, "")
    .replace(/```/g, "");
  const fileRegex =
    /===\s*FILE:\s*([^\n=]+?)\s*===\s*\n([\s\S]*?)(?=\n?===\s*END_FILE\s*===|\n?===\s*FILE:|$)/gi;
  const files = [];
  let match;

  while ((match = fileRegex.exec(cleaned)) !== null) {
    const path = match[1].trim();
    const content = match[2].trim();
    if (path && content) files.push({ path, content });
  }

  return files;
}

function mergeFiles(existingFiles, incomingFiles) {
  const fileMap = new Map(existingFiles.map((file) => [file.path, file]));

  for (const file of incomingFiles) {
    fileMap.set(file.path, file);
  }

  return Array.from(fileMap.values()).sort((a, b) =>
    a.path.localeCompare(b.path)
  );
}

function chunkPaths(paths, size = 4) {
  const chunks = [];
  for (let i = 0; i < paths.length; i += size) {
    chunks.push(paths.slice(i, i + size));
  }
  return chunks;
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
   2) Preview ke liye saari files ko ek module mein bundle karna.
   - local (./) imports hata dete hain (sab ek scope mein aa jate hain)
   - Mantine/react imports hata dete hain (preview global scope se milte hain)
   - icons ke imports jama kar ke ek deduped import banate hain
   - export keywords hata dete hain (taake ek hi scope mein chal sake)
   ============================================================ */
function bundleFiles(files) {
  const icons = new Set();
  const importBrace = /import\s*\{([\s\S]*?)\}\s*from\s*['"]([^'"]+)['"]\s*;?/g;

  const bodyOf = (code) => {
    let m;
    importBrace.lastIndex = 0;
    while ((m = importBrace.exec(code))) {
      if (m[2].includes("@tabler/icons-react")) {
        m[1]
          .split(",")
          .map((x) => x.trim().split(/\s+as\s+/)[0].trim())
          .filter(Boolean)
          .forEach((n) => icons.add(n));
      }
    }
    let out = code
      // har tarah ke import statement hata do (single ya multi-line)
      .replace(/import[\s\S]*?from\s*['"][^'"]+['"]\s*;?/g, "")
      .replace(/import\s+['"][^'"]+['"]\s*;?/g, "")
      // export keywords hata do
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

  // Har icon ko namespace (__I) se lo; agar model ne ghalat naam import kiya
  // (jaise `Clock` bajaye `IconClock`) to crash ki jagah khaali render ho.
  const header = icons.size
    ? [...icons]
        .map(
          (n) =>
            `const ${n} = (typeof __I !== 'undefined' && __I.${n}) || (function(){return null;});`
        )
        .join("\n") + "\n"
    : "";

  return header + "\n" + bodies;
}

/* ============================================================
   3) Bundle code ko iframe ke live HTML document mein badalna
   ============================================================ */
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
    },
  };

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
  function showError(msg) {
    var r = document.getElementById("root");
    if (r)
      r.innerHTML =
        '<pre style="color:#dc2626;padding:20px;white-space:pre-wrap;font-family:monospace;font-size:13px">⚠️ ' +
        String(msg) + "</pre>";
  }
  window.addEventListener("error", function (e) {
    if (e && e.message && e.message !== "Script error.") showError(e.message);
  });
  window.addEventListener("unhandledrejection", function (e) {
    showError((e.reason && e.reason.message) || e.reason);
  });
  try {
    var userCode = document.getElementById("usercode").textContent;
    var wrapped =
      "import * as __M from '@mantine/core';\\n" +
      "import * as __I from '@tabler/icons-react';\\n" +
      "import React from 'react';\\n" +
      "import { createRoot as __cr } from 'react-dom/client';\\n" +
      "Object.assign(window, __M, __I, React);\\n" +
      "const __MP = __M.MantineProvider;\\n" +
      userCode + "\\n" +
      "__cr(document.getElementById('root')).render(" +
      "React.createElement(__MP, { defaultColorScheme: 'light' }, React.createElement(App)));";
    var out = Babel.transform(wrapped, { presets: ["react"] }).code;
    var blob = new Blob([out], { type: "text/javascript" });
    var script = document.createElement("script");
    script.type = "module";
    script.src = URL.createObjectURL(blob);
    document.body.appendChild(script);
  } catch (err) {
    showError("Compile error: " + (err && err.message ? err.message : err));
  }
</script>
</body>
</html>`;
}

/* ============================================================
   Main component
   ============================================================ */
export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState([]); // [{path, content}]
  const [activeFile, setActiveFile] = useState("");
  const [doc, setDoc] = useState("");
  const [tab, setTab] = useState("preview"); // "preview" | "files"
  const [rawStream, setRawStream] = useState(""); // build hote waqt live text
  const [loading, setLoading] = useState(false);
  const [building, setBuilding] = useState(false);
  const [status, setStatus] = useState("");
  const [projectSpec, setProjectSpec] = useState(null);
  const [projectPlan, setProjectPlan] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");
  const buildRef = useRef(null);

  useEffect(() => {
    if (building && buildRef.current) {
      buildRef.current.scrollTop = buildRef.current.scrollHeight;
    }
  }, [rawStream, building]);

  async function generate() {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    const isFirst = files.length === 0;
    const nextMessages = [...messages, { role: "user", content: userText }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError("");
    setQuestions([]);

    try {
      setStatus("Aapki requirement analyze ho rahi hai...");
      const enhanceResponse = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userText,
          existingSpec: projectSpec,
        }),
      });
      const enhanceData = await enhanceResponse.json();

      if (!enhanceResponse.ok) {
        throw new Error(enhanceData.error || "Requirements analyze nahi ho sakin.");
      }

      const spec = enhanceData.spec;
      setProjectSpec(spec);

      if (spec.status === "needs_clarification") {
        setQuestions(spec.clarifyingQuestions || []);
        setStatus("");
        return;
      }

      setStatus("Project structure plan ho raha hai...");
      const planResponse = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spec }),
      });
      const planData = await planResponse.json();

      if (!planResponse.ok) {
        throw new Error(planData.error || "Project plan generate nahi hua.");
      }

      const plan = planData.plan;
      setProjectPlan(plan);
      setBuilding(true);
      setRawStream("");

      let accumulatedFiles = [...files];
      let streamedText = "";
      const plannedPaths = (plan.files || []).map((file) => file.path);
      const batches =
        isFirst && Array.isArray(plan.batches) && plan.batches.length
          ? plan.batches
          : isFirst
            ? chunkPaths(plannedPaths)
            : [[]];

      for (let index = 0; index < batches.length; index += 1) {
        const batch = batches[index].filter((path) => plannedPaths.includes(path));
        const batchLabel = isFirst
          ? `Files generate ho rahi hain (${index + 1}/${batches.length})...`
          : "Requested update generate ho rahi hai...";
        setStatus(batchLabel);

        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: isFirst ? "initial" : "edit",
            spec,
            plan,
            requestedPaths: batch,
            currentFiles: Object.fromEntries(
              accumulatedFiles.map((file) => [file.path, file.content])
            ),
            messages: [
              {
                role: "user",
                content: isFirst
                  ? "Generate the requested project files according to the approved specification."
                  : userText,
              },
            ],
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Kuch ghalat ho gaya.");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setRawStream(streamedText + acc);
          setStatus(batchLabel + " " + acc.length + " chars");
        }

        streamedText += acc + "\n\n";

        const parsed = parseFiles(acc);
        if (parsed.length === 0) {
          throw new Error("Model ne files sahi format mein nahi deen. Dubara try karein.");
        }

        accumulatedFiles = mergeFiles(accumulatedFiles, parsed);
        setFiles(accumulatedFiles);
        setActiveFile((current) => current || accumulatedFiles[0]?.path || "");
        setDoc(buildPreviewDoc(bundleFiles(accumulatedFiles)));
        setTab("preview");
      }

      setMessages(nextMessages);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
      setBuilding(false);
      setStatus("");
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      generate();
    }
  }

  // Poora project ZIP mein download (asli folder structure ke saath)
  async function downloadZip() {
    try {
      const JSZip = (await import(/* webpackIgnore: true */ "https://esm.sh/jszip@3.10.1")).default;
      const zip = new JSZip();
      files.forEach((f) => zip.file(f.path, f.content));
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "website-project.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError("ZIP download fail hui: " + String(e));
    }
  }

  const active = files.find((f) => f.path === activeFile);

  return (
    <main style={{ display: "flex", height: "100vh", fontFamily: "system-ui, sans-serif" }}>
      {/* LEFT: prompt panel */}
      <div
        style={{
          width: 360,
          minWidth: 360,
          borderRight: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          background: "#0f172a",
          color: "white",
        }}
      >
        <div style={{ padding: "16px 18px", borderBottom: "1px solid #1e293b" }}>
          <h1 style={{ margin: 0, fontSize: 17 }}>🛠️ Website Builder</h1>
          <p style={{ margin: "3px 0 0", fontSize: 11, opacity: 0.6 }}>
            Next.js · React · Mantine · Laguna M.1 (free)
          </p>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
          {messages.length === 0 && (
            <p style={{ fontSize: 13, opacity: 0.55, lineHeight: 1.6 }}>
              Apni website describe karein. Misaal:
              <br />
              <em>&quot;Ek coffee shop ki landing page — hero, menu aur contact section.&quot;</em>
              <br />
              <br />
              Ban jaye to keh sakte hain: <em>&quot;pricing section add karo&quot;</em>.
            </p>
          )}

          {messages
            .filter((m) => m.role === "user")
            .map((m, i) => (
              <div
                key={i}
                style={{
                  background: "#1e293b",
                  borderRadius: 8,
                  padding: "8px 10px",
                  fontSize: 13,
                  marginBottom: 8,
                  lineHeight: 1.5,
                }}
              >
                {m.content}
              </div>
            ))}

          {projectSpec && (
            <div
              style={{
                background: "#0b2a3a",
                border: "1px solid #164e63",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 12,
                lineHeight: 1.55,
                marginBottom: 8,
                whiteSpace: "pre-wrap",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 4, color: "#7dd3fc" }}>
                📋 Project spec:
              </div>
              {compactSpec(projectSpec)}
            </div>
          )}

          {projectPlan && (
            <div
              style={{
                background: "#132014",
                border: "1px solid #166534",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 12,
                lineHeight: 1.55,
                marginBottom: 8,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 4, color: "#86efac" }}>
                Project plan:
              </div>
              {projectPlan.files?.length || 0} files · {projectPlan.entryFile || "src/App.jsx"}
            </div>
          )}

          {questions.length > 0 && (
            <div
              style={{
                background: "#2a1f0b",
                border: "1px solid #92400e",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 12,
                lineHeight: 1.55,
                marginBottom: 8,
                color: "#fde68a",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Clarify karein:</div>
              {questions.map((question, index) => (
                <div key={index}>{question}</div>
              ))}
            </div>
          )}

          {loading && status && (
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>{status}</div>
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
            placeholder="Apni website ya tabdeeli likhein… (Enter = bhejo)"
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
            onClick={generate}
            disabled={loading || !input.trim()}
            style={{
              width: "100%",
              marginTop: 8,
              padding: "11px",
              fontSize: 15,
              fontWeight: 600,
              color: "white",
              background: loading || !input.trim() ? "#475569" : "#2563eb",
              border: "none",
              borderRadius: 8,
              cursor: loading || !input.trim() ? "default" : "pointer",
            }}
          >
            {files.length ? "Update karo ✨" : "Website banao ✨"}
          </button>
        </div>
      </div>

      {/* RIGHT: preview / files */}
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
          {building ? (
            <span style={{ color: "#64748b" }}>🛠️ Ban rahi hai… (live)</span>
          ) : files.length ? (
            <span style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setTab("preview")}
                style={tabStyle(tab === "preview")}
              >
                🔴 Preview
              </button>
              <button onClick={() => setTab("files")} style={tabStyle(tab === "files")}>
                📁 Files ({files.length})
              </button>
            </span>
          ) : (
            <span style={{ color: "#64748b" }}>Preview yahan dikhega</span>
          )}

          {files.length > 0 && !building && (
            <button onClick={downloadZip} style={btnStyle}>
              ⬇️ Download project (.zip)
            </button>
          )}
        </div>

        <div style={{ flex: 1, background: "#fff", minHeight: 0 }}>
          {building ? (
            <pre
              ref={buildRef}
              style={{
                margin: 0,
                height: "100%",
                overflow: "auto",
                padding: 16,
                background: "#0f172a",
                color: "#9ae6b4",
                fontSize: 12.5,
                fontFamily: "ui-monospace, monospace",
                whiteSpace: "pre-wrap",
              }}
            >
              {rawStream || "⏳ Model se files aa rahi hain…"}
            </pre>
          ) : !files.length ? (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#94a3b8",
                fontSize: 15,
              }}
            >
              Left side par apni website describe karein →
            </div>
          ) : tab === "preview" ? (
            <iframe
              title="preview"
              srcDoc={doc}
              sandbox="allow-scripts"
              style={{ width: "100%", height: "100%", border: "none" }}
            />
          ) : (
            // FILES tab: left file-tree + right file content
            <div style={{ display: "flex", height: "100%", minHeight: 0 }}>
              <div
                style={{
                  width: 230,
                  minWidth: 230,
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
                    }}
                  >
                    📄 {f.path}
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
                {active ? active.content : ""}
              </pre>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

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
