/* Shared across index + detail pages: dark/light toggle (persisted) + footer year.
 * The initial theme is applied before paint by an inline boot script in <head>. */
(function () {
  'use strict';
  var d = document.documentElement;
  var btn = document.getElementById('theme-toggle');

  function label() {
    if (!btn) return;
    var dark = d.dataset.theme === 'dark';
    btn.textContent = dark ? '☀ claro' : '☾ oscuro';
    btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
  }
  function set(theme) {
    d.dataset.theme = theme;
    try { localStorage.setItem('theme', theme); } catch (e) { /* ignore */ }
    label();
  }
  if (btn) {
    btn.addEventListener('click', function () {
      set(d.dataset.theme === 'dark' ? 'light' : 'dark');
    });
  }
  label();

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
