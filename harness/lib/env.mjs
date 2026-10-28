// Shared paths, pins, versions and blueprint assembly for harness scripts.

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const SAMPLE_DIR = path.join(ROOT, 'sample-site');
export const RESULTS_DIR = path.join(ROOT, 'results');
export const WORK_DIR = path.join(ROOT, '.harness-tmp');

export const pins = JSON.parse(readFileSync(path.join(ROOT, 'harness', 'pins.json'), 'utf8'));

// The served copy of the sample site, and the mount that serves it.
export const servedBase = (url) => `${url}/sample-site/`;
export const sampleMount = `${SAMPLE_DIR}:/wordpress/sample-site`;

export function git(...args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
}

export function rubricCommit() {
  return readFileSync(path.join(ROOT, 'README.md'), 'utf8').match(/Rubric commit: `([0-9a-f]{40})`/)?.[1] ?? null;
}

export function versions(cli) {
  return {
    php: pins.platform.php,
    wp: pins.platform.wp,
    theme: `${pins.platform.theme} ${pins.platform.theme_version}`,
    playground_cli: cli,
    playwright: require('playwright/package.json').version,
    node: process.version,
    harness_commit: git('rev-parse', 'HEAD'),
    harness_dirty: git('status', '--porcelain').length > 0,
    rubric_commit: rubricCommit(),
  };
}

// Base blueprint from the repo, with a tool's steps appended. The merged copy
// is written into the run's work dir and also kept with the results.
export function buildBlueprint(extraSteps, outFile) {
  const base = JSON.parse(readFileSync(path.join(ROOT, 'harness', 'blueprint.json'), 'utf8'));
  if (base.preferredVersions.php !== pins.platform.php || base.preferredVersions.wp !== pins.platform.wp) {
    throw new Error('harness/blueprint.json preferredVersions do not match harness/pins.json');
  }
  base.steps = [{ step: 'activateTheme', themeFolderName: pins.platform.theme }, ...base.steps, ...extraSteps];
  mkdirSync(path.dirname(outFile), { recursive: true });
  writeFileSync(outFile, `${JSON.stringify(base, null, 2)}\n`);
  return base;
}

export function writeJson(file, data) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}
