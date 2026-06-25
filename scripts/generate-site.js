#!/usr/bin/env node
'use strict';

/**
 * Generate the static site into `output/site/`:
 *
 *   output/site/index.html          landing page (cards + client-side filters)
 *   output/site/index.json          normalised catalogue (also copied to output/)
 *   output/site/talks/<id>/         per-talk detail page + built slides/assets
 *   output/site/static/             style.css + app.js (copied verbatim)
 *
 * Talk metadata comes from each `talk.yml`; built artifacts (HTML/PDF) come
 * from `output/talks/<id>/` produced by build-talks.js. The site is fully
 * server-rendered (works without JS); app.js only adds filtering/search.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { ROOT, loadAllTalks, sortKey } = require('./lib/talks');

const OUTPUT = path.join(ROOT, 'output');
const SITE = path.join(OUTPUT, 'site');
const BUILT_TALKS = path.join(OUTPUT, 'talks');
const STATIC_SRC = path.join(ROOT, 'site', 'static');

const SITE_CFG = yaml.load(fs.readFileSync(path.join(ROOT, 'data', 'site.yml'), 'utf8')) || {};
const REPO_URL = (SITE_CFG.repo_url || 'https://github.com/erseco/talks').replace(/\/$/, '');
const BRANCH = SITE_CFG.default_branch || 'main';

const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
const STATUS_LABEL = {
  draft: 'Borrador',
  ready: 'Listo',
  delivered: 'Impartida',
  external: 'Externa',
  'external-link-unverified': 'Enlace sin verificar',
  archived: 'Archivada',
};
const LANG_LABEL = { es: 'Español', en: 'English', ca: 'Català', gl: 'Galego', eu: 'Euskara' };

const esc = (v) => String(v == null ? '' : v)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

// Case- and diacritic-folded text for the client-side search index.
const fold = (s) => String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');

const SITE_BASE = (SITE_CFG.site_url || '').replace(/\/$/, '');

function formatDate(d) {
  const [y, m, day] = String(d || '').split('-');
  if (!y) return '';
  if (day) return `${parseInt(day, 10)} de ${MONTHS_ES[parseInt(m, 10) - 1]} de ${y}`;
  if (m) return `${MONTHS_ES[parseInt(m, 10) - 1]} de ${y}`;
  return y;
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

/** Build the normalised view-model used by both the index and detail pages. */
function normalise(t) {
  const d = t.data;
  const id = d.id || path.basename(t.dir);
  const ext = d.external || {};
  const builtHtml = fs.existsSync(path.join(BUILT_TALKS, id, `${id}.html`));
  const builtPdf = fs.existsSync(path.join(BUILT_TALKS, id, `${id}.pdf`));

  return {
    id,
    title: d.title || id,
    subtitle: d.subtitle || '',
    description: d.description || '',
    date: d.date || '',
    dateLabel: formatDate(d.date),
    year: String(d.year || String(d.date || '').slice(0, 4) || ''),
    event: d.event || '',
    location: d.location || '',
    language: d.language || '',
    languageLabel: LANG_LABEL[d.language] || d.language || '',
    type: d.type || 'talk',
    status: d.status || 'draft',
    statusLabel: STATUS_LABEL[d.status] || d.status || '',
    duration_minutes: d.duration_minutes || null,
    audience: Array.isArray(d.audience) ? d.audience : [],
    topics: Array.isArray(d.topics) ? d.topics : [],
    license: d.license || {},
    repoPath: t.repoPath,
    hasNotes: t.hasNotes,
    links: {
      detail: `talks/${id}/index.html`,
      online: builtHtml ? `talks/${id}/${id}.html` : null,
      pdf: builtPdf ? `talks/${id}/${id}.pdf` : (ext.pdf_url || null),
      marp_source: t.hasSlides ? `${REPO_URL}/blob/${BRANCH}/${t.repoPath}/slides.md` : null,
      github: `${REPO_URL}/tree/${BRANCH}/${t.repoPath}`,
      external_source: ext.canonical_url || ext.source_url || ext.event_url || null,
      video: ext.video_url || null,
      notes: t.hasNotes ? `${REPO_URL}/blob/${BRANCH}/${t.repoPath}/notes.md` : null,
    },
  };
}

function actionButtons(v, prefix = '') {
  const L = v.links;
  const btn = (href, label, cls) => {
    if (!href) return '';
    const isAbs = /^([a-z][a-z0-9+.-]*:)?\/\//i.test(href);
    const url = isAbs ? href : prefix + href;
    return `<a class="btn ${cls}" href="${esc(url)}"${isAbs ? ' rel="noopener"' : ''}>${label}</a>`;
  };
  return [
    btn(L.online, 'Ver online', 'primary'),
    btn(L.pdf, 'Descargar PDF', 'secondary'),
    btn(L.marp_source, 'Fuente Marp', 'ghost'),
    btn(L.external_source, 'Fuente externa', 'ghost'),
    btn(L.video, 'Vídeo', 'ghost'),
    btn(L.github, 'GitHub', 'ghost'),
  ].filter(Boolean).join('\n        ');
}

function cardMarkup(v) {
  const topics = v.topics.map((x) => `<li>${esc(x)}</li>`).join('');
  const text = fold([v.title, v.subtitle, v.description, v.event, v.location, ...v.topics, ...v.audience].join(' '));
  return `      <article class="card" data-year="${esc(v.year)}" data-event="${esc(v.event)}" data-language="${esc(v.language)}" data-status="${esc(v.status)}" data-topics="${esc(v.topics.join('|'))}" data-text="${esc(text)}">
        <div class="card-top">
          <span class="badge status-${esc(v.status)}">${esc(v.statusLabel)}</span>
          <time>${esc(v.dateLabel)}</time>
        </div>
        <h2><a href="${esc(v.links.detail)}">${esc(v.title)}</a></h2>
        ${v.subtitle ? `<p class="subtitle">${esc(v.subtitle)}</p>` : ''}
        <p class="event">${esc(v.event)}${v.location ? ` · ${esc(v.location)}` : ''}</p>
        <p class="desc">${esc(v.description)}</p>
        <ul class="topics">${topics}</ul>
        <div class="actions">
        ${actionButtons(v)}
        </div>
      </article>`;
}

function indexPage(views) {
  const cards = views.map(cardMarkup).join('\n');
  const links = (SITE_CFG.links || [])
    .map((l) => `<a href="${esc(l.url)}" rel="noopener">${esc(l.label)}</a>`)
    .join('\n      ');
  return `<!DOCTYPE html>
<html lang="${esc(SITE_CFG.language || 'es')}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(SITE_CFG.title)}</title>
  <meta name="description" content="${esc(SITE_CFG.subtitle)}">
  <meta name="author" content="${esc(SITE_CFG.author)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(SITE_CFG.title)}">
  <meta property="og:description" content="${esc(SITE_CFG.subtitle)}">
  <meta property="og:url" content="${esc(SITE_CFG.site_url || '')}">
  <meta name="twitter:card" content="summary">
  <link rel="stylesheet" href="static/style.css">
  <script>document.documentElement.classList.add('js')</script>
</head>
<body>
  <header class="hero">
    <div class="wrap">
      <p class="kicker">${esc(SITE_CFG.author)}</p>
      <h1>${esc(SITE_CFG.title)}</h1>
      <p class="lead">${esc(SITE_CFG.subtitle)}</p>
      <p class="hero-links">
        <a href="${esc(REPO_URL)}" rel="noopener">Repositorio en GitHub</a>
      </p>
    </div>
  </header>

  <main class="wrap">
    <section class="controls" aria-label="Filtros">
      <input type="search" id="q" placeholder="Buscar por título, evento, tema…" aria-label="Buscar">
      <select id="f-year" aria-label="Año"><option value="">Todos los años</option></select>
      <select id="f-event" aria-label="Evento"><option value="">Todos los eventos</option></select>
      <select id="f-topic" aria-label="Tema"><option value="">Todos los temas</option></select>
      <select id="f-language" aria-label="Idioma"><option value="">Todos los idiomas</option></select>
      <select id="f-status" aria-label="Estado"><option value="">Todos los estados</option></select>
      <button type="button" id="reset">Limpiar</button>
      <p class="count" id="count" aria-live="polite"></p>
    </section>

    <section class="grid" id="cards">
${cards}
    </section>
    <p class="empty" id="empty" hidden>No hay charlas que coincidan con los filtros.</p>
  </main>

  <footer class="site-footer">
    <div class="wrap">
      <nav class="footer-links">
      ${links}
      </nav>
      <p>© <span id="year"></span> ${esc(SITE_CFG.author)} · Contenido bajo CC BY-SA 4.0</p>
    </div>
  </footer>

  <script src="static/app.js"></script>
</body>
</html>`;
}

function detailPage(v) {
  const meta = [
    ['Evento', v.event],
    ['Fecha', v.dateLabel],
    ['Lugar', v.location],
    ['Idioma', v.languageLabel],
    ['Duración', v.duration_minutes ? `${v.duration_minutes} min` : ''],
    ['Estado', v.statusLabel],
    ['Licencia', v.license.content || v.license.code || ''],
  ].filter(([, val]) => val)
    .map(([k, val]) => `        <div><dt>${esc(k)}</dt><dd>${esc(val)}</dd></div>`)
    .join('\n');
  const topics = v.topics.map((x) => `<li>${esc(x)}</li>`).join('');
  const audience = v.audience.map((x) => `<li>${esc(x)}</li>`).join('');
  return `<!DOCTYPE html>
<html lang="${esc(v.language || 'es')}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(v.title)} · ${esc(SITE_CFG.title)}</title>
  <meta name="description" content="${esc(v.description)}">
  <meta name="author" content="${esc(SITE_CFG.author)}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${esc(v.title)}">
  <meta property="og:description" content="${esc(v.description)}">
  ${SITE_BASE ? `<meta property="og:url" content="${esc(`${SITE_BASE}/talks/${v.id}/`)}">` : ''}
  <meta name="twitter:card" content="summary">
  <link rel="stylesheet" href="../../static/style.css">
</head>
<body class="detail">
  <header class="hero compact">
    <div class="wrap">
      <p class="kicker"><a href="../../index.html">← Todas las charlas</a></p>
      <span class="badge status-${esc(v.status)}">${esc(v.statusLabel)}</span>
      <h1>${esc(v.title)}</h1>
      ${v.subtitle ? `<p class="lead">${esc(v.subtitle)}</p>` : ''}
    </div>
  </header>

  <main class="wrap detail-body">
    <p class="desc">${esc(v.description)}</p>

    <div class="actions">
    ${actionButtons(v, '../../')}
    </div>

    <dl class="meta">
${meta}
    </dl>

    ${topics ? `<section><h2>Temas</h2><ul class="topics">${topics}</ul></section>` : ''}
    ${audience ? `<section><h2>Público</h2><ul class="topics">${audience}</ul></section>` : ''}
    ${v.links.notes ? `<section><h2>Recursos</h2><ul><li><a href="${esc(v.links.notes)}" rel="noopener">Notas del ponente</a></li></ul></section>` : ''}
  </main>

  <footer class="site-footer">
    <div class="wrap">
      <p>© <span id="year"></span> ${esc(SITE_CFG.author)} · Contenido bajo CC BY-SA 4.0</p>
    </div>
  </footer>
  <script>document.getElementById('year').textContent = new Date().getFullYear();</script>
</body>
</html>`;
}

function main() {
  const talks = loadAllTalks();
  const views = talks
    .map(normalise)
    .sort((a, b) => sortKey(b.date).localeCompare(sortKey(a.date)));

  // Clean + recreate site dir.
  fs.rmSync(SITE, { recursive: true, force: true });
  fs.mkdirSync(SITE, { recursive: true });

  // Static assets.
  copyDir(STATIC_SRC, path.join(SITE, 'static'));

  // Built slide artifacts (html/pdf/assets) into the site tree.
  copyDir(BUILT_TALKS, path.join(SITE, 'talks'));

  // Landing page.
  fs.writeFileSync(path.join(SITE, 'index.html'), indexPage(views));

  // Detail pages.
  for (const v of views) {
    const dir = path.join(SITE, 'talks', v.id);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), detailPage(v));
  }

  // Machine-readable catalogue (in the site + at output root for releases).
  const json = JSON.stringify(views, null, 2);
  fs.writeFileSync(path.join(SITE, 'index.json'), json);
  fs.writeFileSync(path.join(OUTPUT, 'index.json'), json);

  console.log(`✓ Site generated at ${path.relative(ROOT, SITE)} (${views.length} talk(s)).`);
}

main();
