"use client";

import { useState } from "react";
import { SECTION_ORDER, SECTION_TYPES } from "../../lib/builder/schema";

/*
 * Left sidebar: the section library (click to add, drag onto the canvas) and
 * the page structure list (select, reorder via drag handle, show/hide,
 * duplicate, delete).
 *
 * Drag payloads share one convention with the canvas:
 *   "library:<type>"   — a new section dragged from the library
 *   "section:<index>"  — an existing section being reordered
 */

export default function SectionLibrary({
  sections,
  selectedSectionId,
  onAdd,
  onSelect,
  onMove,
  onAddAt,
  onDuplicate,
  onDelete,
  onToggleVisible,
  // Reports { kind: "library", type } | { kind: "section", index } | null so the
  // canvas can accept drops started here.
  onDragPayload,
}) {
  const [dropIndex, setDropIndex] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);

  function handleRowDragOver(e, index) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const rect = e.currentTarget.getBoundingClientRect();
    const before = e.clientY < rect.top + rect.height / 2;
    setDropIndex(before ? index : index + 1);
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const payload = e.dataTransfer.getData("text/plain");
    const target = dropIndex;
    setDropIndex(null);
    setDragIndex(null);
    onDragPayload?.(null);
    if (target == null || !payload) return;
    if (payload.startsWith("library:")) onAddAt(payload.slice(8), target);
    else if (payload.startsWith("section:")) onMove(Number(payload.slice(8)), target);
  }

  const indicator = <div style={{ height: 3, background: "#3b82f6", borderRadius: 2, margin: "1px 0" }} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      {/* ------------------------------ library ------------------------------ */}
      <div style={{ padding: "12px 12px 6px", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>
        Add Sections
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, padding: "0 12px 12px" }}>
        {SECTION_ORDER.map((type) => {
          const schema = SECTION_TYPES[type];
          return (
            <button
              key={type}
              onClick={() => onAdd(type)}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", `library:${type}`);
                e.dataTransfer.effectAllowed = "copyMove";
                onDragPayload?.({ kind: "library", type });
              }}
              onDragEnd={() => onDragPayload?.(null)}
              title={`${schema.description} Click to add, or drag into the page.`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "9px 10px",
                background: "#111c2e",
                color: "#e2e8f0",
                border: "1px solid #26354d",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 12.5,
                fontWeight: 600,
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: 15 }}>{schema.icon}</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{schema.label}</span>
            </button>
          );
        })}
      </div>

      {/* --------------------------- page structure --------------------------- */}
      <div style={{ padding: "10px 12px 6px", borderTop: "1px solid #1e293b", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>
        Page Structure
      </div>
      <div
        style={{ flex: 1, overflowY: "auto", padding: "0 10px 12px", minHeight: 60 }}
        onDragOver={(e) => {
          // Dropping in the empty area below the rows appends at the end.
          if (e.target === e.currentTarget) {
            e.preventDefault();
            setDropIndex(sections.length);
          }
        }}
        onDrop={handleDrop}
        onDragLeave={(e) => {
          if (e.target === e.currentTarget) setDropIndex(null);
        }}
      >
        {!sections.length && (
          <div style={{ padding: "14px 6px", color: "#64748b", fontSize: 12, lineHeight: 1.6 }}>
            The page is empty. Click a section above to add it — it appears in the preview instantly.
          </div>
        )}
        {sections.map((section, index) => {
          const schema = SECTION_TYPES[section.type];
          const selected = section.id === selectedSectionId;
          const hidden = !section.settings.visible;
          return (
            <div key={section.id}>
              {dropIndex === index && dragIndex !== index ? indicator : null}
              <div
                onClick={() => onSelect(section.id)}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", `section:${index}`);
                  e.dataTransfer.effectAllowed = "move";
                  setDragIndex(index);
                  onDragPayload?.({ kind: "section", index });
                }}
                onDragEnd={() => {
                  setDragIndex(null);
                  setDropIndex(null);
                  onDragPayload?.(null);
                }}
                onDragOver={(e) => handleRowDragOver(e, index)}
                onDrop={handleDrop}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 8px",
                  marginTop: 3,
                  borderRadius: 7,
                  cursor: "pointer",
                  background: selected ? "#1e3a5f" : "#0d1728",
                  border: selected ? "1px solid #3b82f6" : "1px solid #1c2a41",
                  opacity: dragIndex === index ? 0.45 : 1,
                  color: "#e2e8f0",
                }}
              >
                <span title="Drag to reorder" style={{ cursor: "grab", color: "#64748b", fontSize: 13, lineHeight: 1, padding: "2px 1px" }}>
                  ⠿
                </span>
                <span style={{ fontSize: 13 }}>{schema.icon}</span>
                <span
                  style={{
                    flex: 1,
                    fontSize: 12.5,
                    fontWeight: selected ? 700 : 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    textDecoration: hidden ? "line-through" : "none",
                    opacity: hidden ? 0.55 : 1,
                  }}
                >
                  {schema.label}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisible(section.id);
                  }}
                  title={hidden ? "Show section" : "Hide section"}
                  style={rowIconBtn}
                >
                  {hidden ? "🙈" : "👁"}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate(section.id);
                  }}
                  title="Duplicate section"
                  style={rowIconBtn}
                >
                  ⧉
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(section.id);
                  }}
                  title="Delete section"
                  style={{ ...rowIconBtn, color: "#f87171" }}
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
        {dropIndex === sections.length && sections.length > 0 ? indicator : null}
      </div>
    </div>
  );
}

const rowIconBtn = {
  padding: "2px 4px",
  background: "transparent",
  border: 0,
  color: "#94a3b8",
  cursor: "pointer",
  fontSize: 12,
  lineHeight: 1,
  borderRadius: 4,
};
