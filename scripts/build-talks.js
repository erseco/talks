#!/usr/bin/env node
'use strict';

/**
 * Render every talk that ships a `slides.md`, dispatching on its `engine`:
 *
 *   - slidev (default): build a static SPA into output/talks/<id>/slides/ and
 *     export a PDF to output/talks/<id>/<id>.pdf
 *   - marp: render a single-file HTML + PDF to output/talks/<id>/<id>.{html,pdf}
 *   - external: skipped (slides live elsewhere)
 *
 * HTML is mandatory; PDF is best-effort (needs a Chrome/Chromium browser, via
 * Playwright for Slidev). Set BUILD_PDF=0 to skip PDF. The Slidev `--base` must
 * match the final Pages URL, derived from data/site.yml.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { ROOT, DECKS_SUBDIR, loadAllTalks, siteBasePath } = require('./lib/talks');

const OUTPUT = path.join(ROOT, 'output', 'talks');
const THEME_DIR = path.join(ROOT, 'assets', 'themes');
const BUILD_PDF = process.env.BUILD_PDF !== '0';
const BASE = siteBasePath();

function bin(name) {
  const local = path.join(ROOT, 'node_modules', '.bin', name);
  return fs.existsSync(local) ? local : name;
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

function run(cmd, args) {
  return spawnSync(cmd, args, { cwd: ROOT, stdio: 'inherit', env: process.env }).status === 0;
}

const stats = { html: 0, pdf: 0, pdfFail: 0 };

function buildSlidev(id, src, outDir) {
  const slidev = bin('slidev');
  const spaDir = path.join(outDir, 'slides');
  fs.rmSync(spaDir, { recursive: true, force: true });
  const base = `${BASE}${DECKS_SUBDIR}/${id}/slides/`;
  console.log(`→ ${id} [slidev]: HTML (base ${base})`);
  if (run(slidev, ['build', src, '--base', base, '--out', spaDir])) {
    stats.html++;
  } else {
    console.error(`  ✗ Slidev build failed for ${id}`);
    process.exitCode = 1;
  }
  if (BUILD_PDF) {
    console.log(`→ ${id} [slidev]: PDF`);
    if (run(slidev, ['export', src, '--output', path.join(outDir, `${id}.pdf`), '--format', 'pdf', '--timeout', '90000'])) {
      stats.pdf++;
    } else {
      stats.pdfFail++;
      console.warn(`  ⚠ Slidev PDF export failed for ${id} (needs Playwright Chromium); continuing.`);
    }
  }
}

function buildMarp(id, src, outDir) {
  const marp = bin('marp');
  const common = ['--html', '--theme-set', THEME_DIR, '--allow-local-files', '--base-dir', path.dirname(src)];
  console.log(`→ ${id} [marp]: HTML`);
  if (run(marp, [...common, src, '-o', path.join(outDir, `${id}.html`)])) {
    stats.html++;
  } else {
    console.error(`  ✗ Marp build failed for ${id}`);
    process.exitCode = 1;
  }
  if (BUILD_PDF) {
    console.log(`→ ${id} [marp]: PDF`);
    if (run(marp, [...common, '--pdf', src, '-o', path.join(outDir, `${id}.pdf`)])) {
      stats.pdf++;
    } else {
      stats.pdfFail++;
      console.warn(`  ⚠ Marp PDF export failed for ${id}; continuing.`);
    }
  }
}

function build() {
  const decks = loadAllTalks().filter((t) => {
    const engine = t.data.engine || 'slidev';
    return engine !== 'external' && t.hasSlides;
  });

  if (decks.length === 0) {
    console.log('No buildable decks (slides.md) found. Nothing to build.');
    return;
  }

  fs.mkdirSync(OUTPUT, { recursive: true });

  for (const t of decks) {
    const id = t.data.id || path.basename(t.dir);
    const engine = t.data.engine || 'slidev';
    const outDir = path.join(OUTPUT, id);
    fs.mkdirSync(outDir, { recursive: true });
    copyDir(path.join(t.dir, 'assets'), path.join(outDir, 'assets'));
    const src = path.join(t.dir, 'slides.md');

    if (engine === 'marp') buildMarp(id, src, outDir);
    else buildSlidev(id, src, outDir);
  }

  console.log(`Built HTML: ${stats.html}, PDF: ${stats.pdf}${stats.pdfFail ? `, PDF failed: ${stats.pdfFail}` : ''}`);
}

build();
