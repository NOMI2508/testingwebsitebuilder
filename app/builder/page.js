"use client";

// /builder — standalone entry point for the visual drag-and-drop editor.
//
// The same <BuilderEditor> that powers the "🎨 Visual Editor" button on the
// home page, reachable at a direct URL: pick one of your visual sites (or
// create a new one) and edit it. The open site id is mirrored to ?site= so a
// refresh restores the same editor. All persistence goes through the shared
// /api/projects/:id/builder route.

import { useEffect, useState } from "react";
import BuilderEditor from "../components/builder/BuilderEditor";

// Project types shown in (and created from) this picker. The home page
// launcher creates visual-editor projects with type "visual".
const VISUAL_TYPES = new Set(["visual", "builder"]);

function formatTime(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return (
    date.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
    " · " +
    date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
  );
}

const cardStyle = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 14,
  padding: 18,
};

const accentBtnStyle = {
  padding: "9px 18px",
  borderRadius: 9,
  border: "none",
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
};

export default function BuilderPage() {
  const [phase, setPhase] = useState("loading"); // loading | picker | editor
  const [sites, setSites] = useState([]);
  const [project, setProject] = useState(null);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("site");
    if (id) openSite(id);
    else refreshList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refreshList() {
    setPhase("loading");
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load projects.");
      setSites((data.projects || []).filter((item) => VISUAL_TYPES.has(item.type)));
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setPhase("picker");
    }
  }

  async function openSite(projectId) {
    setPhase("loading");
    setError("");
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Project not found.");
      setProject(data.project);
      window.history.replaceState(null, "", `/builder?site=${projectId}`);
      setPhase("editor");
    } catch (e) {
      setError(e?.message || String(e));
      window.history.replaceState(null, "", "/builder");
      refreshList();
    }
  }

  async function createSite() {
    if (creating) return;
    setCreating(true);
    setError("");
    try {
      const name = newName.trim() || "My Website";
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type: "visual",
          description: "Built with the visual drag-and-drop editor.",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create the site.");
      setProject(data.project);
      setNewName("");
      window.history.replaceState(null, "", `/builder?site=${data.project.id}`);
      setPhase("editor");
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setCreating(false);
    }
  }

  function backToPicker() {
    setProject(null);
    window.history.replaceState(null, "", "/builder");
    refreshList();
  }

  if (phase === "editor" && project) {
    return (
      <BuilderEditor
        key={project.id}
        project={project}
        backLabel="← My Websites"
        onClose={backToPicker}
        onProjectPatched={(patched) => {
          if (patched) setProject(patched);
        }}
      />
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b1220",
        color: "#e2e8f0",
        fontFamily: "system-ui, sans-serif",
        padding: "48px 24px",
      }}
    >
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>🎨 Visual Website Builder</h1>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "#94a3b8" }}>
              Build a professional website from ready-made sections — live preview, drag &amp; drop, one-click publish.
            </p>
          </div>
          <a href="/" style={{ fontSize: 12.5, color: "#93c5fd", textDecoration: "none" }}>
            ← AI Builder
          </a>
        </div>

        {error && (
          <div
            style={{
              marginTop: 20,
              padding: "10px 14px",
              borderRadius: 10,
              background: "#3f1212",
              color: "#fecaca",
              fontSize: 13,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <div style={{ ...cardStyle, marginTop: 26, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") createSite();
            }}
            placeholder="Name your new website (e.g. Acme Studio)"
            style={{
              flex: 1,
              minWidth: 220,
              padding: "10px 12px",
              borderRadius: 9,
              border: "1px solid #263449",
              background: "#0b1220",
              color: "#e2e8f0",
              fontSize: 13.5,
              outline: "none",
              fontFamily: "inherit",
            }}
          />
          <button onClick={createSite} disabled={creating} style={{ ...accentBtnStyle, opacity: creating ? 0.7 : 1 }}>
            {creating ? "Creating…" : "＋ New Website"}
          </button>
        </div>

        <div style={{ marginTop: 30 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: "#64748b",
              marginBottom: 12,
            }}
          >
            Your websites
          </div>
          {phase === "loading" ? (
            <div style={{ color: "#94a3b8", fontSize: 13 }}>Loading…</div>
          ) : sites.length === 0 ? (
            <div style={{ ...cardStyle, color: "#94a3b8", fontSize: 13, lineHeight: 1.7 }}>
              No visual websites yet. Create your first one above and start adding sections from the library.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 14 }}>
              {sites.map((item) => (
                <div key={item.id} style={cardStyle}>
                  <div
                    style={{
                      fontSize: 14.5,
                      fontWeight: 700,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                    Updated {formatTime(item.updatedAt)}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                    <button onClick={() => openSite(item.id)} style={accentBtnStyle}>
                      Open editor
                    </button>
                    {item.deploymentUrl ? (
                      <a
                        href={item.deploymentUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          padding: "9px 14px",
                          borderRadius: 9,
                          border: "1px solid #263449",
                          color: "#7dd3fc",
                          textDecoration: "none",
                          fontSize: 13,
                        }}
                      >
                        🔗 Live
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
