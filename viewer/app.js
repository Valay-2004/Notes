/**
 * app.js - Main application logic and initialization
 */

/**
 * Initialize the app
 */
async function initApp() {
  try {
    // Load manifest
    const response = await fetch("notes-manifest.json");
    if (!response.ok) throw new Error("Manifest not found");

    state.manifest = await response.json();

    // Render sidebar
    sidebarManager.render(state.manifest);

    // Initialize UI effects
    initUIEffects();

    // Check URL for note parameter
    const urlParams = new URLSearchParams(window.location.search);
    const notePath = urlParams.get("note");

    if (notePath) {
      loadNote(notePath);
    } else {
      showWelcome();
    }

    // Setup history management
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

/**
 * Load and display a note
 */
async function loadNote(path) {
  if (!path) {
    showWelcome();
    return;
  }

  try {
    ui.showLoading();

    // Fetch note content
    const encodedPath = path
      .split("/")
      .map((p) => encodeURIComponent(p))
      .join("/");
    const response = await fetch(`../${encodedPath}`);
    if (!response.ok) throw new Error(`Failed to load ${path}`);

    const markdown = await response.text();

    // Parse markdown
    const title = markdownParser.extractTitle(markdown);
    const html = markdownParser.parse(markdown);

    // Update DOM
    DOM.noteTitle.textContent = title;
    DOM.noteBody.innerHTML = html;

    // Update headings with IDs
    const headings = DOM.noteBody.querySelectorAll("h1, h2, h3, h4, h5, h6");
    headings.forEach((el, i) => {
      if (!el.id) el.id = `heading-${i}`;
    });

    // Generate TOC
    tocManager.generate(DOM.noteBody);

    // Update breadcrumb
    ui.updateBreadcrumb(path);

    // Set active in sidebar
    sidebarManager.setActive(path);

    // Enhance interactive elements
    effects.enhanceCodeBlocks();
    effects.enhanceImages();
    effects.enhanceInternalLinks();
    effects.enhanceTables();
    effects.enhanceAnchors();

    // Create icons
    ui.createIcons();

    // Update state
    state.currentNote = { path, title };

    // Update URL
    const url = new URL(window.location);
    url.searchParams.set("note", path);
    window.history.pushState({ path }, title, url);

    // Scroll to top
    DOM.noteBody.scrollTop = 0;
  } catch (err) {
    console.error("Error loading note:", err);
    ui.showError(`Failed to load note: ${path}`);
  }
}

/**
 * Show welcome/empty state
 */
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

  // Clear state
  state.currentNote = null;
  sidebarManager.setActive(null);
}

/**
 * Start application
 */
window.addEventListener("DOMContentLoaded", () => {
  initApp();
});

// Export functions
window.loadNote = loadNote;
window.showWelcome = showWelcome;
