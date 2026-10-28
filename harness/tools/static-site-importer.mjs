// b. Static Site Importer, by the publisher's own Playground route
// (docs/playground/blueprint.json at the pinned commit): the pinned release zip,
// the separate demo plugin that owns the importer block, and the whole sample
// site uploaded as one ZIP through that block in the browser, under PHP 8.5.
// Script policy is left at the tool's default ("inert"; see TOOLS.md).
//
// Left out of the publisher's blueprint, because neither takes part in a ZIP
// import: the WordPress.com migration plugin (a handoff after import) and
// networking (used only for URL imports).

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { SAMPLE_DIR } from '../lib/env.mjs';
import { fetchPinnedZip, installPluginStep, sha256 } from './common.mjs';

const DEMO_SLUG = 'static-site-importer-playground-demo';
const IMPORT_TIMEOUT_MS = 300_000; // the publisher's own verifier waits this long for a ZIP import

// The publisher's blueprint steps, verbatim apart from the harness's vfs paths.
const POLICY_MU_PLUGIN = "<?php add_filter( 'static_site_importer_retain_response_artifacts', '__return_false' );";
const IMPORT_PAGE_PHP = `<?php require_once '/wordpress/wp-load.php';
$page = get_page_by_path( 'import', OBJECT, 'page' );
$content = '<!-- wp:static-site-importer/importer /-->';
$post = array(
    'post_title' => 'Import Static Site',
    'post_name' => 'import',
    'post_type' => 'page',
    'post_status' => 'publish',
    'post_content' => $content,
    'comment_status' => 'closed',
    'ping_status' => 'closed',
);
if ( $page instanceof WP_Post ) {
    $post['ID'] = $page->ID;
    wp_update_post( $post );
} else {
    wp_insert_post( $post );
}
update_option( 'static_site_importer_protected_pages', array( 'import' ), false );
?>`;

// Fetch the demo plugin's files at the pinned commit, refuse any file whose
// sha256 differs from the pin, and zip them under the plugin's folder name.
export async function buildDemoZip(demo, workDir, fetchFile = defaultFetch) {
  const root = path.join(workDir, 'demo-src');
  rmSync(root, { recursive: true, force: true });
  for (const [rel, pinned] of Object.entries(demo.files)) {
    const url = `https://raw.githubusercontent.com/Automattic/static-site-importer/${demo.commit}/${demo.path}/${rel}`;
    const text = await fetchFile(url);
    const got = sha256(text);
    if (got !== pinned) {
      throw new Error(`sha256 mismatch for ${url}: got ${got}, pinned ${pinned}`);
    }
    const file = path.join(root, DEMO_SLUG, rel);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, text);
  }
  const zip = path.join(workDir, 'demo.zip');
  rmSync(zip, { force: true });
  execFileSync('zip', ['-r', '-X', '-q', zip, DEMO_SLUG], { cwd: root });
  return zip;
}

async function defaultFetch(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed (${response.status}): ${url}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

// Lists the site's pages over the REST API as the logged-in admin.
async function listPages(page, url) {
  return page.evaluate(async (base) => {
    const nonce = await (await fetch(`${base}/wp-admin/admin-ajax.php?action=rest-nonce`)).text();
    const get = async (route) => {
      const response = await fetch(`${base}/wp-json${route}`, { headers: { 'X-WP-Nonce': nonce } });
      if (!response.ok) {
        throw new Error(`GET ${route}: ${response.status}`);
      }
      return response.json();
    };
    const settings = await get('/wp/v2/settings');
    const themes = await get('/wp/v2/themes?status=active');
    const pages = await get('/wp/v2/pages?context=edit&per_page=100&status=publish,draft,private');
    return {
      page_on_front: Number(settings.page_on_front),
      stylesheet: themes[0] ? themes[0].stylesheet : null,
      pages: pages.map((p) => ({ id: p.id, slug: p.slug, title: p.title.raw, url: p.link, stored_content: p.content.raw })),
    };
  }, url);
}

export default {
  id: 'static-site-importer',
  async prepare(ctx) {
    await fetchPinnedZip(ctx.tool, path.join(ctx.work, 'plugin.zip'));
    await buildDemoZip(ctx.tool.playground_demo, ctx.work);
    const zip = path.join(ctx.work, 'sample-site.zip');
    execFileSync('zip', ['-r', '-X', '-q', zip, '.', '-x', 'FEATURES.md'], { cwd: SAMPLE_DIR });
    return [
      { step: 'writeFile', path: '/wordpress/wp-content/mu-plugins/static-site-importer-demo-policy.php', data: POLICY_MU_PLUGIN },
      installPluginStep('/harness/plugin.zip'),
      installPluginStep('/harness/demo.zip'),
      { step: 'runPHP', code: IMPORT_PAGE_PHP },
    ];
  },
  // The import itself: upload the ZIP in the importer block, as the publisher's
  // verifier does, and wait for the block's own redirect to the imported home.
  async afterBoot(ctx, browser) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    const responses = [];
    const pending = [];
    page.on('response', (response) => {
      if (response.url().includes('static-site-importer/v1/imports')) {
        pending.push(
          response
            .text()
            .then((body) => responses.push({ status: response.status(), body: safeJson(body) }))
            .catch((error) => responses.push({ status: response.status(), body_error: error.message })),
        );
      }
    });
    const record = { route: ctx.tool.route, php: ctx.tool.php, sample_zip_sha256: null, imported: false, error: null, final_url: null, status_text: null };
    try {
      record.sample_zip_sha256 = sha256(readFileSync(path.join(ctx.work, 'sample-site.zip')));
      await page.goto(`${ctx.url}/import/`, { waitUntil: 'load' });
      await page.locator('.ssi-importer').waitFor({ state: 'visible', timeout: 120_000 });
      const home = await page.locator('[data-static-site-importer]').getAttribute('data-static-site-importer-home-url');
      await page.locator('[data-static-site-importer-source-files]').setInputFiles(path.join(ctx.work, 'sample-site.zip'));
      await page.locator('[data-static-site-importer-submit]:enabled').click();
      await page.waitForURL((u) => u.href === new URL(home, ctx.url).href, { timeout: IMPORT_TIMEOUT_MS });
      record.imported = true;
    } catch (error) {
      record.error = error.message.split('\n')[0];
      record.status_text = await page.locator('[data-static-site-importer-progress]').textContent().catch(() => null);
    }
    record.final_url = page.url();
    await Promise.all(pending);
    writeFileSync(path.join(ctx.work, 'out', 'ssi-import-responses.json'), `${JSON.stringify(responses, null, 2)}\n`);
    writeFileSync(path.join(ctx.work, 'out', 'ssi-import.json'), `${JSON.stringify(record, null, 2)}\n`);
    writeFileSync(path.join(ctx.work, 'out', 'ssi-pages.json'), `${JSON.stringify(await listPages(page, ctx.url), null, 2)}\n`);
    await context.close();
    return { import: record };
  },
  // Map source pages to the pages the importer made: index is the front page,
  // the rest match by slug. Anything unmatched is recorded, not guessed.
  mapPages(ctx, listing) {
    const map = {};
    for (const name of ctx.pages) {
      const hit = name === 'index' ? listing.pages.find((p) => p.id === listing.page_on_front) : listing.pages.find((p) => p.slug === name);
      map[name] = hit ? { id: hit.id, url: hit.url, stored_content: hit.stored_content } : { error: 'no matching page after import' };
    }
    return map;
  },
};

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { unparsed: text.slice(0, 4000) };
  }
}
