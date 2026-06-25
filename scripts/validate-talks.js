#!/usr/bin/env node
'use strict';

/**
 * Validate every `talk.yml` against a minimal schema.
 * Exits non-zero (and prints each problem) when anything is wrong.
 */

const fs = require('fs');
const path = require('path');
const { loadAllTalks } = require('./lib/talks');

const REQUIRED = ['id', 'title', 'date', 'year', 'event', 'language', 'type', 'status', 'engine'];
const ENGINES = ['slidev', 'marp', 'external'];
const STATUSES = [
  'draft',
  'ready',
  'delivered',
  'external',
  'external-link-unverified',
  'archived',
];
const TYPES = ['talk', 'workshop', 'session', 'keynote', 'lightning'];

function validate() {
  const talks = loadAllTalks();
  if (talks.length === 0) {
    console.error('✗ No talks found under talks/. Add at least one talk.yml.');
    process.exit(1);
  }

  const errors = [];
  const seenIds = new Map();

  for (const t of talks) {
    const d = t.data;
    const where = t.repoPath;
    const folder = path.basename(t.dir);

    for (const field of REQUIRED) {
      if (d[field] === undefined || d[field] === null || d[field] === '') {
        errors.push(`${where}: missing required field "${field}"`);
      }
    }

    if (d.id && d.id !== folder) {
      errors.push(`${where}: id "${d.id}" does not match folder name "${folder}"`);
    }
    if (d.id) {
      if (seenIds.has(d.id)) {
        errors.push(`${where}: duplicate id "${d.id}" (also in ${seenIds.get(d.id)})`);
      } else {
        seenIds.set(d.id, where);
      }
    }

    if (d.date && !/^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/.test(String(d.date))) {
      errors.push(`${where}: date "${d.date}" must be YYYY, YYYY-MM or YYYY-MM-DD with a valid month/day (quote it in YAML)`);
    }
    if (d.year && d.date && !String(d.date).startsWith(String(d.year))) {
      errors.push(`${where}: year ${d.year} does not match date ${d.date}`);
    }
    if (d.status && !STATUSES.includes(d.status)) {
      errors.push(`${where}: unknown status "${d.status}" (allowed: ${STATUSES.join(', ')})`);
    }
    if (d.type && !TYPES.includes(d.type)) {
      errors.push(`${where}: unknown type "${d.type}" (allowed: ${TYPES.join(', ')})`);
    }
    if (d.engine && !ENGINES.includes(d.engine)) {
      errors.push(`${where}: unknown engine "${d.engine}" (allowed: ${ENGINES.join(', ')})`);
    }

    if (d.engine === 'slidev' || d.engine === 'marp') {
      const source = (d.formats && d.formats.source) || 'slides.md';
      if (!fs.existsSync(path.join(t.dir, source))) {
        errors.push(`${where}: engine "${d.engine}" but source "${source}" does not exist`);
      }
    }

    if (typeof d.status === 'string' && d.status.startsWith('external')) {
      const ext = d.external || {};
      if (!ext.source_url && !ext.canonical_url && !ext.pdf_url && !ext.event_url) {
        errors.push(`${where}: external talk has no external.* URL to point at`);
      }
    }

    if (!d.license || (!d.license.content && !d.license.code)) {
      errors.push(`${where}: missing license.content / license.code`);
    }
  }

  if (errors.length) {
    console.error(`✗ ${errors.length} validation error(s):`);
    for (const e of errors) console.error('  - ' + e);
    process.exit(1);
  }

  console.log(`✓ ${talks.length} talk(s) validated successfully.`);
}

validate();
