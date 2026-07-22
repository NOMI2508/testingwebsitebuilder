"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { createEmptySite, SECTION_TYPES } from "../../lib/builder/schema";
import { useBuilderState } from "./useBuilderState";
import { SectionRenderer, StaticSite } from "./SectionRenderer";
import SectionLibrary from "./SectionLibrary";
import SettingsPanel from "./SettingsPanel";

/*
 * Fullscreen visual drag-and-drop editor.
 *
 * Layout: top toolbar (back · devices · undo/redo · save state · publish),
 * left sidebar (section library + page structure), center canvas (the live
 * preview — real React, no iframe/external renderer), right sidebar (settings
 * for the selected section).
 *
 * Persistence: GET/PUT /api/projects/:id/builder with a 1.2 s debounce
 * autosave. Publish renders a clean static copy of the page and posts it to
 * the existing /api/projects/:id/deploy endpoint.
 */

const AUTOSAVE_MS = 1200;
const DEVICES = [
  { key: "desktop", icon: "🖥", label: "Desktop", width: "100%" },
  { key: "tablet", icon: "📱", label: "Tablet", width: 768 },
  { key: "mobile", icon: "📲", label: "Mobile", width: 390 },
];

export default function BuilderEditor({ project, onClose, onProjectPatched, backLabel = "← AI Chat" }) {
  const { site, sections, actions, canUndo, canRedo } = useBuilderState();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveState, setSaveState] = useState("idle"); // idle | dirty | saving | saved | error
  const [device, setDevice] = useState("desktop");
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [focusProductId, setFocusProductId] = useState(null);
  const [hoveredSectionId, setHoveredSectionId] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState(project?.deploymentUrl || null);
  const [toolbarError, setToolbarError] = useState("");

  const siteRef = useRef(site);
  siteRef.current = site;
  const lastSavedRef = useRef(null); // the site object last persisted
  const skipNextAutosaveRef = useRef(true); // true right after LOAD
  const saveTimerRef = useRef(null);
  const dragPayloadRef = useRef(null); // { kind: "section", index } | { kind: "library", type }
  const sectionNodesRef = useRef(new Map()); // sectionId -> DOM node (scroll into view)
  const canvasScrollRef = useRef(null);

  const selectedSection = sections.find((s) => s.id === selectedSectionId) || null;

  /* -------------------------------- loading -------------------------------- */

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError("");
      try {
        const res = await fetch(`/api/projects/${project.id}/builder`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not load the builder document.");
        if (cancelled) return;
        const loaded = data.site || createEmptySite();
        skipNextAutosaveRef.current = true;
        actions.load(loaded);
        lastSavedRef.current = null; // identity differs post-normalize; first edit will save
        setSaveState("idle");
      } catch (error) {
        if (!cancelled) setLoadError(error?.message || String(error));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  /* -------------------------------- saving --------------------------------- */

  const save = useCallback(
    async (siteValue) => {
      setSaveState("saving");
      try {
        const res = await fetch(`/api/projects/${project.id}/builder`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ site: siteValue }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Save failed.");
        lastSavedRef.current = siteValue;
        // Only report "saved" if no newer edits arrived while the request ran.
        setSaveState(siteRef.current === siteValue ? "saved" : "dirty");
      } catch {
        setSaveState("error");
      }
    },
    [project.id]
  );

  // Debounced autosave on every document change.
  useEffect(() => {
    if (loading) return;
    if (skipNextAutosaveRef.current) {
      skipNextAutosaveRef.current = false;
      return;
    }
    if (site === lastSavedRef.current) return;
    setSaveState("dirty");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (siteRef.current !== lastSavedRef.current) save(siteRef.current);
    }, AUTOSAVE_MS);
    return () => clearTimeout(saveTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site, loading]);

  const flushSave = useCallback(async () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    if (!loading && siteRef.current !== lastSavedRef.current) await save(siteRef.current);
  }, [loading, save]);

  // Warn before closing the tab with unsaved edits.
  const dirty = saveState === "dirty" || saveState === "saving";
  useEffect(() => {
    if (!dirty) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  /* ------------------------------- selection -------------------------------- */

  const selectSection = useCallback((sectionId, { scroll = false } = {}) => {
    setSelectedSectionId(sectionId);
    setFocusProductId(null);
    if (scroll && sectionId) {
      setTimeout(() => {
        sectionNodesRef.current.get(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 30);
    }
  }, []);

  function addSection(type, index) {
    const newId = actions.addSection(type, index);
    selectSection(newId, { scroll: true });
  }

  function deleteSection(sectionId) {
    const section = sections.find((s) => s.id === sectionId);
    const label = SECTION_TYPES[section?.type]?.label || "section";
    if (!window.confirm(`Delete the ${label} section?`)) return;
    actions.removeSection(sectionId);
    if (selectedSectionId === sectionId) setSelectedSectionId(null);
  }

  function duplicateSection(sectionId) {
    const newId = actions.duplicateSection(sectionId);
    if (newId) selectSection(newId, { scroll: true });
  }

  // One stable callback shared by every section so their memo stays effective.
  const handleSelectProduct = useCallback((sectionId, productId) => {
    setSelectedSectionId(sectionId);
    setFocusProductId(productId);
  }, []);

  const handleDragPayload = useCallback((payload) => {
    dragPayloadRef.current = payload;
    setDragging(!!payload);
    if (!payload) setDropIndex(null);
  }, []);

  /* --------------------------- canvas drag & drop --------------------------- */

  function handleCanvasDragOver(e, index) {
    if (!dragPayloadRef.current) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const rect = e.currentTarget.getBoundingClientRect();
    const before = e.clientY < rect.top + rect.height / 2;
    setDropIndex(before ? index : index + 1);
  }

  function completeDrop() {
    const payload = dragPayloadRef.current;
    const target = dropIndex;
    dragPayloadRef.current = null;
    setDropIndex(null);
    setDragging(false);
    if (payload == null || target == null) return;
    if (payload.kind === "library") addSection(payload.type, target);
    else if (payload.kind === "section") actions.moveSection(payload.index, target);
  }

  /* ------------------------------- publishing ------------------------------- */

  function buildPublishHtml() {
    const host = document.createElement("div");
    const root = createRoot(host);
    flushSync(() => {
      root.render(<StaticSite site={siteRef.current} />);
    });
    const markup = host.innerHTML;
    root.unmount();
    const title = (project?.name || "My Website").replace(/[<>&]/g, "");
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<style>
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
  img { max-width: 100%; }
</style>
</head>
<body>
${markup}
</body>
</html>`;
  }

  async function publish() {
    if (publishing) return;
    setPublishing(true);
    setToolbarError("");
    try {
      await flushSave();
      const res = await fetch(`/api/projects/${project.id}/deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: buildPublishHtml() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Publish failed.");
      setPublishedUrl(data.deploymentUrl);
      onProjectPatched?.(data.project);
    } catch (error) {
      setToolbarError(error?.message || String(error));
    } finally {
      setPublishing(false);
    }
  }

  async function closeEditor() {
    await flushSave();
    onClose();
  }

  /* --------------------------- keyboard shortcuts --------------------------- */

  useEffect(() => {
    function onKeyDown(e) {
      const mod = e.metaKey || e.ctrlKey;
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName);
      if (mod && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        actions.undo();
      } else if ((mod && e.shiftKey && e.key.toLowerCase() === "z") || (mod && e.key.toLowerCase() === "y")) {
        e.preventDefault();
        actions.redo();
      } else if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        flushSave();
      } else if ((e.key === "Backspace" || e.key === "Delete") && !typing && selectedSectionId) {
        e.preventDefault();
        deleteSection(selectedSectionId);
      } else if (e.key === "Escape" && !typing) {
        setSelectedSectionId(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSectionId, sections, flushSave]);

  /* --------------------------------- render --------------------------------- */

  const deviceWidth = DEVICES.find((d) => d.key === device)?.width || "100%";
  const saveLabel =
    saveState === "saving" ? "Saving…" :
    saveState === "dirty" ? "Unsaved changes" :
    saveState === "saved" ? "✓ Saved" :
    saveState === "error" ? "⚠ Save failed — retry" : "";

  const dropIndicator = <div style={{ height: 4, background: "#3b82f6", borderRadius: 2, margin: "0 24px" }} />;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", flexDirection: "column", background: "#0b1220", fontFamily: "system-ui, sans-serif" }}>
      {/* ------------------------------- toolbar ------------------------------- */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#08111f", borderBottom: "1px solid #1e293b", color: "white" }}>
        <button onClick={closeEditor} style={toolBtn} title="Close the visual editor">
          {backLabel}
        </button>
        <div style={{ fontWeight: 700, fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>
          🎨 {project?.name || "Visual Editor"}
        </div>

        <div style={{ display: "flex", gap: 2, marginLeft: 8, background: "#0d1728", borderRadius: 8, padding: 2 }}>
          {DEVICES.map((d) => (
            <button
              key={d.key}
              onClick={() => setDevice(d.key)}
              title={d.label}
              style={{
                ...toolBtn,
                border: 0,
                background: device === d.key ? "#2563eb" : "transparent",
                padding: "5px 10px",
              }}
            >
              {d.icon}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 4, marginLeft: 4 }}>
          <button onClick={actions.undo} disabled={!canUndo} style={{ ...toolBtn, opacity: canUndo ? 1 : 0.35 }} title="Undo (⌘Z)">
            ↩ Undo
          </button>
          <button onClick={actions.redo} disabled={!canRedo} style={{ ...toolBtn, opacity: canRedo ? 1 : 0.35 }} title="Redo (⇧⌘Z)">
            ↪ Redo
          </button>
        </div>

        <div style={{ flex: 1 }} />

        {toolbarError ? <span style={{ color: "#fca5a5", fontSize: 12, maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={toolbarError}>{toolbarError}</span> : null}

        <button
          onClick={() => (saveState === "error" ? save(siteRef.current) : null)}
          style={{ background: "transparent", border: 0, cursor: saveState === "error" ? "pointer" : "default", fontSize: 12, color: saveState === "error" ? "#fca5a5" : saveState === "saved" ? "#86efac" : "#94a3b8" }}
          title="Autosaves 1.2s after every change"
        >
          {saveLabel}
        </button>
        <button onClick={flushSave} style={toolBtn} title="Save now (⌘S)">
          💾 Save
        </button>
        {publishedUrl ? (
          <a href={publishedUrl} target="_blank" rel="noreferrer" style={{ ...toolBtn, textDecoration: "none", color: "#7dd3fc", display: "inline-block" }} title="Open the published site">
            ↗ Live
          </a>
        ) : null}
        <button
          onClick={publish}
          disabled={publishing}
          style={{ ...toolBtn, background: "#16a34a", border: "1px solid #16a34a", fontWeight: 700, opacity: publishing ? 0.6 : 1 }}
        >
          {publishing ? "Publishing…" : "🚀 Publish"}
        </button>
      </div>

      {/* -------------------------------- body -------------------------------- */}
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* left: library + structure */}
        <aside style={{ width: 252, minWidth: 252, background: "#08111f", borderRight: "1px solid #1e293b", overflow: "hidden" }}>
          <SectionLibrary
            sections={sections}
            selectedSectionId={selectedSectionId}
            onAdd={(type) => addSection(type)}
            onAddAt={(type, index) => addSection(type, index)}
            onSelect={(id) => selectSection(id, { scroll: true })}
            onMove={(from, to) => actions.moveSection(from, to)}
            onDuplicate={duplicateSection}
            onDelete={deleteSection}
            onToggleVisible={(id) => {
              const section = sections.find((s) => s.id === id);
              if (section) actions.updateSection(id, { settings: { visible: !section.settings.visible } });
            }}
            onDragPayload={handleDragPayload}
          />
        </aside>

        {/* center: canvas */}
        <div
          ref={canvasScrollRef}
          style={{ flex: 1, minWidth: 0, overflow: "auto", background: "#1a2436", padding: "22px 18px" }}
          onClick={() => setSelectedSectionId(null)}
          onClickCapture={(e) => {
            // Keep editing clicks from navigating (anchor links inside sections).
            const anchor = e.target.closest?.("a");
            if (anchor) e.preventDefault();
          }}
          onDragOver={(e) => {
            // Allow dropping into an empty canvas.
            if (dragPayloadRef.current && !sections.length) {
              e.preventDefault();
              setDropIndex(0);
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            completeDrop();
          }}
        >
          {loading ? (
            <div style={canvasMessageStyle}>Loading your website…</div>
          ) : loadError ? (
            <div style={{ ...canvasMessageStyle, color: "#fca5a5" }}>
              ⚠️ {loadError}
            </div>
          ) : (
            <div
              style={{
                width: deviceWidth,
                maxWidth: "100%",
                margin: "0 auto",
                background: "white",
                borderRadius: 10,
                boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
                overflow: "hidden",
                transition: "width .2s",
              }}
            >
              {!sections.length ? (
                <div style={{ padding: "110px 30px", textAlign: "center", color: "#64748b" }}>
                  <div style={{ fontSize: 34 }}>🧱</div>
                  <div style={{ fontWeight: 700, fontSize: 17, marginTop: 10, color: "#334155" }}>Start building your website</div>
                  <div style={{ fontSize: 13.5, marginTop: 6, lineHeight: 1.6 }}>
                    Click a section in the left library — it is added here instantly.<br />
                    You can also drag sections from the library into the page.
                  </div>
                  {dropIndex === 0 && dragging ? <div style={{ marginTop: 18 }}>{dropIndicator}</div> : null}
                </div>
              ) : (
                <>
                  {sections.map((section, index) => {
                    const selected = section.id === selectedSectionId;
                    const hovered = section.id === hoveredSectionId;
                    return (
                      <div key={section.id}>
                        {dropIndex === index && dragging ? dropIndicator : null}
                        <div
                          ref={(node) => {
                            if (node) sectionNodesRef.current.set(section.id, node);
                            else sectionNodesRef.current.delete(section.id);
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            selectSection(section.id);
                          }}
                          onMouseEnter={() => setHoveredSectionId(section.id)}
                          onMouseLeave={() => setHoveredSectionId((cur) => (cur === section.id ? null : cur))}
                          onDragOver={(e) => handleCanvasDragOver(e, index)}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            completeDrop();
                          }}
                          style={{
                            position: "relative",
                            outline: selected ? "2px solid #3b82f6" : hovered ? "2px dashed #93c5fd" : "none",
                            outlineOffset: -2,
                          }}
                        >
                          {/* hover/selection toolbar */}
                          {(selected || hovered) && (
                            <div
                              style={{
                                position: "absolute",
                                top: 6,
                                right: 6,
                                zIndex: 5,
                                display: "flex",
                                gap: 4,
                                background: "#0f172a",
                                borderRadius: 8,
                                padding: 4,
                                boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData("text/plain", `section:${index}`);
                                  e.dataTransfer.effectAllowed = "move";
                                  dragPayloadRef.current = { kind: "section", index };
                                  setDragging(true);
                                  selectSection(section.id);
                                }}
                                onDragEnd={() => {
                                  dragPayloadRef.current = null;
                                  setDragging(false);
                                  setDropIndex(null);
                                }}
                                title="Drag to reorder"
                                style={{ ...overlayBtn, cursor: "grab" }}
                              >
                                ⠿
                              </span>
                              <button onClick={() => actions.moveSection(index, index - 1)} disabled={index === 0} style={{ ...overlayBtn, opacity: index === 0 ? 0.35 : 1 }} title="Move up">↑</button>
                              <button onClick={() => actions.moveSection(index, index + 2)} disabled={index === sections.length - 1} style={{ ...overlayBtn, opacity: index === sections.length - 1 ? 0.35 : 1 }} title="Move down">↓</button>
                              <button onClick={() => duplicateSection(section.id)} style={overlayBtn} title="Duplicate">⧉</button>
                              <button
                                onClick={() =>
                                  actions.updateSection(section.id, { settings: { visible: !section.settings.visible } })
                                }
                                style={overlayBtn}
                                title={section.settings.visible ? "Hide" : "Show"}
                              >
                                {section.settings.visible ? "👁" : "🙈"}
                              </button>
                              <button onClick={() => deleteSection(section.id)} style={{ ...overlayBtn, color: "#f87171" }} title="Delete">🗑</button>
                            </div>
                          )}
                          {!section.settings.visible && (
                            <div style={{ position: "absolute", top: 6, left: 6, zIndex: 5, background: "#334155", color: "#cbd5e1", fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 6 }}>
                              HIDDEN
                            </div>
                          )}
                          <SectionRenderer
                            section={section}
                            editable
                            selectedProductId={selected ? focusProductId : null}
                            onSelectProduct={handleSelectProduct}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {dropIndex === sections.length && dragging ? dropIndicator : null}
                </>
              )}
            </div>
          )}
          <div style={{ height: 60 }} />
        </div>

        {/* right: settings */}
        <aside style={{ width: 300, minWidth: 300, background: "white", borderLeft: "1px solid #1e293b", overflow: "hidden", color: "#0f172a" }}>
          <SettingsPanel
            section={selectedSection}
            focusItemId={focusProductId}
            onUpdate={(sectionId, patch, coalesce) => actions.updateSection(sectionId, patch, coalesce)}
            onDuplicate={duplicateSection}
            onDelete={deleteSection}
          />
        </aside>
      </div>
    </div>
  );
}

const toolBtn = {
  padding: "6px 11px",
  fontSize: 12.5,
  fontWeight: 600,
  background: "#111c2e",
  color: "#e2e8f0",
  border: "1px solid #26354d",
  borderRadius: 7,
  cursor: "pointer",
};

const overlayBtn = {
  padding: "3px 6px",
  background: "transparent",
  border: 0,
  color: "#e2e8f0",
  cursor: "pointer",
  fontSize: 12.5,
  lineHeight: 1.3,
  borderRadius: 5,
};

const canvasMessageStyle = {
  padding: "120px 30px",
  textAlign: "center",
  color: "#94a3b8",
  fontSize: 14.5,
};
