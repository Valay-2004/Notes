// ============================================================================
// THEME MANAGEMENT (theme.js)
// ============================================================================

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
      blockquote: (token) => {
        const text = typeof token === "string" ? token : token.text || "";
        const calloutMatch = text.match(/^\s*\[!(\w+)\](?:\s+(.+?))?\s*$/m);

        if (calloutMatch) {
          const type = calloutMatch[1].toLowerCase();
          const titleText =
            calloutMatch[2]?.trim() ||
            type.charAt(0).toUpperCase() + type.slice(1);
          // Remove the [!TYPE] header line completely (first line of the blockquote)
          let rawContent = text
            .replace(/^[^\n]*\[!\w+\][^\n]*\n?/, "")
            .trimStart();

          const calloutIcons = {
            note: "info",
            abstract: "book",
            info: "info",
            tip: "flame",
            success: "check-circle",
            question: "help-circle",
            warning: "alert-triangle",
            failure: "x-circle",
            danger: "zap",
            bug: "bug",
            example: "list",
            quote: "quote",
          };

          const iconName = calloutIcons[type] || "info";
          const contentHtml = rawContent ? marked.parse(rawContent) : "";

          return `<div class="callout" data-type="${type}">
            <div class="callout-title">
              <i data-lucide="${iconName}"></i>
              <span>${titleText}</span>
            </div>
            ${contentHtml ? `<div class="callout-content">${contentHtml}</div>` : ""}
          </div>`;
        }
        // Return false to use default marked renderer for standard blockquotes.
        // This ensures that child tokens (like inline code) are correctly parsed.
        return false;
      },

      code: (tokenOrCode, language) => {
        const isToken = typeof tokenOrCode === "object";
        const code = isToken ? tokenOrCode.text : tokenOrCode;
        const lang = (isToken ? tokenOrCode.lang : language) || "text";

        try {
          const highlighted = this.highlightCode(code, lang);
          return `<pre class="language-${lang}"><code class="language-${lang}">${highlighted}</code></pre>`;
        } catch (e) {
          return `<pre class="language-${lang}"><code class="language-${lang}">${code}</code></pre>`;
        }
      },

      image: (token) => {
        let src = token.href;

        // Handle Obsidian image embeds converted to note:// by preprocess
        if (src.startsWith("note://")) {
          src = src.substring(7); // Remove "note://"
        }

        if (
          !src.startsWith("http") &&
          !src.startsWith("https") &&
          !src.startsWith("/") &&
          !src.startsWith("data:")
        ) {
          // Resolve relative to current note path
          if (state.currentNote?.path) {
            const dir = state.currentNote.path.substring(
              0,
              state.currentNote.path.lastIndexOf("/") + 1,
            );
            src = dir + src;
          }

          // Encode the path to handle spaces and special characters appropriately
          src = src
            .split("/")
            .map((part) => encodeURIComponent(part))
            .join("/");

          // Build an origin-absolute base URL (works on GitHub Pages subdirectories too)
          // e.g. https://user.github.io/Notes/ instead of just /Notes/
          const baseUrl =
            window.location.origin +
            window.location.pathname.substring(
              0,
              window.location.pathname.lastIndexOf("/") + 1,
            );
          src = baseUrl + src;
        }
        return `<img src="${src}" alt="${token.text}" title="${token.title || ""}" />`;
      },
    };

    marked.use({ renderer });
  }

  highlightCode(code, language) {
    if (!language) return code;
    try {
      const prismLang = Prism.languages[language] || Prism.languages.javascript;
      if (prismLang) {
        return Prism.highlight(code, prismLang, language);
      }
    } catch (e) {
      console.warn("Prism highlighting failed:", e);
    }
    return code;
  }

  preprocess(markdown) {
    // Strip YAML frontmatter
    markdown = markdown.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, "");

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
  container: document.querySelector(".app"),
  sidebar: document.getElementById("sidebar"),
  main: document.querySelector(".main-content"),
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
  btnPrevDesktop: document.getElementById("btn-prev-desktop"),
  btnNextDesktop: document.getElementById("btn-next-desktop"),
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

  // Define the keydown handler before closeModal so it can be removed on close.
  const onKeyDown = (e) => {
    if (e.key === "Escape") closeModal();
  };

  const closeModal = () => {
    DOM.modalOverlay.classList.remove("active");
    DOM.modalOverlay.removeEventListener("click", onModalClick);
    // Remove the keydown listener to prevent accumulation across multiple opens.
    document.removeEventListener("keydown", onKeyDown);
  };

  const onModalClick = (e) => {
    if (e.target === DOM.modalOverlay) closeModal();
  };

  DOM.modalOverlay.addEventListener("click", onModalClick);
  document.addEventListener("keydown", onKeyDown);
}

function toggleSidebar() {
  state.sidebarOpen = !state.sidebarOpen;

  if (window.innerWidth > 1024) {
    // Desktop: collapse sidebar by shrinking its width via CSS class on .app
    DOM.container.classList.toggle("collapsed", !state.sidebarOpen);
  } else {
    // Tablet / Mobile: sidebar is position:fixed, slide in/out
    DOM.sidebar.classList.toggle("open", state.sidebarOpen);
    const overlay = document.getElementById("sidebar-overlay");
    if (overlay) overlay.classList.toggle("active", state.sidebarOpen);
  }
}

function toggleTOC() {
  if (!state.isMobile) return;
  state.tocOpen = !state.tocOpen;
  DOM.tocSidebar.classList.toggle("open", state.tocOpen);
}

function closeSidebars() {
  DOM.sidebar.classList.remove("open");
  DOM.tocSidebar.classList.remove("open");
  state.sidebarOpen = false;
  state.tocOpen = false;
  const overlay = document.getElementById("sidebar-overlay");
  if (overlay) overlay.classList.remove("active");
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
  const wasFixed = window.innerWidth <= 1024;

  state.isMobile = window.innerWidth <= 768;
  const isNowFixed = window.innerWidth <= 1024;

  if (isNowFixed && !wasFixed) {
    // Going from desktop to tablet/mobile — close sidebar slide-in, clear .app.collapsed
    DOM.sidebar.classList.remove("open");
    DOM.container.classList.remove("collapsed");
    state.sidebarOpen = false;
    const overlay = document.getElementById("sidebar-overlay");
    if (overlay) overlay.classList.remove("active");
  } else if (!isNowFixed && wasFixed) {
    // Going from tablet/mobile to desktop — restore sidebar (no .collapsed by default)
    DOM.sidebar.classList.remove("open");
    DOM.container.classList.remove("collapsed");
    state.sidebarOpen = true;
    const overlay = document.getElementById("sidebar-overlay");
    if (overlay) overlay.classList.remove("active");
  }

  if (state.isMobile && !wasMobile) {
    DOM.tocSidebar.classList.remove("open");
    state.tocOpen = false;
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
      const icon = linkElement.querySelector("i, svg");
      if (icon) icon.setAttribute("data-lucide", "folder");
    } else {
      this.expandedFolders.add(path);
      childList.style.display = "block";
      const icon = linkElement.querySelector("i, svg");
      if (icon) icon.setAttribute("data-lucide", "folder-open");
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
      // Restore all nav items.
      DOM.sidebarNav.querySelectorAll(".nav-item").forEach((item) => {
        item.style.display = "";
      });
      // Restore folder lists to their expand/collapse state.
      DOM.sidebarNav.querySelectorAll("ul[data-folder-path]").forEach((ul) => {
        ul.style.display = this.expandedFolders.has(ul.dataset.folderPath)
          ? "block"
          : "none";
      });
      return;
    }

    const q = query.toLowerCase();
    DOM.sidebarNav.querySelectorAll(".nav-item").forEach((item) => {
      const text = item.textContent.toLowerCase();
      const visible = text.includes(q);
      item.style.display = visible ? "" : "none";

      // When a matching item lives inside a collapsed folder list, walk up
      // the DOM and force every ancestor folder <ul> to be visible so the
      // result is actually reachable.
      if (visible) {
        let parent = item.parentElement;
        while (parent && parent !== DOM.sidebarNav) {
          if (
            parent.tagName === "UL" &&
            parent.dataset.folderPath !== undefined
          ) {
            parent.style.display = "block";
          }
          parent = parent.parentElement;
        }
      }
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
      background: var(--glass-bg);
      color: hsl(var(--muted-foreground));
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 6px;
      cursor: pointer;
      font-size: 12px;
      opacity: 0;
      transition: opacity 0.2s ease;
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
        // Render the check icon immediately, then revert after 1.5 s.
        // Do NOT call createIcons() outside this block — it would instantly
        // replace the check icon before the user can see it.
        ui.createIcons();
        setTimeout(() => {
          button.innerHTML = '<i data-lucide="copy"></i>';
          ui.createIcons();
        }, 1500);
      } catch (err) {
        ui.showToast("Failed to copy");
      }
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
    // Create wrapper for horizontal scrolling
    if (!table.parentElement.classList.contains("table-wrapper")) {
      const wrapper = document.createElement("div");
      wrapper.className = "table-wrapper";
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    }

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

  if (DOM.btnVault) {
    DOM.btnVault.addEventListener("click", () => {
      ui.toggleSidebar();
    });
  }

  DOM.btnCopyLink.addEventListener("click", () => {
    ui.copyNoteLink();
  });

  // Mobile bottom nav
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

  // Desktop header nav
  if (DOM.btnPrevDesktop) {
    DOM.btnPrevDesktop.addEventListener("click", () => {
      navigatePrevious();
    });
  }

  if (DOM.btnNextDesktop) {
    DOM.btnNextDesktop.addEventListener("click", () => {
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

    // Wire up sidebar overlay: tap outside to close
    const sidebarOverlay = document.getElementById("sidebar-overlay");
    if (sidebarOverlay) {
      sidebarOverlay.addEventListener("click", () => {
        ui.closeSidebars();
      });
    }

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

    console.log(`Loading note from path: "${path}"`);

    // Ensure path is correctly encoded for fetch while preserving "/"
    const encodedPath = path
      .split("/")
      .map((part) => encodeURIComponent(part))
      .join("/");

    // Build robust absolute URL relative to the app base
    // On GitHub Pages: pathname is /Notes/ or /Notes/index.html
    // We need to find the base directory (e.g., /Notes/)
    let pathname = window.location.pathname;
    // If pathname ends with a filename, go up one level
    if (!pathname.endsWith("/")) {
      pathname = pathname.substring(0, pathname.lastIndexOf("/") + 1);
    }
    // Ensure it ends with /
    if (!pathname.endsWith("/")) {
      pathname += "/";
    }

    const baseUrl = window.location.origin + pathname;
    const fetchUrl = `${baseUrl}${encodedPath}`;
    console.log(`Fetching URL: "${fetchUrl}"`);

    const response = await fetch(fetchUrl);
    if (!response.ok) {
      console.error(
        `Fetch failed with status: ${response.status} ${response.statusText}`,
      );
      throw new Error(`Failed to load ${path}`);
    }

    const markdown = await response.text();

    const title = markdownParser.extractTitle(markdown);

    // Set state.currentNote BEFORE parsing so the image renderer
    // can resolve relative image paths correctly on the first render.
    state.currentNote = { path, title };

    const html = markdownParser.parse(markdown);

    // Get parent directory name and clean it
    const parts = path.split("/");
    let parentDir = parts.length > 1 ? parts[parts.length - 2] : "Vault";
    // Remove leading numbers like "05. "
    parentDir = parentDir.replace(/^\d+\.\s*/, "");

    DOM.noteTitle.textContent = parentDir;
    DOM.noteBody.innerHTML = html;

    // un-comment this to...
    // // Remove the first H1 from the content if it exists to prevent repetition
    // const firstH1 = DOM.noteBody.querySelector("h1");
    // if (firstH1) {
    //   firstH1.remove();
    // }

    // Render LaTeX math
    if (typeof renderMathInElement === "function") {
      renderMathInElement(DOM.noteBody, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true },
        ],
        throwOnError: false,
      });
    }

    // If the first H1 in the note is the same as the title, we could hide it
    // but the user just said they want the heading to be the directory name.

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

    // state.currentNote was already set before parsing (see above)

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
  DOM.noteTitle.textContent = "Welcome to My Notes";
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
