"use client";

import { useMemo, useReducer, useRef } from "react";
import { createSection, createEmptySite, duplicateSection, normalizeSite } from "../../lib/builder/schema";

/*
 * Builder document state with undo/redo history.
 *
 * State shape: { past: BuilderSite[], present: BuilderSite, future: BuilderSite[], stamp }
 * `stamp` lets rapid edits to the SAME section (typing in a field) coalesce
 * into one history entry instead of one entry per keystroke.
 */

const HISTORY_LIMIT = 60;
const COALESCE_MS = 900;

function firstPage(site) {
  return site.pages[0] || { id: "home", name: "Home", sections: [] };
}

/** Replace the first page's sections immutably. */
function withSections(site, sections) {
  const pages = site.pages.slice();
  pages[0] = { ...firstPage(site), sections };
  return { ...site, pages };
}

function clampIndex(value, max) {
  return Math.max(0, Math.min(max, value));
}

function commit(state, nextPresent, coalesceKey = null) {
  if (nextPresent === state.present) return state;
  const now = Date.now();
  // Coalesce: same edit target within the window replaces the present without
  // growing history — undo then steps over the whole burst of keystrokes.
  if (coalesceKey && state.stamp && state.stamp.key === coalesceKey && now - state.stamp.at < COALESCE_MS) {
    return { ...state, present: nextPresent, future: [], stamp: { key: coalesceKey, at: now } };
  }
  const past = [...state.past, state.present].slice(-HISTORY_LIMIT);
  return { past, present: nextPresent, future: [], stamp: coalesceKey ? { key: coalesceKey, at: now } : null };
}

function reducer(state, action) {
  const sections = firstPage(state.present).sections;
  switch (action.type) {
    case "LOAD":
      return { past: [], present: normalizeSite(action.site), future: [], stamp: null };

    case "ADD_SECTION": {
      // The section object is prebuilt by the action creator so the reducer
      // stays pure (StrictMode double-invokes reducers) and the caller knows
      // the new id immediately.
      const index = clampIndex(action.index ?? sections.length, sections.length);
      const next = sections.slice();
      next.splice(index, 0, action.section);
      return commit(state, withSections(state.present, next));
    }

    case "UPDATE_SECTION": {
      let changed = false;
      const next = sections.map((section) => {
        if (section.id !== action.sectionId) return section;
        changed = true;
        return {
          ...section,
          ...(action.patch.content ? { content: { ...section.content, ...action.patch.content } } : {}),
          ...(action.patch.styles ? { styles: { ...section.styles, ...action.patch.styles } } : {}),
          ...(action.patch.settings ? { settings: { ...section.settings, ...action.patch.settings } } : {}),
        };
      });
      if (!changed) return state;
      return commit(state, withSections(state.present, next), action.coalesceKey || null);
    }

    case "REMOVE_SECTION": {
      const next = sections.filter((section) => section.id !== action.sectionId);
      if (next.length === sections.length) return state;
      return commit(state, withSections(state.present, next));
    }

    case "MOVE_SECTION": {
      const from = action.from;
      let to = action.to;
      if (from === to || from < 0 || from >= sections.length) return state;
      const next = sections.slice();
      const [moved] = next.splice(from, 1);
      if (to > from) to -= 1; // removal shifted the target slot
      next.splice(clampIndex(to, next.length), 0, moved);
      return commit(state, withSections(state.present, next));
    }

    case "UNDO": {
      if (!state.past.length) return state;
      const past = state.past.slice(0, -1);
      const present = state.past[state.past.length - 1];
      return { past, present, future: [state.present, ...state.future], stamp: null };
    }

    case "REDO": {
      if (!state.future.length) return state;
      const [present, ...future] = state.future;
      return { past: [...state.past, state.present].slice(-HISTORY_LIMIT), present, future, stamp: null };
    }

    default:
      return state;
  }
}

export function useBuilderState() {
  const [state, dispatch] = useReducer(reducer, null, () => ({
    past: [],
    present: createEmptySite(),
    future: [],
    stamp: null,
  }));

  // Action creators read current state through a ref so they can stay stable
  // (useMemo []) while still building objects like duplicates outside the
  // reducer — keeping the reducer pure for StrictMode.
  const stateRef = useRef(state);
  stateRef.current = state;

  const actions = useMemo(
    () => ({
      load: (site) => dispatch({ type: "LOAD", site }),
      /** Returns the new section's id. */
      addSection: (sectionType, index) => {
        const section = createSection(sectionType);
        dispatch({ type: "ADD_SECTION", section, index });
        return section.id;
      },
      /** patch = { content?, styles?, settings? }; coalesce=true merges rapid edits into one undo step. */
      updateSection: (sectionId, patch, coalesce = false) =>
        dispatch({ type: "UPDATE_SECTION", sectionId, patch, coalesceKey: coalesce ? `sec:${sectionId}` : null }),
      removeSection: (sectionId) => dispatch({ type: "REMOVE_SECTION", sectionId }),
      /** Returns the copy's id, or null when the source is gone. */
      duplicateSection: (sectionId) => {
        const current = firstPage(stateRef.current.present).sections;
        const index = current.findIndex((section) => section.id === sectionId);
        if (index < 0) return null;
        const copy = duplicateSection(current[index]);
        dispatch({ type: "ADD_SECTION", section: copy, index: index + 1 });
        return copy.id;
      },
      moveSection: (from, to) => dispatch({ type: "MOVE_SECTION", from, to }),
      undo: () => dispatch({ type: "UNDO" }),
      redo: () => dispatch({ type: "REDO" }),
    }),
    []
  );

  const site = state.present;
  const page = firstPage(site);
  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  return { site, page, sections: page.sections, actions, canUndo, canRedo };
}

/** Convenience: build an updater for one list-typed content key (products, links…). */
export function makeListOps(section, listKey, updateSection) {
  const items = section.content[listKey] || [];
  const set = (nextItems) => updateSection(section.id, { content: { [listKey]: nextItems } });
  return {
    items,
    add: (factory) => {
      const item = factory();
      set([...items, item]);
      return item;
    },
    update: (itemId, patch, coalesce = false) =>
      updateSection(
        section.id,
        { content: { [listKey]: items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)) } },
        coalesce
      ),
    remove: (itemId) => set(items.filter((it) => it.id !== itemId)),
    duplicate: (itemId, makeId) => {
      const index = items.findIndex((it) => it.id === itemId);
      if (index < 0) return null;
      const copy = { ...items[index], id: makeId() };
      const next = items.slice();
      next.splice(index + 1, 0, copy);
      set(next);
      return copy;
    },
    move: (from, to) => {
      if (from === to || from < 0 || from >= items.length || to < 0 || to >= items.length) return;
      const next = items.slice();
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      set(next);
    },
  };
}
