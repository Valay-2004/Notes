/**
 * toc.js - Table of Contents generation and smooth scrolling
 */

class TOCManager {
  constructor() {
    this.headings = [];
  }

  /**
   * Generate TOC from rendered HTML
   */
  generate(htmlElement) {
    this.headings = [];
    const headings = htmlElement.querySelectorAll('h1, h2, h3, h4, h5, h6');

    headings.forEach((el, i) => {
      const id = `heading-${i}`;
      el.id = id;

      const level = parseInt(el.tagName[1]);
      this.headings.push({
        id,
        text: el.textContent,
        level
      });
    });

    this.render();
  }

  /**
   * Render TOC list
   */
  render() {
    DOM.tocNav.innerHTML = '';

    if (this.headings.length === 0) {
      const empty = document.createElement('div');
      empty.style.padding = '16px';
      empty.style.color = 'var(--text-muted)';
      empty.style.fontSize = '12px';
      empty.textContent = 'No headings in this note';
      DOM.tocNav.appendChild(empty);
      return;
    }

    const list = this.buildTOCList();
    DOM.tocNav.appendChild(list);
  }

  /**
   * Build nested TOC list with indentation
   */
  buildTOCList() {
    const ul = document.createElement('ul');
    ul.style.listStyle = 'none';
    ul.style.padding = '0';

    this.headings.forEach(heading => {
      const li = document.createElement('li');
      li.className = 'toc-item';
      li.style.paddingLeft = `${(heading.level - 1) * 16}px`;

      const a = document.createElement('a');
      a.href = `#${heading.id}`;
      a.textContent = heading.text;
      a.style.display = 'block';
      a.style.padding = '8px 0';
      a.style.color = 'inherit';
      a.style.textDecoration = 'none';
      a.style.fontSize = '14px';

      a.addEventListener('click', (e) => {
        e.preventDefault();
        this.scrollToHeading(heading.id);
        this.setActive(heading.id);
      });

      li.appendChild(a);
      ul.appendChild(li);
    });

    return ul;
  }

  /**
   * Smooth scroll to heading
   */
  scrollToHeading(headingId) {
    const element = document.getElementById(headingId);
    if (!element) return;

    // Close TOC on mobile after selection
    if (state.isMobile && state.tocOpen) {
      ui.toggleTOC();
    }

    // Smooth scroll with offset for header
    const headerHeight = 60;
    const top = element.offsetTop - headerHeight;
    
    DOM.noteBody.scrollTo({
      top,
      behavior: 'smooth'
    });

    // Flash heading briefly
    element.style.backgroundColor = 'var(--accent-light)';
    setTimeout(() => {
      element.style.backgroundColor = 'transparent';
    }, 800);
  }

  /**
   * Set active TOC item
   */
  setActive(headingId) {
    document.querySelectorAll('.toc-item.active').forEach(el => {
      el.classList.remove('active');
    });

    const items = document.querySelectorAll('.toc-item');
    items.forEach(item => {
      const link = item.querySelector('a');
      if (link && link.href.endsWith(`#${headingId}`)) {
        item.classList.add('active');
      }
    });
  }

  /**
   * Update active TOC based on scroll position
   */
  updateOnScroll(container) {
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) return;

    let current = null;
    const scrollTop = container.scrollTop + 100; // Offset for header

    headings.forEach(heading => {
      if (heading.offsetTop <= scrollTop) {
        current = heading.id;
      }
    });

    if (current) {
      this.setActive(current);
    }
  }
}

// Global TOC manager
const tocManager = new TOCManager();

// Update TOC on scroll
DOM.noteBody.addEventListener('scroll', () => {
  tocManager.updateOnScroll(DOM.noteBody);
});
