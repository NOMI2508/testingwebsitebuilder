// Incremental parser for the model's file-marker protocol.
//
//   ===FILE:src/App.jsx===
//   ...file content...
//   ===END_FILE===
//
// Design goals (Phase 9):
// - Handle markers split across arbitrary stream chunks ("===FI" | "LE:...").
// - Handle multiple files inside one chunk.
// - Never lose or duplicate characters.
// - Never treat a file as complete until ===END_FILE=== is seen.
// - Reject paths that are not approved (still consume their body to stay in sync).
//
// The parser is IO-free: `feed(chunk)` returns an array of events and the
// caller decides what to do (write files, emit SSE, update UI). This keeps the
// module pure and unit-testable, and lets the same code run on server + client.
//
// Event shapes returned by feed()/end():
//   { type: "file-start",    path, approved }
//   { type: "file-delta",    path, approved, text }
//   { type: "file-complete", path, approved, content }
//   { type: "rejected-path", path }   // emitted once when an unapproved file starts

// Marker whitespace is bounded so the maximum marker length is finite; the tail
// we retain while scanning MUST be >= the longest incomplete marker or we could
// leak a marker prefix as content and never detect the terminator.
//   END marker max length: 8 + 4 + 8 + 4 + 8 = 32  ->  keep 40 (> max)
const END_TAIL_KEEP = 40;
// OUTSIDE state only holds preamble/whitespace between files (spec: none). We
// keep a generous tail so a partial open marker (===FILE:<long/path>) is never
// chopped, and only truncate to bound memory on pathological input.
const OUTSIDE_MAX = 65536;
const OUTSIDE_KEEP = 1024;

// The trailing newline is REQUIRED: it marks the unambiguous end of the header
// so that, when chunks split right after "===", we wait for the newline instead
// of leaking a stray leading newline into the file body.
const OPEN_RE = /={3,8}[ \t]{0,4}FILE[ \t]{0,4}:[ \t]*([^\n=]+?)[ \t]*={3,8}[ \t]*\r?\n/;
const END_RE = /={3,8}[ \t]{0,4}END_FILE[ \t]{0,4}={3,8}/;

function normalizeContent(content) {
  // Drop exactly one leading newline (the one right after the open marker) and
  // exactly one trailing newline (the one right before the END marker). All
  // other interior/intentional whitespace is preserved.
  return content.replace(/^\r?\n/, "").replace(/\r?\n$/, "");
}

export class FileStreamParser {
  // isApproved: (path) => boolean. Defaults to accepting everything.
  constructor(isApproved) {
    this.isApproved = typeof isApproved === "function" ? isApproved : () => true;
    this.buffer = "";
    this.inFile = false;
    this.currentPath = null;
    this.currentApproved = true;
    this.currentContent = "";
    this.suppressDelta = 0; // chars already shown to the client (resume tail)
  }

  // Pre-seed the parser into the middle of a file (used when resuming an
  // interrupted file). The trailing window of the existing content is placed
  // into the scan buffer so an ===END_FILE=== marker split across the
  // interruption point can be rejoined; that tail is NOT re-emitted as deltas.
  seedInFile(path, existingContent, approved = true) {
    const content = typeof existingContent === "string" ? existingContent : "";
    const keep = Math.min(content.length, END_TAIL_KEEP);
    this.inFile = true;
    this.currentPath = path;
    this.currentApproved = approved;
    this.currentContent = content.slice(0, content.length - keep);
    this.buffer = content.slice(content.length - keep);
    this.suppressDelta = keep;
  }

  feed(chunk) {
    if (typeof chunk === "string" && chunk.length) {
      this.buffer += chunk;
    }
    const events = [];
    let progressed = true;
    while (progressed) {
      progressed = this.inFile
        ? this._stepInside(events)
        : this._stepOutside(events);
    }
    return events;
  }

  _emitDelta(events, piece) {
    if (!piece) return;
    this.currentContent += piece;
    let emit = piece;
    if (this.suppressDelta > 0) {
      const skip = Math.min(this.suppressDelta, emit.length);
      this.suppressDelta -= skip;
      emit = emit.slice(skip);
    }
    if (emit && this.currentApproved) {
      events.push({ type: "file-delta", path: this.currentPath, approved: true, text: emit });
    }
  }

  _stepOutside(events) {
    const m = OPEN_RE.exec(this.buffer);
    if (m) {
      const path = m[1].trim();
      const approved = this.isApproved(path);
      this.inFile = true;
      this.currentPath = path;
      this.currentApproved = approved;
      this.currentContent = "";
      this.suppressDelta = 0;
      this.buffer = this.buffer.slice(m.index + m[0].length);
      if (approved) {
        events.push({ type: "file-start", path, approved: true });
      } else {
        events.push({ type: "rejected-path", path });
        events.push({ type: "file-start", path, approved: false });
      }
      return true;
    }

    // No complete open marker yet. Retain a generous tail (could be a partial
    // marker); only truncate on pathological preamble to bound memory.
    if (this.buffer.length > OUTSIDE_MAX) {
      this.buffer = this.buffer.slice(this.buffer.length - OUTSIDE_KEEP);
    }
    return false;
  }

  _stepInside(events) {
    const m = END_RE.exec(this.buffer);
    if (m) {
      this._emitDelta(events, this.buffer.slice(0, m.index));
      const content = normalizeContent(this.currentContent);
      events.push({
        type: "file-complete",
        path: this.currentPath,
        approved: this.currentApproved,
        content,
      });
      this.buffer = this.buffer.slice(m.index + m[0].length);
      this.inFile = false;
      this.currentPath = null;
      this.currentContent = "";
      this.currentApproved = true;
      this.suppressDelta = 0;
      return true;
    }

    // No end marker yet. Emit everything except a tail that could be a partial
    // end marker, so we never leak a prefix of the terminator.
    if (this.buffer.length > END_TAIL_KEEP) {
      const piece = this.buffer.slice(0, this.buffer.length - END_TAIL_KEEP);
      this._emitDelta(events, piece);
      this.buffer = this.buffer.slice(this.buffer.length - END_TAIL_KEEP);
    }
    return false;
  }

  hasOpenFile() {
    return this.inFile;
  }

  // Freshest content of the currently open (incomplete) file, including the
  // retained tail. Used to persist the partial-file checkpoint.
  openFileContent() {
    return this.inFile ? this.currentContent + this.buffer : "";
  }

  openFilePath() {
    return this.inFile ? this.currentPath : null;
  }
}
