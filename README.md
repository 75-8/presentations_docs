# Presentations

Markdown-first presentation repository — authors write in [Marp](https://marp.app)-compatible Markdown, and GitHub Actions automatically builds and publishes everything to GitHub Pages.

---

## Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Git | any |
| Node.js | ≥ 20 |
| npm | ≥ 10 (bundled with Node 20) |

### Setup

```bash
git clone <this-repo>
cd presentations_docs
npm ci
```

### Create a new presentation

```bash
# 1. Create a directory for your presentation
cp -r templates/presentation-template.md presentations/my-talk/slides.md
mkdir -p presentations/my-talk/assets

# 2. Edit the Markdown
$EDITOR presentations/my-talk/slides.md

# 3. Build and preview locally
npm run build
npx serve dist
```

### Local development (watch mode)

```bash
npm run dev
# Opens http://localhost:8080 — hot-reloads on save
```

---

## Repository Structure

```
presentations_docs/
│
├── presentations/          # One subdirectory per presentation
│   └── sample/
│       ├── slides.md       # Marp Markdown source
│       └── assets/         # Images and other assets
│
├── themes/
│   ├── company.css         # Default company theme
│   └── conference.css      # High-contrast conference theme
│
├── templates/
│   ├── presentation-template.md   # Full starter template
│   └── title-slide-template.md    # Title-slide snippet
│
├── scripts/
│   ├── build.sh            # Converts all slides to HTML
│   └── generate-index.js   # Generates catalog page
│
├── dist/                   # Build output (gitignored)
│
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions CI/CD
│
└── package.json
```

---

## Authoring Slides

### Frontmatter

Every `slides.md` must start with a YAML frontmatter block:

```yaml
---
marp: true
theme: company      # company | conference
paginate: true

title: Your Presentation Title
date: 2026-06-26

# Optional
author: Your Name
description: One-line summary shown in the catalog.
tags:
  - Azure
  - AI
---
```

### Slide Layouts

Apply layouts with the `_class` directive on an HTML comment **before** the slide content:

| Directive | Layout |
|-----------|--------|
| `<!-- _class: title -->` | Title/closing slide — dark gradient, large text |
| `<!-- _class: section -->` | Section break — clean divider |
| `<!-- _class: two-column -->` | Two-column content grid |
| *(none)* | Default content slide |

### Supported Content

| Type | Syntax |
|------|--------|
| Bold | `**text**` |
| Emphasis | `*text*` |
| Inline code | `` `code` `` |
| Code block | ```` ```lang ... ``` ```` |
| Image | `![alt](assets/file.png)` |
| Sized image | `![w:600](assets/file.png)` |
| Speaker note | `<!-- note text -->` |
| Footnote | `[^1]: text` |
| Slide break | `---` |

---

## Themes

### company *(default)*

Navy / calm-blue palette. Suitable for internal tech talks and study sessions.

```yaml
theme: company
```

### conference

Teal / amber high-contrast palette. Suitable for external conferences.

```yaml
theme: conference
```

### Creating a new theme

1. Copy an existing theme file: `cp themes/company.css themes/mytheme.css`
2. Change the `/* @theme mytheme */` declaration at the top
3. Edit colors and styles as needed
4. Reference it in `slides.md`: `theme: mytheme`

---

## Build Scripts

### `npm run build`

Runs both `build.sh` and `generate-index.js`. Full build into `dist/`.

### `npm run build:slides`

Converts Markdown → HTML only (skips catalog).

### `npm run build:index`

Regenerates the catalog `dist/index.html` only.

### `npm run dev`

Starts Marp's dev server on `presentations/sample/slides.md` with file watching. Change the path in `package.json → scripts.dev` to watch a different file.

---

## GitHub Pages Setup

### First-time configuration (do once)

1. Push this repository to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, select **Source: GitHub Actions**.
4. Save.

### Deployment

Every push to `main` triggers the workflow automatically:

```
push → build all slides → generate catalog → deploy to Pages
```

Manual trigger: **Actions → Build and Deploy to GitHub Pages → Run workflow**.

### Published URLs

```
https://<username>.github.io/<repo>/          # Catalog
https://<username>.github.io/<repo>/sample/   # Sample presentation
```

---

## Adding a Presentation (Checklist)

- [ ] Create `presentations/<slug>/` directory
- [ ] Copy template: `cp templates/presentation-template.md presentations/<slug>/slides.md`
- [ ] Create `presentations/<slug>/assets/` for images
- [ ] Edit `slides.md` — fill in frontmatter and content
- [ ] Build locally with `npm run build` and preview
- [ ] Commit and push to `main`

---

## License

MIT — see [LICENSE](LICENSE).