// b. Static Site Importer: the pinned release zip as a plugin, then its WP-CLI
// import of the whole sample site as one ZIP, with the generated theme activated.
// Script policy is left at the tool's default ("inert"; see TOOLS.md).

import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { SAMPLE_DIR } from '../lib/env.mjs';
import { fetchPinnedZip, installPluginStep } from './common.mjs';

const LIST_PAGES_PHP = `<?php
require '/wordpress/wp-load.php';
$out = array( 'page_on_front' => (int) get_option( 'page_on_front' ), 'stylesheet' => get_stylesheet(), 'pages' => array() );
foreach ( get_posts( array( 'post_type' => 'page', 'post_status' => 'any', 'numberposts' => -1 ) ) as $p ) {
  $out['pages'][] = array( 'id' => $p->ID, 'slug' => $p->post_name, 'title' => $p->post_title, 'url' => get_permalink( $p ), 'stored_content' => $p->post_content );
}
file_put_contents( '/harness/out/ssi-pages.json', wp_json_encode( $out, JSON_PRETTY_PRINT ) );
`;

export default {
  id: 'static-site-importer',
  async prepare(ctx) {
    await fetchPinnedZip(ctx.tool, path.join(ctx.work, 'plugin.zip'));
    const zip = path.join(ctx.work, 'sample-site.zip');
    execFileSync('zip', ['-r', '-X', '-q', zip, '.', '-x', 'FEATURES.md'], { cwd: SAMPLE_DIR });
    writeFileSync(
      path.join(ctx.work, 'request.json'),
      `${JSON.stringify({ source: { type: 'zip', ref: 'request-bundle:sample-site.zip' }, operation: 'apply', activate: true }, null, 2)}\n`,
    );
    return [
      installPluginStep('/harness/plugin.zip'),
      { step: 'wp-cli', command: 'wp static-site-importer import --request=/harness/request.json --report=/harness/out/ssi-import-report.json' },
      { step: 'runPHP', code: LIST_PAGES_PHP },
    ];
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
