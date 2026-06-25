'use strict';

/**
 * Shared helpers to discover and load talk metadata.
 *
 * Each talk lives in `talks/<year>/<id>/` and is described by a `talk.yml`
 * file which is the single source of truth. These helpers are used by the
 * validate / build / site-generation / import scripts.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ROOT = path.resolve(__dirname, '..', '..');
const TALKS_DIR = path.join(ROOT, 'talks');

/** Recursively collect every `talk.yml` path under `dir`. */
function findTalkFiles(dir = TALKS_DIR) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findTalkFiles(full));
    else if (entry.isFile() && entry.name === 'talk.yml') out.push(full);
  }
  return out;
}

/** Load and lightly enrich a single talk from its `talk.yml` path. */
function loadTalk(talkYmlPath) {
  let data;
  try {
    data = yaml.load(fs.readFileSync(talkYmlPath, 'utf8')) || {};
  } catch (e) {
    throw new Error(`${path.relative(ROOT, talkYmlPath)}: invalid YAML — ${e.message.split('\n')[0]}`);
  }
  // YAML parses an unquoted full date (2026-07-03) to a Date object; normalise
  // it back to a string so sorting/formatting stay consistent regardless of quoting.
  if (data.date instanceof Date) data.date = data.date.toISOString().slice(0, 10);
  const dir = path.dirname(talkYmlPath);
  const repoPath = path.relative(ROOT, dir).split(path.sep).join('/');
  return {
    data,
    dir,
    repoPath,
    file: talkYmlPath,
    hasNotes: fs.existsSync(path.join(dir, 'notes.md')),
    // An eXeLearning unit (unzipped .elpx) ships a rendered index.html.
    hasUnit: fs.existsSync(path.join(dir, 'index.html')),
  };
}

/** Load all talks, sorted by descending date. */
function loadAllTalks() {
  return findTalkFiles()
    .map(loadTalk)
    .sort((a, b) => sortKey(b.data.date).localeCompare(sortKey(a.data.date)));
}

/** Normalise a (possibly partial) date to a sortable `YYYY-MM-DD` string. */
function sortKey(date) {
  const [y = '0000', m = '00', d = '00'] = String(date || '').split('-');
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

/** Parsed `data/site.yml`. */
function siteConfig() {
  try {
    return yaml.load(fs.readFileSync(path.join(ROOT, 'data', 'site.yml'), 'utf8')) || {};
  } catch {
    return {};
  }
}

/** Absolute URL path the site is served from (e.g. "/talks/"). Used as the Slidev base. */
function siteBasePath() {
  try {
    return new URL(siteConfig().site_url).pathname.replace(/\/?$/, '/');
  } catch {
    return '/';
  }
}

// Sub-directory of the generated site that holds per-talk pages and built decks.
const DECKS_SUBDIR = 'charlas';

module.exports = {
  ROOT, TALKS_DIR, DECKS_SUBDIR,
  findTalkFiles, loadTalk, loadAllTalks, sortKey, siteConfig, siteBasePath,
};
