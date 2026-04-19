/**
 * sidebar.js - File tree sidebar rendering and interactions
 */

class SidebarManager {
  constructor() {
    this.expandedFolders = new Set();
    this.filteredItems = null;
  }

  /**
   * Render sidebar tree from manifest
   */
  render(items) {
    DOM.sidebarNav.innerHTML = "";
    const list = this.buildTree(items);
    DOM.sidebarNav.appendChild(list);
    ui.createIcons();
  }

  /**
   * Build nested tree UL/LI structure
   */
  buildTree(items, level = 0) {
    const ul = document.createElement("ul");
    ul.className = "nav-list";

    items.forEach((item) => {
      const li = document.createElement("li");
      li.className = "nav-item";

      if (item.type === "folder") {
        const link = this.createFolderLink(item, level);
        li.appendChild(link);

        // Add children list
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

  /**
   * Create folder link with toggle behavior
   */
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

  /**
   * Create file link with click handler
   */
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

  /**
   * Toggle folder expansion
   */
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

  /**
   * Set active file
   */
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

  /**
   * Filter sidebar items based on search query
   */
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

  /**
   * Get file path from search query (fuzzy matching)
   */
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

// Global sidebar manager
const sidebarManager = new SidebarManager();

// Setup sidebar search
DOM.search.addEventListener("input", (e) => {
  sidebarManager.filter(e.target.value);
});
