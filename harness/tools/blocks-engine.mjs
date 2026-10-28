// c. Blocks Engine PHP Transformer: the pinned release zip as a plugin, and its
// documented helper blocks_engine_php_transformer_transform_html() per page.

import path from 'node:path';
import { fetchPinnedZip, insertPagesPhp, installPluginStep } from './common.mjs';

export default {
  id: 'blocks-engine',
  async prepare(ctx) {
    await fetchPinnedZip(ctx.tool, path.join(ctx.work, 'plugin.zip'));
    const contentFor = `$result = blocks_engine_php_transformer_transform_html( file_get_contents( "/harness/input/{$page}.html" ) );
  file_put_contents( "/harness/out/{$page}.result.json", wp_json_encode( array_diff_key( $result, array( 'blocks' => 1 ) ), JSON_PRETTY_PRINT ) );
  $content = (string) $result['serialized_blocks'];`;
    return [installPluginStep('/harness/plugin.zip'), { step: 'runPHP', code: insertPagesPhp(ctx.pages, contentFor) }];
  },
};
