/**
 * theme.js - Theme management and persistence
 */

const THEMES = ['theme-white', 'theme-ocean-dark', 'theme-tokyo-night', 'theme-obsidian-blue'];
const THEME_STORAGE_KEY = 'vault-current-theme';

class ThemeManager {
  constructor() {
    this.currentTheme = this.loadTheme();
    this.applyTheme(this.currentTheme);
  }

  loadTheme() {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return (saved && THEMES.includes(saved)) ? saved : THEMES[0];
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

// Global theme manager instance
const themeManager = new ThemeManager();
