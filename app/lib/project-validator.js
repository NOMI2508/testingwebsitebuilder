// Static validation of a generated project (Phase 12).
//
// There is no server-side bundler (generated code only runs in the iframe via
// CDN), so we do structural checks that catch the most common failures before
// the preview: missing files, an unusable entry, unresolved relative imports,
// forbidden imports, empty components and leftover TODO/placeholder markers.
//
// Pure: takes the list of files + the plan and returns { ok, errors: [...] }.

import { validateRelPath, extnameOf } from "./file-path-validator";
import { parse } from "@babel/parser";

const FORBIDDEN_IMPORT_RE =
  /\bfrom\s+['"](next\/[^'"]+|react-dom(\/[^'"]*)?)['"]/;
const CREATE_ROOT_RE = /\bcreateRoot\s*\(/;
const MANTINE_PROVIDER_IMPORT_RE = /import[^;]*\bMantineProvider\b[^;]*from/;
const TODO_RE = /\b(TODO|FIXME)\b|PLACEHOLDER_TEXT/;
const DEFAULT_APP_RE = /export\s+default\s+(function\s+App\b|App\b|class\s+App\b)/;
const MANTINE_NAMED_IMPORT_RE = /import\s*\{([\s\S]*?)\}\s*from\s*['"]@mantine\/core['"]/g;
const REMOVED_MANTINE_EXPORTS = new Set([
  "Header",
  "Footer",
  "Navbar",
  "Aside",
  "MediaQuery",
]);
const ALLOWED_PACKAGES = new Set([
  "react",
  "@mantine/core",
  "@mantine/hooks",
  "@tabler/icons-react",
  // Backward compatibility for saved projects. New generations are prompted
  // to use section anchors instead of a routing package.
  "react-router-dom",
]);

// react-icons ships one ES module per icon pack (react-icons/fa, /md, /io5, …).
// Icons must be imported from a subpackage, never the bare "react-icons".
const REACT_ICONS_PACKS = new Set([
  "ai", "bi", "bs", "cg", "ci", "di", "fa", "fa6", "fc", "fi", "gi", "go",
  "gr", "hi", "hi2", "im", "io", "io5", "lia", "lu", "md", "pi", "ri", "rx",
  "si", "sl", "tb", "tfi", "ti", "vsc", "wi",
]);
// Returns the pack name for a "react-icons/<pack>" specifier, else null.
function reactIconsPack(spec) {
  const m = /^react-icons\/([a-z0-9]+)$/.exec(spec);
  return m ? m[1] : null;
}

function dirOf(path) {
  const idx = path.lastIndexOf("/");
  return idx === -1 ? "" : path.slice(0, idx);
}

// Resolve a relative import specifier against the importing file's directory
// and return the normalized target path (no extension resolution yet).
function resolveRelative(fromPath, spec) {
  const base = dirOf(fromPath).split("/").filter(Boolean);
  const parts = spec.split("/");
  for (const part of parts) {
    if (part === "" || part === ".") continue;
    if (part === "..") base.pop();
    else base.push(part);
  }
  return base.join("/");
}

function resolvedImportPath(target, known) {
  const candidates = extnameOf(target)
    ? [target]
    : [target, `${target}.js`, `${target}.jsx`, `${target}/index.js`, `${target}/index.jsx`];
  return candidates.find((candidate) => known.has(candidate)) || null;
}

const JS_GLOBALS = new Set([
  "React", "undefined", "NaN", "Infinity", "arguments", "console", "window", "document",
  "navigator", "localStorage", "sessionStorage", "location", "history", "fetch",
  "setTimeout", "clearTimeout", "setInterval", "clearInterval", "requestAnimationFrame",
  "Object", "Array", "String", "Number", "Boolean", "BigInt", "Symbol", "Date",
  "Math", "JSON", "Intl", "RegExp", "Error", "TypeError", "Promise", "Map", "Set",
  "WeakMap", "WeakSet", "URL", "URLSearchParams", "FormData", "File", "Blob",
  "Event", "CustomEvent", "HTMLElement", "AbortController", "FileReader", "Image",
  "globalThis", "crypto", "performance", "alert", "confirm", "structuredClone", "CSS",
  "Element", "Node", "MutationObserver", "IntersectionObserver", "ResizeObserver",
  "getComputedStyle", "matchMedia", "scrollTo", "requestIdleCallback", "cancelIdleCallback",
]);

function addPatternBindings(pattern, bindings) {
  if (!pattern) return;
  if (pattern.type === "Identifier") bindings.add(pattern.name);
  else if (pattern.type === "RestElement") addPatternBindings(pattern.argument, bindings);
  else if (pattern.type === "AssignmentPattern") addPatternBindings(pattern.left, bindings);
  else if (pattern.type === "ObjectPattern") {
    for (const property of pattern.properties || []) {
      addPatternBindings(property.type === "RestElement" ? property.argument : property.value, bindings);
    }
  } else if (pattern.type === "ArrayPattern") {
    for (const item of pattern.elements || []) addPatternBindings(item, bindings);
  }
}

function declarationNames(declaration) {
  const names = new Set();
  if (!declaration) return names;
  if (declaration.id) addPatternBindings(declaration.id, names);
  if (declaration.type === "VariableDeclaration") {
    for (const item of declaration.declarations || []) addPatternBindings(item.id, names);
  }
  return names;
}

function isReferenceIdentifier(node, parent, key) {
  if (!parent) return false;
  if (["ImportSpecifier", "ImportDefaultSpecifier", "ImportNamespaceSpecifier"].includes(parent.type)) return false;
  if (parent.type === "VariableDeclarator" && key === "id") return false;
  if (["FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression", "ObjectMethod", "ClassMethod", "ClassPrivateMethod"].includes(parent.type)) {
    if (key === "id" || key === "params") return false;
  }
  if (["ClassDeclaration", "ClassExpression"].includes(parent.type) && key === "id") return false;
  // A non-computed property name is not a free identifier. This must cover
  // OptionalMemberExpression too (obj?.name) — otherwise "name", "title", etc.
  // after "?." get wrongly flagged as undeclared identifiers.
  if (
    (parent.type === "MemberExpression" || parent.type === "OptionalMemberExpression") &&
    key === "property" &&
    !parent.computed
  ) {
    return false;
  }
  if (["ObjectProperty", "ObjectMethod", "ClassMethod", "ClassPrivateMethod", "ClassProperty", "ClassPrivateProperty"].includes(parent.type) && key === "key" && !parent.computed && !parent.shorthand) return false;
  if (parent.type === "MetaProperty") return false;
  if (["ExportSpecifier", "LabeledStatement", "BreakStatement", "ContinueStatement"].includes(parent.type)) return false;
  return true;
}

function analyzeModule(content) {
  const ast = parse(content, {
    sourceType: "module",
    plugins: ["jsx", "objectRestSpread", "optionalChaining", "nullishCoalescingOperator"],
  });
  const bindings = new Set(JS_GLOBALS);
  const references = new Set();
  const jsxComponents = new Set();
  const imports = [];
  const moduleSources = new Set();
  const namedExports = new Set();
  let hasDefaultExport = false;
  let defaultExportName = null;

  for (const statement of ast.program.body) {
    if (statement.type === "ImportDeclaration") {
      moduleSources.add(statement.source.value);
      for (const specifier of statement.specifiers) {
        bindings.add(specifier.local.name);
        imports.push({
          source: statement.source.value,
          kind: specifier.type === "ImportDefaultSpecifier" ? "default" : specifier.type === "ImportNamespaceSpecifier" ? "namespace" : "named",
          imported: specifier.type === "ImportSpecifier" ? (specifier.imported.name || specifier.imported.value) : specifier.type === "ImportDefaultSpecifier" ? "default" : "*",
          local: specifier.local.name,
        });
      }
    }
    if (statement.type === "ExportDefaultDeclaration") {
      hasDefaultExport = true;
      const declaration = statement.declaration;
      if (declaration?.type === "Identifier") defaultExportName = declaration.name;
      else if (declaration?.id?.name) defaultExportName = declaration.id.name;
    }
    if (statement.type === "ExportNamedDeclaration") {
      if (statement.source?.value) moduleSources.add(statement.source.value);
      for (const name of declarationNames(statement.declaration)) namedExports.add(name);
      for (const specifier of statement.specifiers || []) {
        const exported = specifier.exported?.name || specifier.exported?.value;
        if (exported === "default") {
          hasDefaultExport = true;
          defaultExportName = specifier.local?.name || null;
        } else if (exported) namedExports.add(exported);
      }
    }
    if (statement.type === "ExportAllDeclaration" && statement.source?.value) {
      moduleSources.add(statement.source.value);
    }
  }

  function walk(node, parent = null, key = null) {
    if (!node || typeof node !== "object") return;
    if (["FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression", "ObjectMethod", "ClassMethod", "ClassPrivateMethod"].includes(node.type)) {
      if (node.id) addPatternBindings(node.id, bindings);
      for (const param of node.params || []) addPatternBindings(param, bindings);
    } else if (["ClassDeclaration", "ClassExpression"].includes(node.type) && node.id) {
      addPatternBindings(node.id, bindings);
    } else if (node.type === "VariableDeclarator") {
      addPatternBindings(node.id, bindings);
    } else if (node.type === "CatchClause") {
      addPatternBindings(node.param, bindings);
    } else if (node.type === "JSXOpeningElement") {
      let name = node.name;
      while (name?.type === "JSXMemberExpression") name = name.object;
      if (name?.type === "JSXIdentifier" && /^[A-Z]/.test(name.name)) jsxComponents.add(name.name);
    } else if (node.type === "Identifier" && isReferenceIdentifier(node, parent, key)) {
      references.add(node.name);
    }
    for (const [childKey, value] of Object.entries(node)) {
      if (["loc", "start", "end", "extra", "comments", "errors"].includes(childKey)) continue;
      if (Array.isArray(value)) {
        for (const child of value) walk(child, node, childKey);
      } else if (value && typeof value === "object" && typeof value.type === "string") {
        walk(value, node, childKey);
      }
    }
  }
  walk(ast.program);

  return {
    bindings,
    imports,
    moduleSources,
    namedExports,
    hasDefaultExport,
    defaultExportName,
    jsxComponents,
    undefinedReferences: [...references].filter((name) => !bindings.has(name)),
    undefinedJsx: [...jsxComponents].filter((name) => !bindings.has(name)),
  };
}

function orphanedCompoundComponents(content) {
  const errors = [];
  for (const root of ["Tabs", "Accordion", "Menu", "Popover", "Stepper", "Timeline"]) {
    const childRe = new RegExp(`<${root}\\.`);
    if (!childRe.test(content)) continue;
    const wrappedRe = new RegExp(
      `<${root}\\b[^>]*>[\\s\\S]*<${root}\\.[\\s\\S]*<\\/${root}>`
    );
    if (!wrappedRe.test(content)) {
      errors.push(`${root} compound components must be rendered inside a matching <${root}> parent.`);
    }
  }
  return errors;
}

export function validateProject(files, plan) {
  const errors = [];
  const list = Array.isArray(files) ? files.filter((f) => f && typeof f.path === "string") : [];
  const known = new Set(list.map((f) => f.path));
  const byPath = new Map(list.map((f) => [f.path, typeof f.content === "string" ? f.content : ""]));

  const pushErr = (file, message) => errors.push({ file, message });
  const analysisByPath = new Map();
  for (const file of list) {
    const ext = extnameOf(file.path);
    if (ext !== ".js" && ext !== ".jsx") continue;
    try {
      analysisByPath.set(file.path, analyzeModule(byPath.get(file.path) || ""));
    } catch (error) {
      pushErr(file.path, `JavaScript/JSX syntax error: ${error?.message || String(error)}`);
    }
  }

  // 1) Every planned file must exist and be safe.
  const planned = plan && Array.isArray(plan.files) ? plan.files : [];
  for (const pf of planned) {
    const p = pf && typeof pf.path === "string" ? pf.path : "";
    const v = validateRelPath(p);
    if (!v.ok) {
      pushErr(p, `Planned path is unsafe: ${v.error}`);
      continue;
    }
    if (!known.has(v.path)) pushErr(v.path, "Planned file is missing from the generated project.");
  }

  // 2) Entry file must exist and export a default App component.
  const entry = (plan && typeof plan.entryFile === "string" && plan.entryFile) || "src/App.jsx";
  if (!known.has(entry)) {
    pushErr(entry, "Entry file is missing.");
  } else {
    const entryContent = byPath.get(entry) || "";
    if (!DEFAULT_APP_RE.test(entryContent)) {
      pushErr(entry, "Entry file must export a default App component.");
    }
  }

  // 3) Per-file structural checks.
  for (const f of list) {
    const content = byPath.get(f.path) || "";
    const ext = extnameOf(f.path);

    const v = validateRelPath(f.path);
    if (!v.ok) {
      pushErr(f.path, `Unsafe path: ${v.error}`);
      continue;
    }

    if (ext === ".jsx" && content.trim().length < 20) {
      pushErr(f.path, "Component file looks empty.");
    }
    const analysis = analysisByPath.get(f.path);
    if (analysis) {
      if (ext === ".jsx") for (const name of analysis.undefinedJsx) {
        pushErr(f.path, `JSX component "${name}" is used but not imported or declared.`);
      }
      for (const name of analysis.undefinedReferences) {
        pushErr(f.path, `Identifier "${name}" is used but not imported or declared.`);
      }
      if (ext === ".jsx") for (const message of orphanedCompoundComponents(content)) {
        pushErr(f.path, message);
      }
      // A component file must expose a NAMED default export so the CDN-flatten
      // bundler can turn it into a top-level `function X`. The export name does
      // NOT need to equal the filename — e.g. ThemeContext.jsx exporting a
      // ThemeProvider is a valid, common React idiom. Only anonymous defaults
      // (which the flatten bundler cannot express) or a missing default break.
      const baseName = f.path.split("/").pop().replace(/\.jsx$/, "");
      if (ext === ".jsx" && baseName !== "App" && /^[A-Z]/.test(baseName)) {
        if (!analysis.hasDefaultExport) {
          pushErr(f.path, `Component file "${baseName}.jsx" must have a default export.`);
        } else if (!analysis.defaultExportName) {
          pushErr(
            f.path,
            `The default export in "${baseName}.jsx" must be a named function or class (anonymous default exports break the preview bundler).`
          );
        }
      }
    }

    if (FORBIDDEN_IMPORT_RE.test(content)) {
      pushErr(f.path, "Forbidden import (next/* or react-dom) in preview code.");
    }
    if (CREATE_ROOT_RE.test(content)) {
      pushErr(f.path, "Generated code must not call createRoot.");
    }
    if (MANTINE_PROVIDER_IMPORT_RE.test(content)) {
      pushErr(f.path, "Generated code must not import MantineProvider.");
    }
    if (TODO_RE.test(content)) {
      pushErr(f.path, "Contains a TODO/FIXME/placeholder marker.");
    }

    let mantineImport;
    MANTINE_NAMED_IMPORT_RE.lastIndex = 0;
    while ((mantineImport = MANTINE_NAMED_IMPORT_RE.exec(content)) !== null) {
      for (const item of mantineImport[1].split(",")) {
        const imported = item.trim().split(/\s+as\s+/)[0];
        if (REMOVED_MANTINE_EXPORTS.has(imported)) {
          pushErr(
            f.path,
            `Mantine v7 does not export "${imported}". Use Box with component="${imported.toLowerCase()}" and responsive style props instead.`
          );
        }
      }
    }

    // 4) Static imports and re-exports must resolve to an approved package or file.
    if (analysis) for (const spec of analysis.moduleSources) {
      if (!spec.startsWith(".")) {
        const pack = reactIconsPack(spec);
        if (spec === "react-icons") {
          pushErr(
            f.path,
            `Import icons from a react-icons subpackage such as "react-icons/fa", not the bare "react-icons".`
          );
        } else if (spec.startsWith("react-icons/")) {
          if (!pack || !REACT_ICONS_PACKS.has(pack)) {
            pushErr(
              f.path,
              `Unknown react-icons pack "${spec}". Use a valid pack, e.g. react-icons/fa, react-icons/md, react-icons/io5, react-icons/bs, react-icons/fi or react-icons/tb.`
            );
          }
        } else if (!ALLOWED_PACKAGES.has(spec)) {
          pushErr(
            f.path,
            `Unsupported package import: "${spec}". Allowed: react, @mantine/core, @mantine/hooks, @tabler/icons-react, and react-icons/* icon packs.`
          );
        }
        continue;
      }
      const target = resolveRelative(f.path, spec);
      const resolved = resolvedImportPath(target, known);
      if (!resolved) {
        pushErr(f.path, `Unresolved relative import: "${spec}".`);
      }
    }

    if (analysis) {
      const importsByLocal = new Map(analysis.imports.map((item) => [item.local, item]));
      for (const jsxName of analysis.jsxComponents) {
        if (jsxName.startsWith("Icon")) {
          const binding = importsByLocal.get(jsxName);
          if (binding && binding.source !== "@tabler/icons-react") {
            pushErr(f.path, `Tabler icon "${jsxName}" must be imported from "@tabler/icons-react".`);
          }
        }
      }
      for (const item of analysis.imports) {
        if (item.source === "@tabler/icons-react" && item.kind === "named") {
          if (!item.imported.startsWith("Icon") || item.local !== item.imported) {
            pushErr(f.path, `Tabler icon import "${item.local}" must use its exact exported Icon* name.`);
          }
        }
        if (!item.source.startsWith(".")) continue;
        const target = resolvedImportPath(resolveRelative(f.path, item.source), known);
        if (!target) continue;
        const targetAnalysis = analysisByPath.get(target);
        if (!targetAnalysis) continue;
        if (item.kind === "default") {
          if (!targetAnalysis.hasDefaultExport) {
            pushErr(target, `${target} is imported as "${item.local}" but has no matching default export.`);
            continue;
          }
          // The flatten bundler strips imports, so the local name must equal the
          // target's default export declaration name (the filename is irrelevant).
          if (targetAnalysis.defaultExportName && item.local !== targetAnalysis.defaultExportName) {
            pushErr(
              f.path,
              `Default import "${item.local}" must match the default export name "${targetAnalysis.defaultExportName}" of ${target} (the preview flattens modules, so these names must match).`
            );
          }
        } else if (item.kind === "named" && !targetAnalysis.namedExports.has(item.imported)) {
          pushErr(f.path, `Named import "${item.imported}" is not exported by ${target}.`);
        }
      }
    }
  }

  return { ok: errors.length === 0, errors };
}
