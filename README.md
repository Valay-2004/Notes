# VAULT — Notes Viewer

**Live site → [valay-2004.github.io/Notes](https://valay-2004.github.io/Notes/)**

A lightweight, Obsidian-like static note viewer built with vanilla HTML/CSS/JavaScript.

---

## Features

- **Three-pane layout** — sidebar (file tree), centre (note content), right panel (TOC)
- **Five themes** — White, Ocean Dark, Tokyo Night, Obsidian Blue, AMOLED
- **Obsidian-style callouts** — `[!note]`, `[!warning]`, `[!tip]`, `[!danger]`, …
- **Syntax highlighting** — Java, Python, C++, JavaScript, SQL, Bash, JSON via Prism.js
- **Wikilinks** — `[[Note Name]]` and `[[Note Name|alias]]` resolved by name

---

## How to add a note

1. Add the `.md` file anywhere under `JAVA/`, `SQL/`, etc.
2. Run `node scripts/generate-manifest.js`
3. Commit and push — the [manifest workflow](.github/workflows/update-manifest.yml) will also re-run it automatically.

---

## File tree

```
Notes/
├── .github/
│   └── workflows/
│       └── update-manifest.yml   ← auto-updates manifest on push
├── JAVA/
│   ├── 01. Java Basics/
│   ├── 02. OOPS/
│   └── …
├── SQL/
│   └── 01. Beginner Level/
├── scripts/
│   └── generate-manifest.js
├── app.js
├── index.html
├── style.css
└── notes-manifest.json
```

---

## Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| [marked](https://marked.js.org) | latest (CDN) | Markdown → HTML |
| [Prism.js](https://prismjs.com) | 1.29.0 | Syntax highlighting |
| [Lucide](https://lucide.dev) | 0.462.0 (pinned) | Icons |
| [MathJax](https://www.mathjax.org) | 4 | LaTeX rendering |
| Google Fonts | — | Inter, JetBrains Mono |

