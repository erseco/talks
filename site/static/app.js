/* Progressive enhancement: client-side filtering and search for the catalogue.
 * The page is fully server-rendered; this only shows/hides existing cards. */
(function () {
  'use strict';

  var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));
  var q = document.getElementById('q');
  var selects = {
    year: document.getElementById('f-year'),
    event: document.getElementById('f-event'),
    topic: document.getElementById('f-topic'),
    language: document.getElementById('f-language'),
    status: document.getElementById('f-status'),
  };
  var countEl = document.getElementById('count');
  var emptyEl = document.getElementById('empty');
  var resetBtn = document.getElementById('reset');
  var yearSpan = document.getElementById('year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();
  if (!cards.length || !q) return;

  // Fold case + diacritics so "programacion" matches "programación".
  function fold(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  }

  var STATUS = {
    draft: 'Borrador', ready: 'Listo', delivered: 'Impartida',
    external: 'Externa', 'external-link-unverified': 'Enlace sin verificar', archived: 'Archivada',
  };
  var LANG = { es: 'Español', en: 'English', ca: 'Català', gl: 'Galego', eu: 'Euskara' };

  function uniq(values) {
    return values.filter(function (v, i, a) { return v && a.indexOf(v) === i; });
  }
  function fill(select, values, sortDesc) {
    if (!select) return;
    values = uniq(values).sort();
    if (sortDesc) values.reverse();
    values.forEach(function (v) {
      var o = document.createElement('option');
      o.value = v;
      o.textContent = select === selects.status ? (STATUS[v] || v)
        : select === selects.language ? (LANG[v] || v) : v;
      select.appendChild(o);
    });
  }

  fill(selects.year, cards.map(function (c) { return c.dataset.year; }), true);
  fill(selects.event, cards.map(function (c) { return c.dataset.event; }));
  fill(selects.language, cards.map(function (c) { return c.dataset.language; }));
  fill(selects.status, cards.map(function (c) { return c.dataset.status; }));
  var topics = [];
  cards.forEach(function (c) {
    (c.dataset.topics ? c.dataset.topics.split('|') : []).forEach(function (t) { if (t) topics.push(t); });
  });
  fill(selects.topic, topics);

  function apply() {
    var term = fold((q.value || '').trim());
    var fy = selects.year.value, fe = selects.event.value, ft = selects.topic.value;
    var fl = selects.language.value, fst = selects.status.value;
    var shown = 0;
    cards.forEach(function (c) {
      var ok = true;
      if (fy && c.dataset.year !== fy) ok = false;
      if (fe && c.dataset.event !== fe) ok = false;
      if (fl && c.dataset.language !== fl) ok = false;
      if (fst && c.dataset.status !== fst) ok = false;
      if (ft && (c.dataset.topics || '').split('|').indexOf(ft) === -1) ok = false;
      if (term && (c.dataset.text || '').indexOf(term) === -1) ok = false;
      c.hidden = !ok;
      if (ok) shown++;
    });
    if (countEl) countEl.textContent = shown + (shown === 1 ? ' charla' : ' charlas');
    if (emptyEl) emptyEl.hidden = shown !== 0;
  }

  [q, selects.year, selects.event, selects.topic, selects.language, selects.status]
    .forEach(function (el) {
      if (!el) return;
      el.addEventListener('input', apply);
      el.addEventListener('change', apply);
    });
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      q.value = '';
      Object.keys(selects).forEach(function (k) { if (selects[k]) selects[k].value = ''; });
      apply();
    });
  }
  apply();
})();
