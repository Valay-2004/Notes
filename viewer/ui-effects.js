/**
 * ui-effects.js - Animations, interactions, and polish
 */

/**
 * Add copy buttons to code blocks and setup handlers
 */
function enhanceCodeBlocks() {
  DOM.noteBody.querySelectorAll('pre').forEach((pre, index) => {
    const code = pre.textContent;
    const button = document.createElement('button');
    button.className = 'code-copy-btn';
    button.title = 'Copy code';
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

    pre.style.position = 'relative';
    pre.appendChild(button);

    pre.addEventListener('mouseenter', () => {
      button.style.opacity = '1';
    });

    pre.addEventListener('mouseleave', () => {
      button.style.opacity = '0';
    });

    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code);
        ui.showToast('Code copied!');
        button.innerHTML = '<i data-lucide="check"></i>';
        setTimeout(() => {
          button.innerHTML = '<i data-lucide="copy"></i>';
          ui.createIcons();
        }, 1500);
      } catch (err) {
        ui.showToast('Failed to copy');
      }
      ui.createIcons();
    });

    ui.createIcons();
  });
}

/**
 * Add click handlers to images for lightbox
 */
function enhanceImages() {
  DOM.noteBody.querySelectorAll('img').forEach(img => {
    img.addEventListener('click', () => {
      ui.showImageModal(img.src, img.alt);
    });
  });
}

/**
 * Add internal link handlers
 */
function enhanceInternalLinks() {
  DOM.noteBody.querySelectorAll('a[href^="note://"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const path = link.href.replace('note://', '');
      loadNote(path);
    });
  });
}

/**
 * Add table styling for better readability
 */
function enhanceTables() {
  DOM.noteBody.querySelectorAll('table').forEach((table, index) => {
    table.style.borderCollapse = 'collapse';
    table.queySelectorAll('th').forEach(th => {
      th.style.textAlign = 'left';
      th.style.fontWeight = '600';
    });
  });
}

/**
 * Setup smooth scrolling anchors
 */
function enhanceAnchors() {
  DOM.noteBody.querySelectorAll('a[href^="#"]').forEach(link => {
    const target = link.getAttribute('href');
    link.addEventListener('click', (e) => {
      if (target.startsWith('#')) {
        e.preventDefault();
        const element = document.querySelector(target);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
}

/**
 * Debounce helper for resize/scroll events
 */
function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle helper for frequent events
 */
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

/**
 * Add fade animation when switching notes
 */
function fadeOutContent() {
  DOM.noteBody.style.opacity = '0.5';
  DOM.noteBody.style.transition = 'opacity 150ms ease';
}

function fadeInContent() {
  DOM.noteBody.style.opacity = '1';
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K for search (placeholder)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      DOM.search.focus();
    }

    // Arrow keys for sidebar navigation
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (document.activeElement === DOM.sidebarNav) {
        e.preventDefault();
        // Navigate through nav items
      }
    }
  });
}

/**
 * Setup button interactions
 */
function setupButtonHandlers() {
  DOM.btnTheme.addEventListener('click', () => {
    themeManager.nextTheme();
  });

  DOM.btnSidebarToggle.addEventListener('click', () => {
    ui.toggleSidebar();
  });

  DOM.btnVault.addEventListener('click', () => {
    ui.toggleSidebar();
  });

  DOM.btnCopyLink.addEventListener('click', () => {
    ui.copyNoteLink();
  });

  if (DOM.btnPrev) {
    DOM.btnPrev.addEventListener('click', () => {
      navigatePrevious();
    });
  }

  if (DOM.btnNext) {
    DOM.btnNext.addEventListener('click', () => {
      navigateNext();
    });
  }
}

/**
 * Get note list in order for prev/next navigation
 */
function getAllNotes(items = state.manifest, memo = []) {
  if (!items) return memo;
  
  items.forEach(item => {
    if (item.type === 'file') {
      memo.push(item.path);
    } else if (item.type === 'folder' && item.children) {
      getAllNotes(item.children, memo);
    }
  });
  
  return memo;
}

/**
 * Navigate to previous note
 */
function navigatePrevious() {
  const notes = getAllNotes();
  const currentIndex = notes.indexOf(state.currentNote?.path);
  
  if (currentIndex > 0) {
    loadNote(notes[currentIndex - 1]);
  }
}

/**
 * Navigate to next note
 */
function navigateNext() {
  const notes = getAllNotes();
  const currentIndex = notes.indexOf(state.currentNote?.path);
  
  if (currentIndex >= 0 && currentIndex < notes.length - 1) {
    loadNote(notes[currentIndex + 1]);
  }
}

/**
 * Initialize all UI effects
 */
function initUIEffects() {
  setupKeyboardShortcuts();
  setupButtonHandlers();
}

// Export effects helpers
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
