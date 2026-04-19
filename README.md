# Notes are Here

> Better to read these notes on obsidian (Since I created on it and it looks good there)

> In future I'll be adding static pages for my notes to render the same as obsidian :J

> [!NOTE]
> You can now view these notes on your browser as well :)
> Check it here → [Notes](https://valay-2004.github.io/Notes/)

<!-- # VAULT - Notes Viewer

A lightweight, Obsidian-like static note viewer built with vanilla HTML/CSS/JavaScript.

## Features

- **Three-pane layout**: Sidebar (file tree), center (note content), right panel (table of contents)
- **Responsive design**: Adapts to mobile, tablet, and desktop screens
- **Multiple themes**: Light, Dark, Sepia, Ocean with instant switching
- **Full markdown support**: Headings, lists, code blocks, tables, images, blockquotes
- **Obsidian-style callouts**: `> [!note]`, `> [!warning]`, `> [!tip]`, `> [!danger]`, etc.
- **Interactive TOC**: Auto-generated table of contents with smooth scrolling
- **Search**: Filter sidebar items in real-time
- **Code highlighting**: Syntax highlighting with Prism.js
- **Image lightbox**: Click images to view in modal
- **Mobile navigation**: Bottom navigation for previous/next notes
- **URL routing**: Direct links to specific notes via query parameter

## Architecture

### Core Modules

- **app.js** - Main application logic, initialization, and note loading
- **theme.js** - Theme management and persistence
- **parser.js** - Markdown parsing with custom Obsidian-style renderers
- **ui.js** - DOM utilities, state management, and basic UI helpers
- **sidebar.js** - File tree rendering and navigation
- **toc.js** - Table of contents generation and scroll tracking
- **ui-effects.js** - Animations, interactions, code copy buttons, image lightbox
- **style.css** - Complete layout, responsiveness, and themed styling
- **index.html** - Application shell and structure

### Data Flow

1. **Initialization**: `app.js` loads `notes-manifest.json`
2. **Rendering**: Sidebar renders file tree from manifest
3. **Navigation**: User clicks file → `loadNote()` fetches markdown
4. **Parsing**: `parser.js` converts markdown → HTML with custom renderers
5. **Display**: HTML rendered in center panel, TOC auto-generated
6. **Enhancement**: Interactive elements enhanced (code copy, image lightbox, links)

## Usage

### Quick Start

1. Open `viewer/index.html` in a browser
2. Select a note from the sidebar
3. Use theme switcher in sidebar footer to change themes
4. Click images to view full-size

### Manifest Generation

The viewer reads from `notes-manifest.json`. When you add new notes:

```bash
node scripts/generate-manifest.js
```

This will scan the vault and update the manifest. The script:
- Recursively crawls all folders
- Extracts titles from markdown first heading (`# Title`)
- Excludes: `.git`, `viewer`, `scripts`, `.obsidian`, `viewer-old-backup`
- Excludes files: `Implementation Plan.md`, `README.md`, `Diff.md`, `VIEWER_IMPROVEMENTS.md`

### Direct Link

Link to a specific note with the query parameter:

```
viewer/index.html?note=JAVA/02. OOPS/01. Encapsulation.md
```

## Customization

### Add New Themes

Edit `style.css` CSS variables in the `:root` selector:

```css
body.theme-custom {
  --bg-primary: #ffffff;
  --text-primary: #000000;
  --accent: #0066cc;
  /* ... more variables ... */
}
```

Then add to `THEMES` array in `theme.js`:

```javascript
const THEMES = ['theme-light', 'theme-dark', 'theme-sepia', 'theme-ocean', 'theme-custom'];
```

### Modify Callout Styles

Callouts are defined in `parser.js` and styled in `style.css`. Add new types:

```javascript
// In parser.js
const type = calloutMatch[1].toLowerCase();
// Add handler for new type
```

### Customize Typography

Edit font and sizing in `style.css`:

```css
body {
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 16px;
}
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## External Dependencies

- **marked** - Markdown parser
- **Prism.js** - Code syntax highlighting
- **Lucide** - Icon library
- **Google Fonts** - Inter, JetBrains Mono

## Performance

- Manifest loads in ~20ms
- Note parsing/rendering: <100ms for typical files
- Smooth 60fps animations using CSS transforms
- Minimal DOM updates during navigation

## Development

### File Structure

```
Notes/
├── JAVA/
│   ├── 01. Java Basics/
│   ├── 02. OOPS/
│   └── 03. Exception Handling/
├── viewer/
│   ├── app.js
│   ├── parser.js
│   ├── ui.js
│   ├── sidebar.js
│   ├── toc.js
│   ├── theme.js
│   ├── ui-effects.js
│   ├── style.css
│   ├── index.html
│   └── notes-manifest.json
├── scripts/
│   └── generate-manifest.js
└── Implementation Plan.md
```

### Next Steps for Enhancement

1. **Search modal**: Implement `Ctrl/Cmd + K` fuzzy search
2. **Tags**: Add frontmatter parsing for tags
3. **Backlinks**: Generate backlink references
4. **Export**: Add markdown/PDF export
5. **Dark mode auto-detection**: System preference detection
6. **Offline support**: Service worker for offline viewing

## Deployment

The viewer is static and can be hosted anywhere:

```bash
# Copy viewer directory to your host
scp -r viewer/ user@host:/var/www/notes/
```

For GitHub Pages:
1. Copy `viewer/` contents to `docs/` folder
2. Commit and push
3. Enable GitHub Pages in repo settings

## Troubleshooting

**Notes not showing?**
- Run `node scripts/generate-manifest.js` to rebuild manifest
- Check browser console for errors
- Verify note files are in correct paths

**Images not loading?**
- Ensure image paths are relative to note files
- Check browser console for 404 errors

**Markdown not rendering?**
- Verify markdown syntax is valid
- Check for unsupported syntax in console

## License

Created for personal note storage and management.
 -->
