#!/usr/bin/env node
'use strict';

/**
 * Generate the static site into `output/site/`:
 *
 *   output/site/index.html               landing page (cards + client filters)
 *   output/site/index.json               normalised catalogue (also at output/)
 *   output/site/charlas/<id>/            per-talk detail page + built deck/assets
 *   output/site/static/                  style.css + app.js
 *
 * Talk metadata comes from each `talk.yml`; built artifacts come from
 * `output/talks/<id>/` (build-talks.js). Engines:
 *   - slidev: a SPA under <id>/slides/ (index.html) + <id>.pdf
 *   - marp:   a single <id>.html + <id>.pdf
 *   - external: links to the talk.yml `external:` block
 * The site is server-rendered (works without JS); app.js adds filtering/search.
 */

const fs = require('fs');
const path = require('path');
const { ROOT, DECKS_SUBDIR, loadAllTalks, sortKey, siteConfig } = require('./lib/talks');

const OUTPUT = path.join(ROOT, 'output');
const SITE = path.join(OUTPUT, 'site');
const STATIC_SRC = path.join(ROOT, 'site', 'static');
const SITE_DECKS = path.join(SITE, DECKS_SUBDIR);

// Files that make up an eXeLearning unit (the unzipped .elpx) in a talk folder.
const UNIT_PATHS = ['index.html', 'content.xml', 'content.dtd', 'search_index.js', 'html', 'libs', 'idevices', 'content', 'theme'];

const SITE_CFG = siteConfig();
const REPO_URL = (SITE_CFG.repo_url || 'https://github.com/erseco/talks').replace(/\/$/, '');
const BRANCH = SITE_CFG.default_branch || 'main';
const SITE_BASE = (SITE_CFG.site_url || '').replace(/\/$/, '');

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

// Inline boot script: mark JS available + apply saved theme before paint
// (default light, so the catalogue is never dark unless the visitor asks).
const THEME_BOOT = `<script>(function(){var d=document.documentElement;d.classList.add('js');try{var t=localStorage.getItem('theme');d.dataset.theme=(t==='dark'||t==='light')?t:'light';}catch(e){d.dataset.theme='light';}})();</script>`;

function topbar(pathLabel) {
  return `<header class="topbar">
    <span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>
    <span class="path">${esc(pathLabel)}</span>
    <span class="spacer"></span>
    <button type="button" class="theme-toggle" id="theme-toggle" aria-label="Cambiar tema claro/oscuro">tema</button>
  </header>`;
}

function footer() {
  const links = (SITE_CFG.links || [])
    .map((l) => `<a href="${esc(l.url)}" rel="noopener">${esc(l.label)}</a>`)
    .join('\n        ');
  return `<footer class="site-footer">
    <div class="wrap">
      <p class="prompt"><b>$</b> whoami</p>
      <p class="who">${esc(SITE_CFG.author)}</p>
      <nav>
        ${links}
      </nav>
      <p class="copy">© <span id="year"></span> ${esc(SITE_CFG.author)} · contenido CC BY-SA 4.0</p>
    </div>
  </footer>`;
}

/** Build the normalised view-model used by both the index and detail pages. */
function normalise(t) {
  const d = t.data;
  const id = d.id || path.basename(t.dir);
  const ext = d.external || {};
  const engine = d.engine || (t.hasUnit ? 'exelearning' : 'external');
  const DD = DECKS_SUBDIR;

  // eXeLearning talks ship a pre-rendered unit (unzipped .elpx) under unit/.
  // `teacher_mode: true` links the unit with ?exe-teacher=1 so the teacher-layer
  // (docente) toggle is offered; exe_export.js then carries the param across pages.
  const unitParams = d.teacher_mode ? '?exe-teacher=1' : '';
  const online = (engine === 'exelearning' && t.hasUnit) ? `${DD}/${id}/unit/index.html${unitParams}` : null;

  return {
    id,
    engine,
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
      detail: `${DD}/${id}/index.html`,
      online,
      pdf: ext.pdf_url || null,
      pptx: ext.pptx_url || null,
      github: `${REPO_URL}/tree/${BRANCH}/${t.repoPath}`,
      external_source: ext.canonical_url || ext.source_url || ext.event_url || null,
      video: ext.video_url || null,
      notes: t.hasNotes ? `${REPO_URL}/blob/${BRANCH}/${t.repoPath}/notes.md` : null,
    },
  };
}

function actionButtons(v, prefix = '') {
  const L = v.links;
  const btn = (href, label, primary = false) => {
    if (!href) return '';
    const isAbs = /^([a-z][a-z0-9+.-]*:)?\/\//i.test(href);
    const url = isAbs ? href : prefix + href;
    return `<a class="cmd${primary ? ' primary' : ''}" href="${esc(url)}"${isAbs ? ' rel="noopener"' : ''}>${label}</a>`;
  };
  return [
    btn(L.online, 'ver online ↗', true),
    btn(L.pdf, 'pdf original ↗', false),
    btn(L.pptx, 'pptx · notas ↗', false),
    btn(L.external_source, 'fuente original ↗', false),
    btn(L.video, 'vídeo ↗', false),
    btn(L.github, 'github ↗', false),
  ].filter(Boolean).join('\n          ');
}

function entryMarkup(v) {
  const tags = v.topics.map((x) => `<li>${esc(x)}</li>`).join('');
  const text = fold([v.title, v.subtitle, v.description, v.event, v.location, ...v.topics, ...v.audience].join(' '));
  return `      <li class="entry status-${esc(v.status)}" data-year="${esc(v.year)}" data-event="${esc(v.event)}" data-language="${esc(v.language)}" data-status="${esc(v.status)}" data-topics="${esc(v.topics.join('|'))}" data-text="${esc(text)}">
        <p class="row">
          <time>${esc(v.dateLabel || v.year)}</time>
          ${v.event ? `<span class="ev">${esc(v.event)}</span>` : ''}
          <span class="badge">${esc(v.statusLabel)}</span>
        </p>
        <h2><a href="${esc(v.links.detail)}">${esc(v.title)}</a></h2>
        ${v.subtitle ? `<p class="subtitle">${esc(v.subtitle)}</p>` : ''}
        <p class="desc">${esc(v.description)}</p>
        ${tags ? `<ul class="tags">${tags}</ul>` : ''}
        <div class="actions">
          ${actionButtons(v)}
        </div>
      </li>`;
}

function indexPage(views) {
  const entries = views.map(entryMarkup).join('\n');
  const n = views.length;
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
  ${THEME_BOOT}
</head>
<body>
  ${topbar('erseco/talks')}
  <header class="hero wrap">
    <p class="prompt"><b>$</b> ls -t charlas/<span class="cursor" aria-hidden="true"></span></p>
    <h1>${esc(SITE_CFG.title)}</h1>
    <p class="lead">${esc(SITE_CFG.subtitle)}</p>
    <p class="hero-meta"># ${n} ${n === 1 ? 'entrada' : 'entradas'} · <a href="${esc(REPO_URL)}" rel="noopener">github ↗</a></p>
  </header>

  <main class="wrap">
    <ul class="entries" id="cards">
${entries}
    </ul>
  </main>

  ${footer()}
  <script src="static/theme.js"></script>
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
  ${SITE_BASE ? `<meta property="og:url" content="${esc(`${SITE_BASE}/${DECKS_SUBDIR}/${v.id}/`)}">` : ''}
  <meta name="twitter:card" content="summary">
  <link rel="stylesheet" href="../../static/style.css">
  ${THEME_BOOT}
</head>
<body class="detail">
  ${topbar(`charlas/${v.id}`)}
  <main class="wrap">
    <a class="back" href="../../index.html">$ cd ..</a>
    <h1>${esc(v.title)}</h1>
    ${v.subtitle ? `<p class="lead">${esc(v.subtitle)}</p>` : ''}
    <p class="metaline status-${esc(v.status)}"><time>${esc(v.dateLabel)}</time><span class="ev">${esc(v.event)}</span><span class="badge">${esc(v.statusLabel)}</span></p>

    <p class="desc">${esc(v.description)}</p>

    <div class="actions">
      ${actionButtons(v, '../../')}
    </div>

    <dl class="meta">
${meta}
    </dl>

    ${topics ? `<section><h2>Temas</h2><ul class="tags">${topics}</ul></section>` : ''}
    ${audience ? `<section><h2>Público</h2><ul class="tags">${audience}</ul></section>` : ''}
    ${v.links.notes ? `<section><h2>Recursos</h2><div class="actions"><a class="cmd" href="${esc(v.links.notes)}" rel="noopener">notas del ponente ↗</a></div></section>` : ''}
  </main>

  ${footer()}
  <script src="../../static/theme.js"></script>
</body>
</html>`;
}

function copyUnit(srcDir, destDir) {
  for (const p of UNIT_PATHS) {
    const s = path.join(srcDir, p);
    if (!fs.existsSync(s)) continue;
    if (fs.statSync(s).isDirectory()) {
      copyDir(s, path.join(destDir, p));
    } else {
      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(s, path.join(destDir, p));
    }
  }
}

function main() {
  const talks = loadAllTalks();
  const dirById = new Map(talks.map((t) => [t.data.id || path.basename(t.dir), t.dir]));
  const views = talks
    .map(normalise)
    .sort((a, b) => sortKey(b.date).localeCompare(sortKey(a.date)));

  fs.rmSync(SITE, { recursive: true, force: true });
  fs.mkdirSync(SITE, { recursive: true });
  copyDir(STATIC_SRC, path.join(SITE, 'static'));

  fs.writeFileSync(path.join(SITE, 'index.html'), indexPage(views));

  for (const v of views) {
    const dir = path.join(SITE_DECKS, v.id);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), detailPage(v));
    if (v.engine === 'exelearning' && dirById.get(v.id)) {
      copyUnit(dirById.get(v.id), path.join(dir, 'unit'));
    }
  }

  const json = JSON.stringify(views, null, 2);
  fs.writeFileSync(path.join(SITE, 'index.json'), json);
  fs.writeFileSync(path.join(OUTPUT, 'index.json'), json);

  console.log(`✓ Site generated at ${path.relative(ROOT, SITE)} (${views.length} talk(s)).`);
}

main();
