// State Management
const state = {
    manifest: [],
    currentPath: null,
    theme: 'theme-java',
    themes: ['theme-java', 'theme-obsidian', 'theme-nord', 'theme-dracula', 'theme-gruvbox', 'theme-solarized'],
    sidebarOpen: window.innerWidth > 1024
};

// Elements
const el = {
    sidebar: document.getElementById('sidebar'),
    sidebarNav: document.getElementById('sidebar-nav'),
    noteTitle: document.getElementById('note-title'),
    noteContent: document.getElementById('note-content'),
    toc: document.getElementById('toc'),
    search: document.getElementById('search'),
    themeBtn: document.getElementById('theme-toggle-btn'),
    breadcrumb: document.getElementById('breadcrumb'),
    toggleSidebar: document.getElementById('toggle-sidebar')
};

// --- MARKED CUSTOMIZATION ---
const renderer = {
    // Custom Blockquote Renderer for Obsidian Callouts
    blockquote(quote) {
        // Look for [!type] pattern at the start of the blockquote
        // Note: quote is already HTML rendered by marked at this point
        const match = quote.match(/\[!(\w+)\](.*?)(<br>|<\/p>|\n|$)/);
        
        if (match) {
            const type = match[1].toLowerCase();
            const title = match[2].trim() || type;
            const content = quote.replace(/\[!(\w+)\](.*?)(<br>|<\/p>|\n|$)/, '');
            
            return `<div class="callout" data-type="${type}">
                <div class="callout-title"><strong>${title}</strong></div>
                <div class="callout-content">${content}</div>
            </div>`;
        }
        return `<blockquote>${quote}</blockquote>`;
    }
};

marked.use({ renderer });

// Configure Marked for GFM and safety
marked.setOptions({
    gfm: true,
    breaks: true,
    mangle: false,
    headerIds: false,
    sanitize: false
});

// Custom link renderer to support Mermaid/SVG
marked.use({
    renderer: {
        ...marked.defaults.renderer,
        link(token) {
            const href = token.href;
            const text = this.parser.parseInline(token.tokens);
            return `<a href="${href}">${text}</a>`;
        },
        html(token) {
            return token.text; // Allow HTML pass-through for SVG
        }
    }
});

// Initialize
async function init() {
    try {
        const res = await fetch('notes-manifest.json');
        if (!res.ok) throw new Error('Manifest not found');
        state.manifest = await res.json();
        
        renderSidebar(state.manifest);
        setupEventListeners();
        lucide.createIcons();

        // Initial Route
        const urlParams = new URLSearchParams(window.location.search);
        const notePath = urlParams.get('note');
        if (notePath) {
            loadNote(notePath);
        } else {
            showWelcome();
        }
    } catch (err) {
        console.error('Init Error:', err);
        el.noteContent.innerHTML = `<div class="error-state">Failed to load vault. Run generate-manifest.js first.</div>`;
    }
}

// Sidebar Rendering (Hierarchical Tree)
function renderSidebar(items, container = el.sidebarNav, level = 0) {
    if (level === 0) container.innerHTML = '';
    const ul = document.createElement('ul');

    items.forEach(item => {
        const li = document.createElement('li');
        li.className = 'nav-item';
        
        const link = document.createElement('div');
        link.className = `nav-link ${item.type === 'folder' ? 'folder-link' : 'file-link'}`;
        link.dataset.path = item.path;
        link.style.paddingLeft = `${(level * 16) + 12}px`;
        
        const icon = item.type === 'folder' ? 'folder' : 'file-text';
        link.innerHTML = `<i data-lucide="${icon}"></i><span>${item.title || item.name}</span>`;
        
        if (item.type === 'folder') {
            const subContainer = document.createElement('div');
            subContainer.className = 'sub-nav';
            subContainer.style.display = 'block';

            link.onclick = () => {
                const isHidden = subContainer.style.display === 'none';
                subContainer.style.display = isHidden ? 'block' : 'none';
                link.querySelector('i').setAttribute('data-lucide', isHidden ? 'folder-open' : 'folder');
                lucide.createIcons();
            };

            li.appendChild(link);
            li.appendChild(subContainer);
            renderSidebar(item.children, subContainer, level + 1);
        } else {
            link.onclick = () => loadNote(item.path);
            li.appendChild(link);
        }
        ul.appendChild(li);
    });
    container.appendChild(ul);
}

// Minimal Pre-processor (Only for things Marked can't handle via renderer easily)
function preprocess(md) {
    // Wikilinks: [[Path|Alias]]
    // Done as <a> tags so marked treats them as safe HTML
    return md.replace(/\[\[([^|\]]+)(?:\|([^\]]+))?\]\]/g, (match, path, alias) => {
        const text = alias || path;
        return `<a href="#" class="internal-link" data-link="${path.trim()}">${text}</a>`;
    });
}

// Note Loading
async function loadNote(path) {
    try {
        el.noteContent.innerHTML = `<div class="loading-state"><i data-lucide="loader-2" class="spin"></i><span>Loading...</span></div>`;
        lucide.createIcons();

        const res = await fetch('../' + path);
        if (!res.ok) throw new Error('File not found');
        const text = await res.text();

        const title = text.match(/^#\s+(.+)$/m)?.[1] || path.split('/').pop().replace('.md', '');
        el.noteTitle.innerText = title;
        el.breadcrumb.innerText = 'Vault / ' + path.replace(/\//g, ' / ');
        
        const processed = preprocess(text);
        el.noteContent.innerHTML = marked.parse(processed);
        
        // Finalize UI
        Prism.highlightAll();
        generateTOC();
        setupInternalLinks();
        updateActiveState(path);
        
        // Update URL
        const url = new URL(window.location);
        url.searchParams.set('note', path);
        window.history.pushState({path}, '', url);
        
        state.currentPath = path;
    } catch (err) {
        console.error('Load Error:', err);
        el.noteContent.innerHTML = `<div class="error-msg">Failed to load: ${path}</div>`;
    }
}

function generateTOC() {
    el.toc.innerHTML = '';
    const headings = el.noteContent.querySelectorAll('h1, h2, h3');
    if (headings.length === 0) {
        el.toc.innerHTML = '<p class="text-dim">No headings found.</p>';
        return;
    }

    const ul = document.createElement('ul');
    headings.forEach((h, i) => {
        const id = `headline-${i}`;
        h.id = id;
        const li = document.createElement('li');
        li.innerHTML = `<a href="#${id}" style="padding-left: ${(parseInt(h.tagName[1])-1)*10}px">${h.innerText}</a>`;
        ul.appendChild(li);
    });
    el.toc.appendChild(ul);
}

function setupInternalLinks() {
    el.noteContent.querySelectorAll('.internal-link').forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            handleGlobalSearch(link.dataset.link);
        };
    });
}

function handleGlobalSearch(query) {
    const findInManifest = (items, target) => {
        for (const item of items) {
            if (item.type === 'file' && (item.title === target || item.name === target || item.name === target + '.md' || item.path.includes(target))) {
                return item;
            }
            if (item.type === 'folder') {
                const found = findInManifest(item.children, target);
                if (found) return found;
            }
        }
        return null;
    };
    const file = findInManifest(state.manifest, query);
    if (file) loadNote(file.path);
}

function updateActiveState(path) {
    document.querySelectorAll('.file-link').forEach(link => {
        link.classList.toggle('active', link.dataset.path === path);
    });
}

function showWelcome() {
    el.noteTitle.innerText = "Welcome to NoteSphere";
    el.noteContent.innerHTML = `<div class="welcome-msg"><h3>Vault ready.</h3><p>Select a note to begin.</p></div>`;
}

function setupEventListeners() {
    el.search.oninput = (e) => {
        const q = e.target.value.toLowerCase();
        document.querySelectorAll('.nav-item').forEach(item => {
            const match = item.innerText.toLowerCase().includes(q);
            item.style.display = match ? 'block' : 'none';
        });
    };

    el.themeBtn.onclick = () => {
        const body = document.body;
        const currentIndex = state.themes.indexOf(state.theme);
        const nextIndex = (currentIndex + 1) % state.themes.length;
        const nextTheme = state.themes[nextIndex];
        
        body.classList.remove(state.theme);
        body.classList.add(nextTheme);
        state.theme = nextTheme;
        
        localStorage.setItem('notes-theme', nextTheme);
    };

    el.toggleSidebar.onclick = () => {
        state.sidebarOpen = !state.sidebarOpen;
        el.sidebar.classList.toggle('open', state.sidebarOpen);
    };

    // Restore theme from localStorage
    const savedTheme = localStorage.getItem('notes-theme');
    if (savedTheme && state.themes.includes(savedTheme)) {
        document.body.classList.remove(state.theme);
        document.body.classList.add(savedTheme);
        state.theme = savedTheme;
    }
}

init();
