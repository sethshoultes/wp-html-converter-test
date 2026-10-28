// Unit checks for the harness pieces that run before any converter does.
// Run: node --test harness/test/

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { SAMPLE_DIR, pins } from '../lib/env.mjs';
import { pageBody } from '../lib/input.mjs';
import { nodeSupported } from '../tools/block-runner.mjs';
import { insertPagesPhp } from '../tools/common.mjs';

const BASE = 'http://127.0.0.1:9400/sample-site/';

test('pageBody resolves relative src and href against the served copy and changes nothing else', () => {
  const body = pageBody(SAMPLE_DIR, 'index', BASE);
  assert.ok(!body.includes('<head>') && !body.includes('<title>'), 'head is not part of the input');
  assert.ok(body.includes('src="http://127.0.0.1:9400/sample-site/assets/img/logo.svg"'));
  assert.ok(body.includes('href="http://127.0.0.1:9400/sample-site/services.html#tune-ups"'));
  assert.ok(body.includes("document.body.dataset.inlineScript = 'ran';"), 'inline script is kept');
  assert.ok(!/\s(?:src|href)="(?!https?:|mailto:|tel:|#)/.test(body), 'no relative URL is left');
});

test('pageBody leaves absolute, mailto and tel URLs alone', () => {
  const body = pageBody(SAMPLE_DIR, 'contact', BASE);
  assert.ok(body.includes('href="tel:+15555550142"'));
  assert.ok(body.includes('href="mailto:hello@quillfern.example"'));
  const about = pageBody(SAMPLE_DIR, 'about', BASE);
  assert.ok(about.includes('src="https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ"'));
});

test('Block Runner Node check matches its engines field', () => {
  assert.equal(pins.tools['block-runner'].node_engines, '^22.23.4 || ^24.22.1 || >=26.12.1');
  assert.equal(nodeSupported([24, 6, 0]), false);
  assert.equal(nodeSupported([24, 22, 1]), true);
  assert.equal(nodeSupported([22, 23, 3]), false);
  assert.equal(nodeSupported([22, 23, 4]), true);
  assert.equal(nodeSupported([23, 99, 0]), false);
  assert.equal(nodeSupported([25, 1, 0]), false);
  assert.equal(nodeSupported([26, 12, 1]), true);
  assert.equal(nodeSupported([27, 0, 0]), true);
});

test('generated page-insert PHP is valid PHP', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'h2b-php-'));
  const file = path.join(dir, 'insert.php');
  writeFileSync(file, insertPagesPhp(pins.pages, '$content = file_get_contents( "/harness/input/{$page}.html" );'));
  const outText = execFileSync('php', ['-l', file], { encoding: 'utf8' });
  assert.match(outText, /No syntax errors/);
});
