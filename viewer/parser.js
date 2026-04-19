/**
 * parser.js - Markdown parsing and custom rendering
 */

class MarkdownParser {
  constructor() {
    this.setupMarked();
  }

  setupMarked() {
    // Configure marked options
    marked.setOptions({
      breaks: true,
      gfm: true,
      pedantic: false,
    });

    // Custom renderer for Obsidian-style callouts
    const renderer = {
      blockquote: (quote) => {
        // Check for Obsidian callout syntax: > [!type]
        const calloutMatch = quote.match(/^\s*\[!(\w+)\]\s*(.*?)$/m);
        
        if (calloutMatch) {
          const type = calloutMatch[1].toLowerCase();
          const titleText = calloutMatch[2] || type.charAt(0).toUpperCase() + type.slice(1);
          const content = quote.replace(/^\s*\[!\w+\]\s*.*?\n?/, '');
          
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
        const lang = language || 'text';
        const highlighted = this.highlightCode(code, lang);
        return `<pre><code class="language-${lang}">${highlighted}</code></pre>`;
      },

      image: (token) => {
        return `<img src="${token.href}" alt="${token.text}" title="${token.title || ''}" />`;
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
    // Convert Obsidian wikilinks [[Note]] to internal links
    markdown = markdown.replace(
      /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
      (match, path, alias) => {
        const text = alias || path;
        return `[${text}](note://${path.trim()})`;
      }
    );

    return markdown;
  }

  parse(markdown) {
    const processed = this.preprocess(markdown);
    const html = marked.parse(processed);
    
    // Re-highlight code blocks
    setTimeout(() => Prism.highlightAll(), 0);
    
    return html;
  }

  extractTitle(markdown) {
    const match = markdown.match(/^#\s+(.+?)$/m);
    return match ? match[1].trim() : 'Untitled';
  }

  extractHeadings(html) {
    const headings = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const elements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    elements.forEach((el, i) => {
      const level = parseInt(el.tagName[1]);
      headings.push({
        id: `heading-${i}`,
        text: el.textContent,
        level: level
      });
    });

    return headings;
  }
}

// Global parser instance
const markdownParser = new MarkdownParser();
