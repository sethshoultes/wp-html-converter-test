// DRY RUN ONLY. Not a result, and no converter is involved.
//
// Proves the harness end to end on a trivial page: a fresh Playground starts
// with the pinned versions from harness/blueprint.json, a blueprint step reads
// a file from the mounted work dir and creates a "Hello" page, and the frontend
// (1280, 390) and block editor screenshots land with a JSON record.
//
// Usage: node harness/dry-run.mjs

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { captureEditor, captureFrontend } from './lib/capture.mjs';
import { WORK_DIR, RESULTS_DIR, buildBlueprint, pins, sampleMount, servedBase, versions, writeJson } from './lib/env.mjs';
import { startPlayground } from './lib/playground.mjs';

const work = path.join(WORK_DIR, 'dry-run');
const out = path.join(RESULTS_DIR, 'dry-run');
mkdirSync(work, { recursive: true });
mkdirSync(out, { recursive: true });

writeFileSync(path.join(work, 'hello.html'), '<!-- wp:paragraph -->\n<p>Hello from the dry run.</p>\n<!-- /wp:paragraph -->\n');
const blueprintFile = path.join(work, 'blueprint.json');
buildBlueprint(
  [
    {
      step: 'runPHP',
      code: `<?php
require '/wordpress/wp-load.php';
wp_set_current_user( 1 );
$id = wp_insert_post( array(
  'post_type'    => 'page',
  'post_status'  => 'publish',
  'post_title'   => 'Hello',
  'post_name'    => 'hello',
  'post_content' => file_get_contents( '/harness/hello.html' ),
), true );
file_put_contents( '/harness/hello-id.txt', is_wp_error( $id ) ? 'error: ' . $id->get_error_message() : (string) $id );
`,
    },
  ],
  blueprintFile,
);

const startedAt = new Date();
const server = await startPlayground({
  pins,
  blueprintPath: blueprintFile,
  mounts: [sampleMount, `${work}:/harness`],
  logFile: path.join(work, 'playground.log'),
});
console.log(`Playground ${server.cli} ready at ${server.url} (pid ${server.pid})`);

let browser;
try {
  const pageId = readFileSync(path.join(work, 'hello-id.txt'), 'utf8').trim();
  if (!/^\d+$/.test(pageId)) {
    throw new Error(`Hello page was not created: ${pageId}`);
  }
  browser = await chromium.launch();
  const frontend = await captureFrontend(browser, `${server.url}/hello/`, path.join(out, 'hello'));
  const editor = await captureEditor(browser, `${server.url}/wp-admin/post.php?post=${pageId}&action=edit`, path.join(out, 'hello'));
  const original = await captureFrontend(browser, `${servedBase(server.url)}index.html`, path.join(out, 'original-index'));

  const rel = (p) => path.relative(out, p);
  for (const shot of [frontend, original]) {
    for (const vp of Object.values(shot)) {
      vp.screenshot = rel(vp.screenshot);
    }
  }
  editor.screenshot = rel(editor.screenshot);
  editor.list_view_screenshot = rel(editor.list_view_screenshot);

  writeJson(path.join(out, 'hello.json'), {
    dry_run: true,
    note: 'DRY RUN ONLY. Not a result. No converter was run; this proves Playground starts, mounts are visible to blueprint steps, and screenshots land.',
    run_date: startedAt.toISOString(),
    versions: versions(server.cli),
    playground: { url: server.url, pid: server.pid },
    page_id: Number(pageId),
    hello_frontend: frontend,
    hello_editor: editor,
    original_index_served_copy: original,
  });
  console.log(`Wrote ${path.join(out, 'hello.json')}`);
} finally {
  if (browser) {
    await browser.close();
  }
  await server.stop();
  console.log(`Stopped Playground pid ${server.pid}`);
}
