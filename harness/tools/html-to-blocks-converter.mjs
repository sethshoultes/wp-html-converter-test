// e. HTML to Blocks Converter: the pinned release zip as a plugin. With it
// active, raw HTML saved through wp_insert_post() is converted on save.

import path from 'node:path';
import { fetchPinnedZip, insertPagesPhp, installPluginStep } from './common.mjs';

export default {
  id: 'html-to-blocks-converter',
  async prepare(ctx) {
    await fetchPinnedZip(ctx.tool, path.join(ctx.work, 'plugin.zip'));
    const contentFor = '$content = file_get_contents( "/harness/input/{$page}.html" );';
    return [installPluginStep('/harness/plugin.zip'), { step: 'runPHP', code: insertPagesPhp(ctx.pages, contentFor) }];
  },
};
