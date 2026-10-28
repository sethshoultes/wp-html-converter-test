// One scored run of one converter, on a fresh throwaway Playground.
//
// Usage: node harness/run.mjs <tool>
//   tools: rawhandler, static-site-importer, blocks-engine, block-runner, html-to-blocks-converter
//
// Refuses to run unless RUBRIC.md is byte-for-byte the rubric commit recorded in
// README.md and the working tree is clean, so every result names the exact
// harness and rubric it came from. Writes results/<tool>/<page>.json and the
// screenshots beside them. Scores are filled in later, from this evidence only.

import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { captureEditor, captureFrontend } from './lib/capture.mjs';
import { RESULTS_DIR, SAMPLE_DIR, WORK_DIR, buildBlueprint, git, pins, rubricCommit, sampleMount, servedBase, versions, writeJson } from './lib/env.mjs';
import { pageBody } from './lib/input.mjs';
import { startPlayground } from './lib/playground.mjs';
import { sha256, writeInputs } from './tools/common.mjs';

const ADAPTERS = ['rawhandler', 'static-site-importer', 'blocks-engine', 'block-runner', 'html-to-blocks-converter'];
const toolId = process.argv[2];
if (!ADAPTERS.includes(toolId)) {
  console.error(`Usage: node harness/run.mjs <${ADAPTERS.join('|')}>`);
  process.exit(2);
}

const rubric = rubricCommit();
if (!rubric) {
  throw new Error('README.md does not record the rubric commit.');
}
try {
  git('diff', '--quiet', rubric, 'HEAD', '--', 'RUBRIC.md');
} catch {
  throw new Error(`RUBRIC.md differs from the rubric commit ${rubric}. Scored runs use the fixed rubric only.`);
}
if (git('status', '--porcelain').length > 0) {
  throw new Error('Working tree is not clean. Commit harness changes before a scored run.');
}

const adapter = (await import(`./tools/${toolId}.mjs`)).default;
const work = path.join(WORK_DIR, toolId);
const out = path.join(RESULTS_DIR, toolId);
rmSync(work, { recursive: true, force: true });
mkdirSync(path.join(work, 'input'), { recursive: true });
mkdirSync(path.join(work, 'out'), { recursive: true });
mkdirSync(out, { recursive: true });

const expectedUrl = `http://127.0.0.1:${pins.platform.port}`;
const inputs = Object.fromEntries(pins.pages.map((p) => [p, pageBody(SAMPLE_DIR, p, servedBase(expectedUrl))]));
writeInputs(work, inputs);
const ctx = { pages: pins.pages, tool: pins.tools[toolId], work, inputs, url: expectedUrl };

const runDate = new Date();
const timings = {};
let t = Date.now();
const steps = await adapter.prepare(ctx);
timings.prepare_ms = Date.now() - t;
const blueprintFile = path.join(work, 'blueprint.json');
buildBlueprint(steps, blueprintFile);

t = Date.now();
const server = await startPlayground({
  pins,
  blueprintPath: blueprintFile,
  mounts: [sampleMount, `${work}:/harness`],
  logFile: path.join(work, 'playground.log'),
});
timings.boot_and_blueprint_ms = Date.now() - t;
console.log(`Playground ${server.cli} ready at ${server.url} (pid ${server.pid})`);

let browser;
try {
  if (server.url !== expectedUrl) {
    throw new Error(`Playground is at ${server.url}, expected ${expectedUrl}; inputs were resolved against the expected one.`);
  }
  const readOut = (name) => JSON.parse(readFileSync(path.join(work, 'out', name), 'utf8'));
  ctx.wpPages = adapter.mapPages ? adapter.mapPages(ctx, readOut('ssi-pages.json')) : readOut('pages.json');

  browser = await chromium.launch();
  let afterBoot = {};
  if (adapter.afterBoot) {
    t = Date.now();
    afterBoot = await adapter.afterBoot(ctx, browser);
    timings.after_boot_ms = Date.now() - t;
  }

  const rel = (p) => path.relative(out, p);
  const relShots = (shots) => {
    for (const vp of Object.values(shots)) {
      vp.screenshot = rel(vp.screenshot);
    }
    return shots;
  };

  for (const page of pins.pages) {
    const wpPage = ctx.wpPages[page];
    const original = relShots(await captureFrontend(browser, `${servedBase(server.url)}${page}.html`, path.join(out, `original-${page}`)));
    const record = {
      dry_run: false,
      tool: toolId,
      tool_pin: pins.tools[toolId],
      page,
      run_date: runDate.toISOString(),
      versions: versions(server.cli),
      input: { file: `.harness-tmp/${toolId}/input/${page}.html`, sha256: sha256(inputs[page]) },
      timings,
      wordpress_page: wpPage,
      original,
      converted: null,
      editor: null,
      after_boot: afterBoot.converted_markup ? { converted_markup: afterBoot.converted_markup[page] } : null,
      checks: null,
      scores: null,
    };
    if (wpPage && wpPage.id) {
      record.converted = relShots(await captureFrontend(browser, wpPage.url, path.join(out, `converted-${page}`)));
      const editor = await captureEditor(browser, `${server.url}/wp-admin/post.php?post=${wpPage.id}&action=edit`, path.join(out, `converted-${page}`));
      editor.screenshot = rel(editor.screenshot);
      editor.list_view_screenshot = rel(editor.list_view_screenshot);
      record.editor = editor;
    }
    writeJson(path.join(out, `${page}.json`), record);
    console.log(`Wrote ${path.join(out, `${page}.json`)}`);
  }
  writeFileSync(path.join(out, 'blueprint.json'), readFileSync(blueprintFile));
  cpSync(path.join(work, 'out'), path.join(out, 'tool-output'), { recursive: true });
} finally {
  if (browser) {
    await browser.close();
  }
  await server.stop();
  console.log(`Stopped Playground pid ${server.pid}`);
}
