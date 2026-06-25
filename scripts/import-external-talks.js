#!/usr/bin/env node
'use strict';

/**
 * Best-effort importer for externally hosted talk PDFs.
 *
 * For every talk that declares `external.pdf_url`, fetch it and cache it under
 * `output/external/<id>.pdf` (gitignored). Verifies it is really a PDF. This
 * never edits `talk.yml`; it only reports which links are reachable, so you
 * can decide whether to mark a talk `external` or `external-link-unverified`.
 */

const fs = require('fs');
const path = require('path');
const { ROOT, loadAllTalks } = require('./lib/talks');

const OUT = path.join(ROOT, 'output', 'external');

async function main() {
  const targets = loadAllTalks().filter((t) => t.data.external && t.data.external.pdf_url);
  if (targets.length === 0) {
    console.log('No talks declare external.pdf_url. Nothing to import.');
    return;
  }

  fs.mkdirSync(OUT, { recursive: true });

  for (const t of targets) {
    const id = t.data.id || path.basename(t.dir);
    const url = t.data.external.pdf_url;
    process.stdout.write(`→ ${id}: ${url}\n  `);

    try {
      const res = await fetch(url, { redirect: 'follow' });
      if (!res.ok) {
        console.log(`UNVERIFIED (HTTP ${res.status})`);
        continue;
      }
      const type = res.headers.get('content-type') || '';
      const buf = Buffer.from(await res.arrayBuffer());
      if (!/pdf/i.test(type) && buf.slice(0, 4).toString() !== '%PDF') {
        console.log(`SKIP (not a PDF: content-type "${type}")`);
        continue;
      }
      const dest = path.join(OUT, `${id}.pdf`);
      fs.writeFileSync(dest, buf);
      console.log(`OK (${(buf.length / 1024).toFixed(0)} KB) → ${path.relative(ROOT, dest)}`);
    } catch (err) {
      console.log(`UNVERIFIED (${err.message})`);
    }
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
