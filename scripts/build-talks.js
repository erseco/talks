#!/usr/bin/env node
'use strict';

/**
 * Render every Marp deck (talks that ship a `slides.md`) to HTML and PDF
 * under `output/talks/<id>/`.
 *
 * - HTML is mandatory (build fails if it cannot be produced).
 * - PDF is best-effort: it needs a Chrome/Chromium browser. If it fails the
 *   build keeps going so the site can still be generated. Set BUILD_PDF=0 to
 *   skip PDF entirely.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { ROOT, loadAllTalks } = require('./lib/talks');

const OUTPUT = path.join(ROOT, 'output', 'talks');
const THEME_DIR = path.join(ROOT, 'assets', 'themes');
const BUILD_PDF = process.env.BUILD_PDF !== '0';

function marpBin() {
  if (process.env.MARP_BIN) return process.env.MARP_BIN;
  const local = path.join(ROOT, 'node_modules', '.bin', 'marp');
  return fs.existsSync(local) ? local : 'marp';
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

function run(bin, args) {
  return spawnSync(bin, args, { cwd: ROOT, stdio: 'inherit', env: process.env }).status === 0;
}

function build() {
  const marp = marpBin();
  const decks = loadAllTalks().filter((t) => t.hasSlides);

  if (decks.length === 0) {
    console.log('No Marp decks (slides.md) found. Nothing to build.');
    return;
  }

  fs.mkdirSync(OUTPUT, { recursive: true });
  let htmlOk = 0;
  let pdfOk = 0;
  let pdfFail = 0;

  for (const t of decks) {
    const id = t.data.id || path.basename(t.dir);
    const outDir = path.join(OUTPUT, id);
    fs.mkdirSync(outDir, { recursive: true });
    copyDir(path.join(t.dir, 'assets'), path.join(outDir, 'assets'));

    const src = path.join(t.dir, 'slides.md');
    const common = ['--html', '--theme-set', THEME_DIR, '--allow-local-files', '--base-dir', t.dir];

    console.log(`→ ${id}: HTML`);
    if (run(marp, [...common, src, '-o', path.join(outDir, `${id}.html`)])) {
      htmlOk++;
    } else {
      console.error(`  ✗ HTML build failed for ${id}`);
      process.exitCode = 1;
    }

    if (BUILD_PDF) {
      console.log(`→ ${id}: PDF`);
      if (run(marp, [...common, '--pdf', src, '-o', path.join(outDir, `${id}.pdf`)])) {
        pdfOk++;
      } else {
        pdfFail++;
        console.warn(`  ⚠ PDF build failed for ${id} (needs a Chrome/Chromium browser); continuing.`);
      }
    }
  }

  console.log(`Built HTML: ${htmlOk}, PDF: ${pdfOk}${pdfFail ? `, PDF failed: ${pdfFail}` : ''}`);
}

build();
