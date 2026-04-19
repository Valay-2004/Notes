/**
 * VALAY Notes Vault - Consolidated Application
 * All modules combined into a single file for simplified loading
 */

// ============================================================================
// THEME MANAGEMENT (theme.js)
// =======================const response = await fetch(`${encodedPath}`);=====================================================

const THEMES = [
  "theme-white",
  "theme-ocean-dark",
  "theme-tokyo-night",
  "theme-obsidian-blue",
];
const THEME_STORAGE_KEY = "vault-current-theme";

class ThemeManager {
  constructor() {
    this.currentTheme = this.loadTheme();
    this.applyTheme(this.currentTheme);
  }

  loadTheme() {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved && THEMES.includes(saved) ? saved : THEMES[0];
  }

  applyTheme(theme) {
    document.body.className = theme;
    this.currentTheme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }

  nextTheme() {
    const index = THEMES.indexOf(this.currentTheme);
    const next = THEMES[(index + 1) % THEMES.length];
    this.applyTheme(next);
    return next;
  }

  getTheme() {
    return this.currentTheme;
  }
}

const themeManager = new ThemeManager();

// ============================================================================
// MARKDOWN PARSING (parser.js)
// ============================================================================

class MarkdownParser {
  constructor() {
    this.setupMarked();
  }

  setupMarked() {
    marked.setOptions({
      breaks: true,
      gfm: true,
      pedantic: false,
    });

    const renderer = {
      blockquote: (quote) => {
        const calloutMatch = quote.match(/^\s*\[!(\w+)\]\s*(.*?)$/m);

        if (calloutMatch) {
          const type = calloutMatch[1].toLowerCase();
          const titleText =
            calloutMatch[2] || type.charAt(0).toUpperCase() + type.slice(1);
          const content = quote.replace(/^\s*\[!\w+\]\s*.*?\n?/, "");

          return `<div class="callout callout-${type}">
            <div class="callout-icon">📌</div>
            <div class="callout-content">
              <div class="callout-title">${titleText}</div>
              <div class="callout-body">${content}</div>
            </div>
          </div>`;
        }

        return `<blockquote>${quote}</blockquote>`;
      },

      code: (code, language) => {
        const lang = language || "text";
        const highlighted = this.highlightCode(code, lang);
        return `<pre><code class="language-${lang}">${highlighted}</code></pre>`;
      },

      image: (token) => {
        return `<img src="${token.href}" alt="${token.text}" title="${token.title || ""}" />`;
      },
    };

    marked.use({ renderer });
  }

  highlightCode(code, language) {
    try {
      if (Prism.languages[language]) {
        return Prism.highlight(code, Prism.languages[language], language);
      }
    } catch (e) {}
    return code;
  }

  preprocess(markdown) {
    markdown = markdown.replace(
      /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
      (match, path, alias) => {
        const text = alias || path;
        return `[${text}](note://${path.trim()})`;
      },
    );

    return markdown;
  }

  parse(markdown) {
    const processed = this.preprocess(markdown);
    const html = marked.parse(processed);

    setTimeout(() => Prism.highlightAll(), 0);

    return html;
  }

  extractTitle(markdown) {
    const match = markdown.match(/^#\s+(.+?)$/m);
    return match ? match[1].trim() : "Untitled";
  }

  extractHeadings(html) {
    const headings = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const elements = doc.querySelectorAll("h1, h2, h3, h4, h5, h6");
    elements.forEach((el, i) => {
      const level = parseInt(el.tagName[1]);
      headings.push({
        id: `heading-${i}`,
        text: el.textContent,
        level: level,
      });
    });

    return headings;
  }
}

const markdownParser = new MarkdownParser();

// ============================================================================
// DOM UTILITIES AND UI STATE (ui.js)
// ============================================================================

const DOM = {
  container: document.querySelector(".app-container"),
  sidebar: document.getElementById("sidebar"),
  main: document.querySelector(".main"),
  header: document.querySelector(".header"),
  noteContent: document.getElementById("note-content"),
  noteTitle: document.getElementById("note-title"),
  noteBody: document.getElementById("note-body"),
  breadcrumb: document.getElementById("breadcrumb"),
  sidebarNav: document.getElementById("sidebar-nav"),
  tocNav: document.getElementById("toc-nav"),
  tocSidebar: document.getElementById("toc-sidebar"),
  mobileNav: document.getElementById("mobile-nav"),
  modalOverlay: document.getElementById("modal-overlay"),
  toastContainer: document.getElementById("toast-container"),
  search: document.getElementById("sidebar-search"),
  btnTheme: document.getElementById("btn-theme"),
  btnSidebarToggle: document.getElementById("btn-sidebar-toggle"),
  btnVault: document.getElementById("btn-vault"),
  btnPrev: document.getElementById("btn-prev"),
  btnNext: document.getElementById("btn-next"),
  btnCopyLink: document.getElementById("btn-copy-link"),
};

const state = {
  manifest: null,
  currentNote: null,
  noteHistory: [],
  historyIndex: -1,
  isMobile: window.innerWidth <= 768,
  sidebarOpen: window.innerWidth > 768,
  tocOpen: false,
};

function showLoading() {
  DOM.noteBody.innerHTML = `
    <div class="loading-state">
      <i data-lucide="loader-2" class="spinner"></i>
      <p>Loading note...</p>
    </div>
  `;
  lucide.createIcons();
}

function showError(message) {
  DOM.noteBody.innerHTML = `
    <div class="loading-state">
      <i data-lucide="alert-circle"></i>
      <p>${message}</p>
    </div>
  `;
  lucide.createIcons();
}

function updateBreadcrumb(path) {
  const parts = path.split("/").filter((p) => p);
  const breadcrumbs = parts
    .map((part, i) => {
      const subpath = parts.slice(0, i + 1).join("/");
      return `<span data-path="${subpath}">${part}</span>`;
    })
    .join(" / ");
  DOM.breadcrumb.innerHTML = breadcrumbs || "Vault";
}

function showToast(message, duration = 2000) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  DOM.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideUp 150ms ease reverse";
    setTimeout(() => toast.remove(), 150);
  }, duration);
}

function showImageModal(src, alt = "") {
  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  img.className = "modal-image";

  DOM.modalOverlay.innerHTML = "";
  DOM.modalOverlay.appendChild(img);
  DOM.modalOverlay.classList.add("active");

  const closeModal = () => {
    DOM.modalOverlay.classList.remove("active");
    DOM.modalOverlay.removeEventListener("click", onModalClick);
  };

  const onModalClick = (e) => {
    if (e.target === DOM.modalOverlay) closeModal();
  };

  DOM.modalOverlay.addEventListener("click", onModalClick);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

function toggleSidebar() {
  if (!state.isMobile) return;
  state.sidebarOpen = !state.sidebarOpen;
  DOM.sidebar.classList.toggle("open", state.sidebarOpen);
}

function toggleTOC() {
  if (!state.isMobile) return;
  state.tocOpen = !state.tocOpen;
  DOM.tocSidebar.classList.toggle("open", state.tocOpen);
}

function closeSidebars() {
  if (state.isMobile) {
    DOM.sidebar.classList.remove("open");
    DOM.tocSidebar.classList.remove("open");
    state.sidebarOpen = false;
    state.tocOpen = false;
  }
}

async function copyNoteLink() {
  if (!state.currentNote) return;

  const url = new URL(window.location);
  url.searchParams.set("note", state.currentNote.path);

  try {
    await navigator.clipboard.writeText(url.toString());
    showToast("Link copied!");
  } catch (err) {
    showToast("Failed to copy link");
  }
}

function handleResize() {
  const wasMobile = state.isMobile;
  state.isMobile = window.innerWidth <= 768;

  if (state.isMobile && !wasMobile) {
    DOM.sidebar.classList.remove("open");
    DOM.tocSidebar.classList.remove("open");
    state.sidebarOpen = false;
    state.tocOpen = false;
  } else if (!state.isMobile && wasMobile) {
    DOM.sidebar.classList.add("open");
    state.sidebarOpen = true;
  }
}

window.addEventListener("resize", handleResize);

function createIcons() {
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

window.ui = {
  showLoading,
  showError,
  updateBreadcrumb,
  showToast,
  showImageModal,
  toggleSidebar,
  toggleTOC,
  closeSidebars,
  copyNoteLink,
  createIcons,
};

// ============================================================================
// SIDEBAR MANAGEMENT (sidebar.js)
// ============================================================================

class SidebarManager {
  constructor() {
    this.expandedFolders = new Set();
    this.filteredItems = null;
  }

  render(items) {
    DOM.sidebarNav.innerHTML = "";
    const list = this.buildTree(items);
    DOM.sidebarNav.appendChild(list);
    ui.createIcons();
  }

  buildTree(items, level = 0) {
    const ul = document.createElement("ul");
    ul.className = "nav-list";

    items.forEach((item) => {
      const li = document.createElement("li");
      li.className = "nav-item";

      if (item.type === "folder") {
        const link = this.createFolderLink(item, level);
        li.appendChild(link);

        if (item.children && item.children.length > 0) {
          const childList = this.buildTree(item.children, level + 1);
          childList.style.display = this.expandedFolders.has(item.path)
            ? "block"
            : "none";
          childList.dataset.folderPath = item.path;
          li.appendChild(childList);
        }
      } else if (item.type === "file") {
        const link = this.createFileLink(item, level);
        li.appendChild(link);
      }

      ul.appendChild(li);
    });

    return ul;
  }

  createFolderLink(item, level) {
    const div = document.createElement("div");
    div.className = "nav-link";
    div.style.paddingLeft = `${level * 16 + 12}px`;
    div.dataset.path = item.path;
    div.dataset.type = "folder";

    const icon = document.createElement("i");
    icon.setAttribute("data-lucide", "folder");

    const span = document.createElement("span");
    span.textContent = item.name;

    div.appendChild(icon);
    div.appendChild(span);

    div.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleFolder(item.path, div);
    });

    return div;
  }

  createFileLink(item, level) {
    const div = document.createElement("div");
    div.className = "nav-link file-link";
    div.style.paddingLeft = `${level * 16 + 12}px`;
    div.dataset.path = item.path;
    div.dataset.type = "file";

    const icon = document.createElement("i");
    icon.setAttribute("data-lucide", "file-text");

    const span = document.createElement("span");
    span.textContent = item.name || item.title;

    div.appendChild(icon);
    div.appendChild(span);

    div.addEventListener("click", (e) => {
      e.stopPropagation();
      loadNote(item.path);
      ui.closeSidebars();
    });

    return div;
  }

  toggleFolder(path, linkElement) {
    const parentLi = linkElement.parentElement;
    const childList = parentLi.querySelector(`ul[data-folder-path="${path}"]`);

    if (!childList) return;

    if (this.expandedFolders.has(path)) {
      this.expandedFolders.delete(path);
      childList.style.display = "none";
      linkElement.querySelector("i").setAttribute("data-lucide", "folder");
    } else {
      this.expandedFolders.add(path);
      childList.style.display = "block";
      linkElement.querySelector("i").setAttribute("data-lucide", "folder-open");
    }

    ui.createIcons();
  }

  setActive(path) {
    document.querySelectorAll(".nav-link.active").forEach((el) => {
      el.classList.remove("active");
    });

    const active = document.querySelector(
      `[data-path="${path}"][data-type="file"]`,
    );
    if (active) {
      active.classList.add("active");
    }
  }

  filter(query) {
    if (!query) {
      DOM.sidebarNav.querySelectorAll(".nav-item").forEach((item) => {
        item.style.display = "";
      });
      return;
    }

    const q = query.toLowerCase();
    DOM.sidebarNav.querySelectorAll(".nav-item").forEach((item) => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(q) ? "" : "none";
    });
  }

  findFile(query) {
    if (!state.manifest) return null;

    const search = (items) => {
      for (const item of items) {
        if (item.type === "file") {
          if (
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.title.toLowerCase().includes(query.toLowerCase())
          ) {
            return item;
          }
        }
        if (item.type === "folder" && item.children) {
          const found = search(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    return search(state.manifest);
  }
}

const sidebarManager = new SidebarManager();

DOM.search.addEventListener("input", (e) => {
  sidebarManager.filter(e.target.value);
});

// ============================================================================
// TABLE OF CONTENTS (toc.js)
// ============================================================================

class TOCManager {
  constructor() {
    this.headings = [];
  }

  generate(htmlElement) {
    this.headings = [];
    const headings = htmlElement.querySelectorAll("h1, h2, h3, h4, h5, h6");

    headings.forEach((el, i) => {
      const id = `heading-${i}`;
      el.id = id;

      const level = parseInt(el.tagName[1]);
      this.headings.push({
        id,
        text: el.textContent,
        level,
      });
    });

    this.render();
  }

  render() {
    DOM.tocNav.innerHTML = "";

    if (this.headings.length === 0) {
      const empty = document.createElement("div");
      empty.style.padding = "16px";
      empty.style.color = "var(--text-muted)";
      empty.style.fontSize = "12px";
      empty.textContent = "No headings in this note";
      DOM.tocNav.appendChild(empty);
      return;
    }

    const list = this.buildTOCList();
    DOM.tocNav.appendChild(list);
  }

  buildTOCList() {
    const ul = document.createElement("ul");
    ul.style.listStyle = "none";
    ul.style.padding = "0";

    this.headings.forEach((heading) => {
      const li = document.createElement("li");
      li.className = "toc-item";
      li.style.paddingLeft = `${(heading.level - 1) * 16}px`;

      const a = document.createElement("a");
      a.href = `#${heading.id}`;
      a.textContent = heading.text;
      a.style.display = "block";
      a.style.padding = "8px 0";
      a.style.color = "inherit";
      a.style.textDecoration = "none";
      a.style.fontSize = "14px";

      a.addEventListener("click", (e) => {
        e.preventDefault();
        this.scrollToHeading(heading.id);
        this.setActive(heading.id);
      });

      li.appendChild(a);
      ul.appendChild(li);
    });

    return ul;
  }

  scrollToHeading(headingId) {
    const element = document.getElementById(headingId);
    if (!element) return;

    if (state.isMobile && state.tocOpen) {
      ui.toggleTOC();
    }

    const headerHeight = 60;
    const top = element.offsetTop - headerHeight;

    DOM.noteBody.scrollTo({
      top,
      behavior: "smooth",
    });

    element.style.backgroundColor = "var(--accent-light)";
    setTimeout(() => {
      element.style.backgroundColor = "transparent";
    }, 800);
  }

  setActive(headingId) {
    document.querySelectorAll(".toc-item.active").forEach((el) => {
      el.classList.remove("active");
    });

    const items = document.querySelectorAll(".toc-item");
    items.forEach((item) => {
      const link = item.querySelector("a");
      if (link && link.href.endsWith(`#${headingId}`)) {
        item.classList.add("active");
      }
    });
  }

  updateOnScroll(container) {
    const headings = container.querySelectorAll("h1, h2, h3, h4, h5, h6");
    if (headings.length === 0) return;

    let current = null;
    const scrollTop = container.scrollTop + 100;

    headings.forEach((heading) => {
      if (heading.offsetTop <= scrollTop) {
        current = heading.id;
      }
    });

    if (current) {
      this.setActive(current);
    }
  }
}

const tocManager = new TOCManager();

DOM.noteBody.addEventListener("scroll", () => {
  tocManager.updateOnScroll(DOM.noteBody);
});

// ============================================================================
// UI EFFECTS AND INTERACTIONS (ui-effects.js)
// ============================================================================

function enhanceCodeBlocks() {
  DOM.noteBody.querySelectorAll("pre").forEach((pre, index) => {
    const code = pre.textContent;
    const button = document.createElement("button");
    button.className = "code-copy-btn";
    button.title = "Copy code";
    button.innerHTML = '<i data-lucide="copy"></i>';
    button.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      background: var(--accent);
      color: white;
      border: none;
      border-radius: 4px;
      padding: 6px 10px;
      cursor: pointer;
      font-size: 12px;
      opacity: 0;
      transition: opacity 150ms ease;
      z-index: 10;
    `;

    pre.style.position = "relative";
    pre.appendChild(button);

    pre.addEventListener("mouseenter", () => {
      button.style.opacity = "1";
    });

    pre.addEventListener("mouseleave", () => {
      button.style.opacity = "0";
    });

    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(code);
        ui.showToast("Code copied!");
        button.innerHTML = '<i data-lucide="check"></i>';
        setTimeout(() => {
          button.innerHTML = '<i data-lucide="copy"></i>';
          ui.createIcons();
        }, 1500);
      } catch (err) {
        ui.showToast("Failed to copy");
      }
      ui.createIcons();
    });

    ui.createIcons();
  });
}

function enhanceImages() {
  DOM.noteBody.querySelectorAll("img").forEach((img) => {
    img.addEventListener("click", () => {
      ui.showImageModal(img.src, img.alt);
    });
  });
}

function enhanceInternalLinks() {
  DOM.noteBody.querySelectorAll('a[href^="note://"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const path = link.href.replace("note://", "");
      loadNote(path);
    });
  });
}

function enhanceTables() {
  DOM.noteBody.querySelectorAll("table").forEach((table, index) => {
    table.style.borderCollapse = "collapse";
    table.querySelectorAll("th").forEach((th) => {
      th.style.textAlign = "left";
      th.style.fontWeight = "600";
    });
  });
}

function enhanceAnchors() {
  DOM.noteBody.querySelectorAll('a[href^="#"]').forEach((link) => {
    const target = link.getAttribute("href");
    link.addEventListener("click", (e) => {
      if (target.startsWith("#")) {
        e.preventDefault();
        const element = document.querySelector(target);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  });
}

function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

function throttle(fn, delay) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= delay) {
      fn(...args);
      last = now;
    }
  };
}

function fadeOutContent() {
  DOM.noteBody.style.opacity = "0.5";
  DOM.noteBody.style.transition = "opacity 150ms ease";
}

function fadeInContent() {
  DOM.noteBody.style.opacity = "1";
}

function setupKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      DOM.search.focus();
    }

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (document.activeElement === DOM.sidebarNav) {
        e.preventDefault();
      }
    }
  });
}

function setupButtonHandlers() {
  DOM.btnTheme.addEventListener("click", () => {
    themeManager.nextTheme();
  });

  DOM.btnSidebarToggle.addEventListener("click", () => {
    ui.toggleSidebar();
  });

  DOM.btnVault.addEventListener("click", () => {
    ui.toggleSidebar();
  });

  DOM.btnCopyLink.addEventListener("click", () => {
    ui.copyNoteLink();
  });

  if (DOM.btnPrev) {
    DOM.btnPrev.addEventListener("click", () => {
      navigatePrevious();
    });
  }

  if (DOM.btnNext) {
    DOM.btnNext.addEventListener("click", () => {
      navigateNext();
    });
  }
}

function getAllNotes(items = state.manifest, memo = []) {
  if (!items) return memo;

  items.forEach((item) => {
    if (item.type === "file") {
      memo.push(item.path);
    } else if (item.type === "folder" && item.children) {
      getAllNotes(item.children, memo);
    }
  });

  return memo;
}

function navigatePrevious() {
  const notes = getAllNotes();
  const currentIndex = notes.indexOf(state.currentNote?.path);

  if (currentIndex > 0) {
    loadNote(notes[currentIndex - 1]);
  }
}

function navigateNext() {
  const notes = getAllNotes();
  const currentIndex = notes.indexOf(state.currentNote?.path);

  if (currentIndex >= 0 && currentIndex < notes.length - 1) {
    loadNote(notes[currentIndex + 1]);
  }
}

function initUIEffects() {
  setupKeyboardShortcuts();
  setupButtonHandlers();
}

window.effects = {
  enhanceCodeBlocks,
  enhanceImages,
  enhanceInternalLinks,
  enhanceTables,
  enhanceAnchors,
  fadeOutContent,
  fadeInContent,
  getAllNotes,
  navigatePrevious,
  navigateNext,
};

// ============================================================================
// MAIN APPLICATION LOGIC (app.js)
// ============================================================================

async function initApp() {
  try {
    const response = await fetch("notes-manifest.json");
    if (!response.ok) throw new Error("Manifest not found");

    state.manifest = await response.json();

    sidebarManager.render(state.manifest);

    initUIEffects();

    const urlParams = new URLSearchParams(window.location.search);
    const notePath = urlParams.get("note");

    if (notePath) {
      loadNote(notePath);
    } else {
      showWelcome();
    }

    window.addEventListener("popstate", (e) => {
      if (e.state && e.state.path) {
        loadNote(e.state.path);
      }
    });
  } catch (err) {
    console.error("Initialization error:", err);
    ui.showError("Failed to load vault. Check console for details.");
  }
}

async function loadNote(path) {
  if (!path) {
    showWelcome();
    return;
  }

  try {
    ui.showLoading();

    const encodedPath = path
      .split("/")
      .map((p) => encodeURIComponent(p))
      .join("/");
    const response = await fetch(`${encodedPath}`);
    if (!response.ok) throw new Error(`Failed to load ${path}`);

    const markdown = await response.text();

    const title = markdownParser.extractTitle(markdown);
    const html = markdownParser.parse(markdown);

    DOM.noteTitle.textContent = title;
    DOM.noteBody.innerHTML = html;

    const headings = DOM.noteBody.querySelectorAll("h1, h2, h3, h4, h5, h6");
    headings.forEach((el, i) => {
      if (!el.id) el.id = `heading-${i}`;
    });

    tocManager.generate(DOM.noteBody);

    ui.updateBreadcrumb(path);

    sidebarManager.setActive(path);

    effects.enhanceCodeBlocks();
    effects.enhanceImages();
    effects.enhanceInternalLinks();
    effects.enhanceTables();
    effects.enhanceAnchors();

    ui.createIcons();

    state.currentNote = { path, title };

    const url = new URL(window.location);
    url.searchParams.set("note", path);
    window.history.pushState({ path }, title, url);

    DOM.noteBody.scrollTop = 0;
  } catch (err) {
    console.error("Error loading note:", err);
    ui.showError(`Failed to load note: ${path}`);
  }
}

function showWelcome() {
  DOM.noteTitle.textContent = "Welcome to VAULT";
  DOM.noteBody.innerHTML = `
    <div style="padding: 40px; text-align: center; color: var(--text-muted);">
      <p style="font-size: 18px; margin-bottom: 12px;">📃 Select a note to begin</p>
      <p style="font-size: 14px;">Choose from the file tree on the left to start reading</p>
    </div>
  `;
  tocManager.generate(DOM.noteBody);
  DOM.breadcrumb.textContent = "Vault";

  state.currentNote = null;
  sidebarManager.setActive(null);
}

window.addEventListener("DOMContentLoaded", () => {
  initApp();
});

window.loadNote = loadNote;
window.showWelcome = showWelcome;
