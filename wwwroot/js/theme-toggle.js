// Minimal theme toggle script. Initial theme is applied by an inline
// snippet in <head> to avoid a flash of the wrong theme; this file only
// wires up the toggle button and system-preference listener.
(function() {
  const STORAGE_KEY = 'theme';
  const html = document.documentElement;
  const toggleBtn = document.getElementById('theme-toggle');

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  function toggleTheme() {
    const current = html.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleTheme);
  }

  // Follow system preference changes only when the user hasn't picked one.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      html.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });
})();
