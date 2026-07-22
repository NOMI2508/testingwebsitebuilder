"use client";

import { useEffect, useRef, useState } from "react";
import { SECTION_TYPES, uid } from "../../lib/builder/schema";
import { makeListOps } from "./useBuilderState";

/*
 * Right sidebar: settings for the selected section, rendered generically from
 * the schema registry (fields + lists) so no section type is hardcoded here.
 * The list editor gives every list (products, links, features, testimonials…)
 * add / duplicate / delete / reorder / expand-to-edit for free.
 */

export default function SettingsPanel({
  section,
  focusItemId, // e.g. a product clicked in the canvas — auto-expand that item
  onUpdate, // (sectionId, patch, coalesce?) => void
  onDuplicate,
  onDelete,
  onFocusItemHandled,
}) {
  if (!section) {
    return (
      <div style={{ padding: 20, color: "#64748b", fontSize: 13, lineHeight: 1.7 }}>
        <div style={{ fontSize: 26 }}>👈</div>
        Select a section in the preview or the page structure to edit its content and design.
        <br />
        <br />
        Click a product card to edit that product directly.
      </div>
    );
  }
  const schema = SECTION_TYPES[section.type];
  if (!schema) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderBottom: "1px solid #e2e8f0" }}>
        <span style={{ fontSize: 17 }}>{schema.icon}</span>
        <span style={{ fontWeight: 700, fontSize: 14, flex: 1 }}>{schema.label}</span>
        <button onClick={() => onDuplicate(section.id)} title="Duplicate section" style={headerBtn}>
          ⧉
        </button>
        <button onClick={() => onDelete(section.id)} title="Delete section" style={{ ...headerBtn, color: "#dc2626" }}>
          🗑
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
        {/* visibility */}
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 14, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={section.settings.visible}
            onChange={(e) => onUpdate(section.id, { settings: { visible: e.target.checked } })}
          />
          Section visible
        </label>

        {/* scalar content fields */}
        {(schema.fields || []).map((field) => (
          <Field
            key={field.key}
            field={field}
            value={section.content[field.key]}
            onChange={(value) => onUpdate(section.id, { content: { [field.key]: value } }, true)}
          />
        ))}

        {/* list content (products, links, features, …) */}
        {(schema.lists || []).map((list) => (
          <ListEditor
            key={list.key}
            section={section}
            list={list}
            focusItemId={focusItemId}
            onUpdate={onUpdate}
            onFocusItemHandled={onFocusItemHandled}
          />
        ))}

        {/* design */}
        <div style={groupTitle}>Design</div>
        <ColorField
          label="Background color"
          value={section.styles.backgroundColor}
          onChange={(value) => onUpdate(section.id, { styles: { backgroundColor: value } }, true)}
        />
        <ColorField
          label="Text color"
          value={section.styles.textColor}
          onChange={(value) => onUpdate(section.id, { styles: { textColor: value } }, true)}
        />
        <ColorField
          label="Accent / button color"
          value={section.styles.accentColor}
          onChange={(value) => onUpdate(section.id, { styles: { accentColor: value } }, true)}
        />

        <div style={labelStyle}>Alignment</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {["left", "center", "right"].map((align) => (
            <button
              key={align}
              onClick={() => onUpdate(section.id, { styles: { align } })}
              style={{
                flex: 1,
                padding: "7px 0",
                fontSize: 12.5,
                fontWeight: 600,
                borderRadius: 6,
                cursor: "pointer",
                border: "1px solid " + (section.styles.align === align ? "#2563eb" : "#cbd5e1"),
                background: section.styles.align === align ? "#dbeafe" : "white",
                color: section.styles.align === align ? "#1e40af" : "#475569",
                textTransform: "capitalize",
              }}
            >
              {align}
            </button>
          ))}
        </div>

        <div style={labelStyle}>
          Vertical spacing <span style={{ color: "#94a3b8", fontWeight: 500 }}>({section.styles.paddingY}px)</span>
        </div>
        <input
          type="range"
          min={0}
          max={160}
          step={8}
          value={section.styles.paddingY}
          onChange={(e) => onUpdate(section.id, { styles: { paddingY: Number(e.target.value) } }, true)}
          style={{ width: "100%", marginBottom: 16 }}
        />
      </div>
    </div>
  );
}

/* --------------------------------- fields --------------------------------- */

function Field({ field, value, onChange }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={labelStyle}>{field.label}</div>
      {field.kind === "textarea" ? (
        <textarea rows={3} value={value ?? ""} onChange={(e) => onChange(e.target.value)} style={{ ...inputStyle, resize: "vertical" }} />
      ) : field.kind === "number" ? (
        <input
          type="number"
          value={value === "" || value == null ? "" : value}
          placeholder="—"
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          style={inputStyle}
        />
      ) : (
        <>
          <input
            type="text"
            value={value ?? ""}
            placeholder={field.kind === "url" ? "https:// or #anchor" : field.kind === "image" ? "https://…/image.jpg" : ""}
            onChange={(e) => onChange(e.target.value)}
            style={inputStyle}
          />
          {field.kind === "image" && value ? (
            <img
              src={value}
              alt=""
              style={{ marginTop: 6, width: "100%", maxHeight: 90, objectFit: "cover", borderRadius: 6, border: "1px solid #e2e8f0", display: "block" }}
            />
          ) : null}
        </>
      )}
    </div>
  );
}

function ColorField({ label, value, onChange }) {
  const [text, setText] = useState(value);
  const lastValue = useRef(value);
  if (lastValue.current !== value) {
    // External change (undo/redo/section switch) — resync the hex text box.
    lastValue.current = value;
    if (text !== value) setText(value);
  }
  function commitText(raw) {
    setText(raw);
    if (/^#[0-9a-fA-F]{6}$/.test(raw)) onChange(raw.toLowerCase());
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
      <input type="color" value={value} onChange={(e) => commitText(e.target.value)} style={{ width: 34, height: 30, padding: 0, border: "1px solid #cbd5e1", borderRadius: 6, cursor: "pointer", background: "white" }} />
      <div style={{ flex: 1 }}>
        <div style={{ ...labelStyle, marginBottom: 2 }}>{label}</div>
        <input type="text" value={text} onChange={(e) => commitText(e.target.value)} style={{ ...inputStyle, padding: "5px 8px", fontFamily: "ui-monospace, monospace", fontSize: 12 }} />
      </div>
    </div>
  );
}

/* ------------------------------- list editor ------------------------------- */

function ListEditor({ section, list, focusItemId, onUpdate, onFocusItemHandled }) {
  const ops = makeListOps(section, list.key, onUpdate);
  const [expandedId, setExpandedId] = useState(null);
  const focusRef = useRef(null);

  // A product (or other list item) was clicked in the canvas: expand + scroll.
  useEffect(() => {
    if (!focusItemId) return;
    if (ops.items.some((item) => item.id === focusItemId)) {
      setExpandedId(focusItemId);
      onFocusItemHandled?.();
      setTimeout(() => focusRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 30);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusItemId]);

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={groupTitle}>{list.label} ({ops.items.length})</div>
      {ops.items.map((item, index) => {
        const expanded = expandedId === item.id;
        const title = item[list.labelKey] || `${list.label} ${index + 1}`;
        return (
          <div
            key={item.id}
            ref={expanded ? focusRef : null}
            style={{ border: "1px solid " + (expanded ? "#93c5fd" : "#e2e8f0"), borderRadius: 8, marginBottom: 6, background: expanded ? "#f8fbff" : "white" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 8px" }}>
              <button
                onClick={() => setExpandedId(expanded ? null : item.id)}
                style={{ ...listBtn, flex: 1, textAlign: "left", fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                title="Edit"
              >
                {expanded ? "▾" : "▸"} {title}
              </button>
              <button style={listBtn} title="Move up" disabled={index === 0} onClick={() => ops.move(index, index - 1)}>↑</button>
              <button style={listBtn} title="Move down" disabled={index === ops.items.length - 1} onClick={() => ops.move(index, index + 1)}>↓</button>
              <button style={listBtn} title="Duplicate" onClick={() => {
                const copy = ops.duplicate(item.id, () => uid("item"));
                if (copy) setExpandedId(copy.id);
              }}>⧉</button>
              <button
                style={{ ...listBtn, color: "#dc2626" }}
                title="Delete"
                onClick={() => {
                  if (window.confirm(`Delete “${title}”?`)) ops.remove(item.id);
                }}
              >
                ✕
              </button>
            </div>
            {expanded ? (
              <div style={{ padding: "4px 10px 10px", borderTop: "1px solid #e8eef6" }}>
                {list.fields.map((field) => (
                  <Field
                    key={field.key}
                    field={field}
                    value={item[field.key]}
                    onChange={(value) => ops.update(item.id, { [field.key]: value }, true)}
                  />
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
      <button
        onClick={() => {
          const item = ops.add(list.newItem);
          setExpandedId(item.id);
        }}
        style={{
          width: "100%",
          padding: "8px 10px",
          background: "#eff6ff",
          color: "#1d4ed8",
          border: "1px dashed #93c5fd",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: 650,
          fontSize: 12.5,
        }}
      >
        {list.addLabel}
      </button>
    </div>
  );
}

/* --------------------------------- styles --------------------------------- */

const labelStyle = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "#64748b",
  marginBottom: 4,
};

const groupTitle = {
  fontSize: 11.5,
  fontWeight: 800,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "#334155",
  borderTop: "1px solid #e2e8f0",
  paddingTop: 14,
  marginTop: 4,
  marginBottom: 10,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "8px 10px",
  fontSize: 13,
  border: "1px solid #cbd5e1",
  borderRadius: 6,
  fontFamily: "inherit",
  color: "#0f172a",
  background: "white",
};

const headerBtn = {
  padding: "4px 7px",
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 13,
};

const listBtn = {
  padding: "3px 5px",
  background: "transparent",
  border: 0,
  cursor: "pointer",
  fontSize: 12,
  color: "#64748b",
  borderRadius: 4,
};
