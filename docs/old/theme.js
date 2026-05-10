// Theme toggle — persists preference in localStorage
(function () {
  const STORAGE_KEY = 'hairscope-theme';

  function getTheme() {
    return localStorage.getItem(STORAGE_KEY) ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const checkbox = document.getElementById('theme-checkbox');
    if (checkbox) checkbox.checked = theme === 'dark';
    const icon = document.getElementById('theme-icon');
    if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  // Apply immediately to avoid flash
  applyTheme(getTheme());

  window.addEventListener('DOMContentLoaded', function () {
    applyTheme(getTheme());
    const checkbox = document.getElementById('theme-checkbox');
    if (checkbox) checkbox.addEventListener('change', toggleTheme);
  });
})();
