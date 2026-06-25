#!/usr/bin/env node
// =============================================================================
// scripts/generate-index.js
// Reads frontmatter from all presentations/*/slides.md and emits
// dist/index.html — a self-contained catalog page, no runtime dependencies.
// =============================================================================
"use strict";

const fs   = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const REPO_ROOT       = path.resolve(__dirname, "..");
const PRESENTATIONS   = path.join(REPO_ROOT, "presentations");
const DIST            = path.join(REPO_ROOT, "dist");

// ---------------------------------------------------------------------------
// Minimal YAML frontmatter parser
// Handles: string scalars, inline sequences (- item), quoted values.
// ---------------------------------------------------------------------------
function parseFrontmatter(src) {
  const match = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const block = match[1];
  const result = {};
  let currentKey = null;

  for (const raw of block.split(/\r?\n/)) {
    const line = raw.trimEnd();

    // Array item under a key
    if (/^\s+-\s+/.test(line) && currentKey) {
      const val = line.replace(/^\s+-\s+/, "").replace(/^['"]|['"]$/g, "");
      if (!Array.isArray(result[currentKey])) result[currentKey] = [];
      result[currentKey].push(val);
      continue;
    }

    // Key: value
    const kv = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)?$/);
    if (kv) {
      currentKey = kv[1];
      const raw_val = (kv[2] || "").replace(/^['"]|['"]$/g, "").trim();
      result[currentKey] = raw_val === "" ? null : raw_val;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Discover presentations
// ---------------------------------------------------------------------------
function discoverPresentations() {
  if (!fs.existsSync(PRESENTATIONS)) return [];

  const entries = fs.readdirSync(PRESENTATIONS, { withFileTypes: true });
  const list = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const slidesPath = path.join(PRESENTATIONS, entry.name, "slides.md");
    if (!fs.existsSync(slidesPath)) continue;

    const src  = fs.readFileSync(slidesPath, "utf8");
    const meta = parseFrontmatter(src);

    list.push({
      name:        entry.name,
      title:       meta.title       || entry.name,
      date:        meta.date        || "",
      author:      meta.author      || "",
      description: meta.description || "",
      tags:        Array.isArray(meta.tags) ? meta.tags : (meta.tags ? [meta.tags] : []),
      href:        `./${entry.name}/`,
    });
  }

  // Sort: newest first, then alphabetical
  list.sort((a, b) => {
    if (a.date && b.date) return b.date.localeCompare(a.date);
    if (a.date) return -1;
    if (b.date) return  1;
    return a.title.localeCompare(b.title);
  });

  return list;
}

// ---------------------------------------------------------------------------
// HTML generation
// ---------------------------------------------------------------------------
function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tagBadge(tag) {
  return `<span class="tag">${esc(tag)}</span>`;
}

function cardHTML(p) {
  const dateStr  = p.date   ? `<span class="date">${esc(p.date)}</span>` : "";
  const authorStr= p.author ? `<span class="author">by ${esc(p.author)}</span>` : "";
  const descStr  = p.description
    ? `<p class="description">${esc(p.description)}</p>` : "";
  const tagsStr  = p.tags.length
    ? `<div class="tags">${p.tags.map(tagBadge).join("")}</div>` : "";

  return `
    <a class="card" href="${esc(p.href)}" aria-label="${esc(p.title)}">
      <div class="card-body">
        <h2 class="card-title">${esc(p.title)}</h2>
        ${descStr}
        <div class="card-meta">${dateStr}${authorStr}</div>
        ${tagsStr}
      </div>
      <div class="card-arrow" aria-hidden="true">→</div>
    </a>`;
}

function buildHTML(presentations) {
  const now   = new Date().toISOString().slice(0, 10);
  const count = presentations.length;
  const cards = presentations.map(cardHTML).join("\n");

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Presentation Catalog</title>
  <meta name="description" content="A catalog of presentations published via GitHub Pages.">
  <style>
    /* ------------------------------------------------------------------ *
     * Reset & base
     * ------------------------------------------------------------------ */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --c-bg:        #0f172a;
      --c-surface:   #1e293b;
      --c-surface2:  #263348;
      --c-border:    #334155;
      --c-primary:   #38bdf8;
      --c-accent:    #818cf8;
      --c-text:      #e2e8f0;
      --c-text-muted:#94a3b8;
      --c-tag-bg:    #1e3a5f;
      --c-tag-text:  #7dd3fc;
      --font: "BIZ UDPGothic","Yu Gothic","Hiragino Sans","Noto Sans JP",sans-serif;
      --radius: 12px;
    }

    html { scroll-behavior: smooth; }

    body {
      font-family:      var(--font);
      background:       var(--c-bg);
      color:            var(--c-text);
      min-height:       100vh;
      line-height:      1.6;
      -webkit-font-smoothing: antialiased;
    }

    /* ------------------------------------------------------------------ *
     * Layout
     * ------------------------------------------------------------------ */
    .wrapper {
      max-width: 900px;
      margin:    0 auto;
      padding:   0 24px;
    }

    /* ------------------------------------------------------------------ *
     * Header
     * ------------------------------------------------------------------ */
    header {
      padding:    56px 0 40px;
      border-bottom: 1px solid var(--c-border);
      margin-bottom: 40px;
    }

    .site-badge {
      display:        inline-flex;
      align-items:    center;
      gap:            8px;
      font-size:      12px;
      font-weight:    600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color:          var(--c-primary);
      margin-bottom:  16px;
    }

    .site-badge::before {
      content:       "";
      display:       inline-block;
      width:         28px;
      height:        3px;
      background:    var(--c-primary);
      border-radius: 2px;
    }

    h1.site-title {
      font-size:     2.6rem;
      font-weight:   800;
      line-height:   1.15;
      letter-spacing: -0.02em;
      background:    linear-gradient(135deg, var(--c-primary) 0%, var(--c-accent) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 12px;
    }

    .site-subtitle {
      color:     var(--c-text-muted);
      font-size: 1rem;
    }

    .stats {
      margin-top:  20px;
      font-size:   0.85rem;
      color:       var(--c-text-muted);
    }

    /* ------------------------------------------------------------------ *
     * Card grid
     * ------------------------------------------------------------------ */
    .grid {
      display:               grid;
      grid-template-columns: 1fr;
      gap:                   16px;
      margin-bottom:         64px;
    }

    .card {
      display:         flex;
      align-items:     center;
      background:      var(--c-surface);
      border:          1px solid var(--c-border);
      border-radius:   var(--radius);
      padding:         24px 28px;
      text-decoration: none;
      color:           inherit;
      transition:      transform 0.15s ease, background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
      gap:             16px;
    }

    .card:hover {
      background:    var(--c-surface2);
      border-color:  var(--c-primary);
      transform:     translateY(-2px);
      box-shadow:    0 8px 30px rgba(56,189,248,0.12);
    }

    .card-body   { flex: 1; min-width: 0; }

    .card-title {
      font-size:   1.15rem;
      font-weight: 700;
      color:       var(--c-text);
      margin-bottom: 6px;
      white-space: nowrap;
      overflow:    hidden;
      text-overflow: ellipsis;
    }

    .card:hover .card-title { color: var(--c-primary); }

    .description {
      font-size:    0.88rem;
      color:        var(--c-text-muted);
      margin-bottom: 10px;
      display:       -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow:      hidden;
    }

    .card-meta {
      display:     flex;
      gap:         12px;
      font-size:   0.8rem;
      color:       var(--c-text-muted);
      margin-bottom: 10px;
      flex-wrap:   wrap;
    }

    .date::before   { content: "📅 "; }
    .author::before { content: "✍️ "; }

    .tags  { display: flex; flex-wrap: wrap; gap: 6px; }

    .tag {
      background:    var(--c-tag-bg);
      color:         var(--c-tag-text);
      font-size:     0.72rem;
      font-weight:   600;
      padding:       3px 10px;
      border-radius: 999px;
      letter-spacing: 0.03em;
    }

    .card-arrow {
      font-size:  1.4rem;
      color:      var(--c-border);
      transition: color 0.15s ease, transform 0.15s ease;
      flex-shrink: 0;
    }

    .card:hover .card-arrow {
      color:     var(--c-primary);
      transform: translateX(4px);
    }

    /* Empty state */
    .empty {
      text-align:  center;
      padding:     80px 0;
      color:       var(--c-text-muted);
    }

    .empty p { margin-top: 12px; font-size: 0.9rem; }

    /* ------------------------------------------------------------------ *
     * Footer
     * ------------------------------------------------------------------ */
    footer {
      border-top:  1px solid var(--c-border);
      padding:     24px 0;
      font-size:   0.78rem;
      color:       var(--c-text-muted);
      text-align:  center;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <header>
      <div class="site-badge">Presentations</div>
      <h1 class="site-title">Presentation Catalog</h1>
      <p class="site-subtitle">Built with Marp · Published via GitHub Pages</p>
      <p class="stats">${count} presentation${count !== 1 ? "s" : ""} · Last updated ${now}</p>
    </header>

    <main>
      <div class="grid" role="list" aria-label="Presentations">
        ${count > 0 ? cards : `
        <div class="empty" role="listitem">
          <p>No presentations found yet.</p>
          <p>Add a directory under <code>presentations/</code> with a <code>slides.md</code> file.</p>
        </div>`}
      </div>
    </main>

    <footer>
      <p>Generated automatically · <a href="https://marp.app" style="color:inherit">Marp</a></p>
    </footer>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  console.log("=== Catalog Generator ===");

  const presentations = discoverPresentations();
  console.log(`Found ${presentations.length} presentation(s).`);

  if (!fs.existsSync(DIST)) {
    fs.mkdirSync(DIST, { recursive: true });
  }

  const html = buildHTML(presentations);
  const outPath = path.join(DIST, "index.html");
  fs.writeFileSync(outPath, html, "utf8");

  console.log(`Catalog written: ${outPath}`);
}

main();
