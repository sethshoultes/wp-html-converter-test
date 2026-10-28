// Pieces shared by the tool adapters.

import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

// WordPress slug for each source page. index becomes the front page.
export const SLUGS = { index: 'home', about: 'about', services: 'services', contact: 'contact' };

// Download a pinned release zip and refuse it unless its sha256 matches the pin.
export async function fetchPinnedZip(tool, destFile) {
  const response = await fetch(tool.zip, { redirect: 'follow' });
  if (!response.ok) {
    throw new Error(`Download failed (${response.status}): ${tool.zip}`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  const sha = createHash('sha256').update(bytes).digest('hex');
  if (sha !== tool.zip_sha256) {
    throw new Error(`sha256 mismatch for ${tool.zip}: got ${sha}, pinned ${tool.zip_sha256}`);
  }
  writeFileSync(destFile, bytes);
  return sha;
}

export function installPluginStep(vfsPath) {
  return { step: 'installPlugin', pluginData: { resource: 'vfs', path: vfsPath }, options: { activate: true } };
}

// PHP that creates one published page per source page and records the IDs.
// $content_for is PHP that sets $content for $page (raw markup, already read).
// Runs as user 1 (an administrator), so kses does not filter what is saved.
export function insertPagesPhp(pages, contentFor) {
  return `<?php
require '/wordpress/wp-load.php';
wp_set_current_user( 1 );
$slugs = ${phpArray(SLUGS)};
$out = array();
foreach ( ${phpList(pages)} as $page ) {
  ${contentFor}
  $id = wp_insert_post( array(
    'post_type'    => 'page',
    'post_status'  => 'publish',
    'post_title'   => ucfirst( $page === 'index' ? 'home' : $page ),
    'post_name'    => $slugs[ $page ],
    'post_content' => $content,
  ), true );
  $out[ $page ] = is_wp_error( $id )
    ? array( 'error' => $id->get_error_message() )
    : array( 'id' => $id, 'url' => get_permalink( $id ), 'stored_content' => get_post_field( 'post_content', $id, 'raw' ) );
  if ( 'index' === $page && ! is_wp_error( $id ) ) {
    update_option( 'show_on_front', 'page' );
    update_option( 'page_on_front', $id );
  }
}
file_put_contents( '/harness/out/pages.json', wp_json_encode( $out, JSON_PRETTY_PRINT ) );
`;
}

export function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

export function writeInputs(work, inputs) {
  for (const [page, html] of Object.entries(inputs)) {
    writeFileSync(path.join(work, 'input', `${page}.html`), html);
  }
}

function phpList(items) {
  return `array( ${items.map((i) => `'${i}'`).join(', ')} )`;
}

function phpArray(map) {
  return `array( ${Object.entries(map).map(([k, v]) => `'${k}' => '${v}'`).join(', ')} )`;
}
