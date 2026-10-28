// a. Gutenberg rawHandler, as bundled in the pinned WordPress. No plugin.
// Empty pages are created at boot; after boot each page's body HTML goes
// through wp.blocks.rawHandler in the block editor and the page is saved.

import { insertPagesPhp } from './common.mjs';

export default {
  id: 'rawhandler',
  async prepare(ctx) {
    return [{ step: 'runPHP', code: insertPagesPhp(ctx.pages, "$content = '';") }];
  },
  async afterBoot(ctx, browser) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    const converted = {};
    for (const name of ctx.pages) {
      const { id } = ctx.wpPages[name];
      await page.goto(`${ctx.url}/wp-admin/post.php?post=${id}&action=edit`, { waitUntil: 'load' });
      await page.waitForFunction(() => window.wp && window.wp.blocks && window.wp.data.select('core/editor').getCurrentPostId(), null, { timeout: 120_000 });
      converted[name] = await page.evaluate(async (HTML) => {
        const blocks = window.wp.blocks.rawHandler({ HTML });
        window.wp.data.dispatch('core/block-editor').resetBlocks(blocks);
        await window.wp.data.dispatch('core/editor').savePost();
        return window.wp.data.select('core/editor').getEditedPostContent();
      }, ctx.inputs[name]);
    }
    await context.close();
    return { converted_markup: converted };
  },
};
