/**
 * ui.js - DOM utilities and UI state management
 */

// DOM elements cache
const DOM = {
  container: document.querySelector('.app-container'),
  sidebar: document.getElementById('sidebar'),
  main: document.querySelector('.main'),
  header: document.querySelector('.header'),
  noteContent: document.getElementById('note-content'),
  noteTitle: document.getElementById('note-title'),
  noteBody: document.getElementById('note-body'),
  breadcrumb: document.getElementById('breadcrumb'),
  sidebarNav: document.getElementById('sidebar-nav'),
  tocNav: document.getElementById('toc-nav'),
  tocSidebar: document.getElementById('toc-sidebar'),
  mobileNav: document.getElementById('mobile-nav'),
  modalOverlay: document.getElementById('modal-overlay'),
  toastContainer: document.getElementById('toast-container'),
  search: document.getElementById('sidebar-search'),
  btnTheme: document.getElementById('btn-theme'),
  btnSidebarToggle: document.getElementById('btn-sidebar-toggle'),
  btnVault: document.getElementById('btn-vault'),
  btnPrev: document.getElementById('btn-prev'),
  btnNext: document.getElementById('btn-next'),
  btnCopyLink: document.getElementById('btn-copy-link'),
};

// App state
const state = {
  manifest: null,
  currentNote: null,
  noteHistory: [],
  historyIndex: -1,
  isMobile: window.innerWidth <= 768,
  sidebarOpen: window.innerWidth > 768,
  tocOpen: false,
};

/**
 * Show loading spinner in note area
 */
function showLoading() {
  DOM.noteBody.innerHTML = `
    <div class="loading-state">
      <i data-lucide="loader-2" class="spinner"></i>
      <p>Loading note...</p>
    </div>
  `;
  lucide.createIcons();
}

/**
 * Show error message
 */
function showError(message) {
  DOM.noteBody.innerHTML = `
    <div class="loading-state">
      <i data-lucide="alert-circle"></i>
      <p>${message}</p>
    </div>
  `;
  lucide.createIcons();
}

/**
 * Update breadcrumb navigation
 */
function updateBreadcrumb(path) {
  const parts = path.split('/').filter(p => p);
  const breadcrumbs = parts.map((part, i) => {
    const subpath = parts.slice(0, i + 1).join('/');
    return `<span data-path="${subpath}">${part}</span>`;
  }).join(' / ');
  DOM.breadcrumb.innerHTML = breadcrumbs || 'Vault';
}

/**
 * Show toast notification
 */
function showToast(message, duration = 2000) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  DOM.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideUp 150ms ease reverse';
    setTimeout(() => toast.remove(), 150);
  }, duration);
}

/**
 * Show image in modal
 */
function showImageModal(src, alt = '') {
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  img.className = 'modal-image';
  
  DOM.modalOverlay.innerHTML = '';
  DOM.modalOverlay.appendChild(img);
  DOM.modalOverlay.classList.add('active');

  const closeModal = () => {
    DOM.modalOverlay.classList.remove('active');
    DOM.modalOverlay.removeEventListener('click', onModalClick);
  };

  const onModalClick = (e) => {
    if (e.target === DOM.modalOverlay) closeModal();
  };

  DOM.modalOverlay.addEventListener('click', onModalClick);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

/**
 * Toggle sidebar visibility (mobile)
 */
function toggleSidebar() {
  if (!state.isMobile) return;
  state.sidebarOpen = !state.sidebarOpen;
  DOM.sidebar.classList.toggle('open', state.sidebarOpen);
}

/**
 * Toggle TOC visibility (mobile)
 */
function toggleTOC() {
  if (!state.isMobile) return;
  state.tocOpen = !state.tocOpen;
  DOM.tocSidebar.classList.toggle('open', state.tocOpen);
}

/**
 * Close sidebars on mobile
 */
function closeSidebars() {
  if (state.isMobile) {
    DOM.sidebar.classList.remove('open');
    DOM.tocSidebar.classList.remove('open');
    state.sidebarOpen = false;
    state.tocOpen = false;
  }
}

/**
 * Copy current note URL to clipboard
 */
async function copyNoteLink() {
  if (!state.currentNote) return;
  
  const url = new URL(window.location);
  url.searchParams.set('note', state.currentNote.path);
  
  try {
    await navigator.clipboard.writeText(url.toString());
    showToast('Link copied!');
  } catch (err) {
    showToast('Failed to copy link');
  }
}

/**
 * Handle window resize for responsive behavior
 */
function handleResize() {
  const wasMobile = state.isMobile;
  state.isMobile = window.innerWidth <= 768;

  if (state.isMobile && !wasMobile) {
    // Entering mobile view
    DOM.sidebar.classList.remove('open');
    DOM.tocSidebar.classList.remove('open');
    state.sidebarOpen = false;
    state.tocOpen = false;
  } else if (!state.isMobile && wasMobile) {
    // Leaving mobile view
    DOM.sidebar.classList.add('open');
    state.sidebarOpen = true;
  }
}

// Setup resize listener
window.addEventListener('resize', handleResize);

// Create lucide icons on DOM update
function createIcons() {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// Export helpers
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
