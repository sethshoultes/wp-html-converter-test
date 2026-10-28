// Screenshots and raw observations, taken the same way for every page.
//
// Frontend: full-page screenshots at the two rubric widths, plus the computed
// facts the rubric checks read (RUBRIC.md, "Evidence for every cell").
// Editor: the block editor view, the List View, and every block's validity.

export const VIEWPORTS = [
  { name: '1280', width: 1280, height: 800 },
  { name: '390', width: 390, height: 844 },
];

const SETTLE_MS = 1500;

// Runs in the page. Collects what the rubric checks look at, with no scoring.
function collectFrontendFacts() {
  const visible = (el) => {
    const s = getComputedStyle(el);
    return s.display !== 'none' && s.visibility !== 'hidden' && el.getClientRects().length > 0;
  };
  const style = (selector, prop) => {
    const el = document.querySelector(selector);
    return el ? getComputedStyle(el)[prop] : null;
  };
  const firstHeading = document.querySelector('h1, h2, h3');
  return {
    url: location.href,
    title: document.title,
    viewport: { width: innerWidth, height: innerHeight },
    scroll_width: document.documentElement.scrollWidth,
    headings: [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].filter(visible).map((h) => ({
      level: Number(h.tagName[1]),
      text: h.textContent.trim().replace(/\s+/g, ' '),
      id: h.id || null,
    })),
    text: document.body.innerText.replace(/\s+/g, ' ').trim(),
    lists: [...document.querySelectorAll('ol, ul')].map((l) => ({
      tag: l.tagName.toLowerCase(),
      items: [...l.children].filter((c) => c.tagName === 'LI').map((li) => li.textContent.trim().replace(/\s+/g, ' ')),
    })),
    tables: [...document.querySelectorAll('table')].map((t) => ({
      caption: t.caption ? t.caption.textContent.trim() : null,
      thead_cells: t.tHead ? t.tHead.rows[0]?.cells.length ?? 0 : 0,
      body_rows: [...t.tBodies].reduce((n, b) => n + b.rows.length, 0),
      row_headers: t.querySelectorAll('tbody th').length,
    })),
    links: [...document.querySelectorAll('a[href]')].map((a) => ({
      text: a.textContent.trim().replace(/\s+/g, ' '),
      href: a.href,
      class: a.className || null,
      aria_current: a.getAttribute('aria-current'),
      background: getComputedStyle(a).backgroundColor,
      visible: visible(a),
    })),
    images: [...document.images].map((img) => ({
      src: img.currentSrc || img.src,
      alt: img.getAttribute('alt'),
      natural_width: img.naturalWidth,
      visible: visible(img),
    })),
    figcaptions: [...document.querySelectorAll('figcaption')].map((f) => f.textContent.trim()),
    background_images: [...document.querySelectorAll('*')]
      .map((el) => getComputedStyle(el).backgroundImage)
      .filter((b) => b && b !== 'none' && b.includes('url(')),
    iframes: [...document.querySelectorAll('iframe')].map((f) => ({
      src: f.src,
      width: f.getBoundingClientRect().width,
      height: f.getBoundingClientRect().height,
    })),
    svgs: [...document.querySelectorAll('svg')].map((s) => ({
      title: s.querySelector('title')?.textContent ?? null,
      shapes: s.querySelectorAll('path, circle, rect, text').length,
      visible: visible(s),
    })),
    forms: [...document.querySelectorAll('form')].map((f) => ({
      controls: [...f.elements].map((c) => ({
        tag: c.tagName.toLowerCase(),
        type: c.type || null,
        name: c.name || null,
        required: c.required || false,
        label: c.labels && c.labels[0] ? c.labels[0].textContent.trim() : null,
        options: c.tagName === 'SELECT' ? c.options.length : undefined,
      })),
    })),
    scripts: {
      inline_script_marker: document.body.dataset.inlineScript ?? null,
      site_script_marker: document.body.dataset.siteScript ?? null,
      script_tags: document.querySelectorAll('script').length,
    },
    theme: {
      heading_font: firstHeading ? getComputedStyle(firstHeading).fontFamily : null,
      heading_colors: [...document.querySelectorAll('h1, h2, h3, h4')].map((h) => ({
        text: h.textContent.trim().slice(0, 60),
        color: getComputedStyle(h).color,
        font: getComputedStyle(h).fontFamily,
      })),
      arvo_faces: [...document.fonts]
        .filter((f) => f.family.replace(/["']/g, '') === 'Arvo')
        .map((f) => ({ weight: f.weight, status: f.status })),
      body_background: getComputedStyle(document.body).backgroundColor,
      body_color: getComputedStyle(document.body).color,
      header_background: style('header, .site-header, .wp-block-template-part', 'backgroundColor'),
      button_background: style('a.button, .wp-block-button__link', 'backgroundColor'),
    },
  };
}

export async function captureFrontend(browser, url, outPrefix) {
  const result = {};
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    // Frontend shots are taken logged out (no admin bar): this cookie tells
    // Playground its auto-login already happened, so it does not log us in.
    await context.addCookies([{ name: 'playground_auto_login_already_happened', value: '1', url }]);
    const page = await context.newPage();
    const response = await page.goto(url, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(SETTLE_MS);
    const shot = `${outPrefix}-${vp.name}.png`;
    await page.screenshot({ path: shot, fullPage: true });
    result[vp.name] = {
      status: response ? response.status() : null,
      screenshot: shot,
      facts: await page.evaluate(collectFrontendFacts),
    };
    await context.close();
  }
  return result;
}

// Runs in the editor. Lists every block (nested), its validity and text size.
function collectEditorFacts() {
  const { select } = window.wp.data;
  const flat = [];
  const walk = (blocks, depth) => {
    for (const b of blocks) {
      const html = window.wp.blocks.getBlockContent ? window.wp.blocks.getBlockContent(b) : '';
      const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      flat.push({ name: b.name, isValid: b.isValid, depth, text_length: depth === 0 ? text.length : null });
      walk(b.innerBlocks || [], depth + 1);
    }
  };
  walk(select('core/block-editor').getBlocks(), 0);
  const canvas = document.querySelector('iframe[name="editor-canvas"]');
  const doc = canvas && canvas.contentDocument ? canvas.contentDocument : document;
  return {
    blocks: flat,
    block_counts: flat.reduce((acc, b) => ({ ...acc, [b.name]: (acc[b.name] || 0) + 1 }), {}),
    invalid_blocks: flat.filter((b) => b.isValid === false).length,
    recovery_notices: doc.querySelectorAll('.block-editor-warning').length,
  };
}

export async function captureEditor(browser, editUrl, outPrefix) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const console_messages = [];
  page.on('console', (msg) => {
    const text = msg.text();
    if (/Block validation|unexpected or invalid content/i.test(text)) {
      console_messages.push(text.slice(0, 2000));
    }
  });
  await page.goto(editUrl, { waitUntil: 'load' });
  await page.waitForFunction(
    () => window.wp && window.wp.data && window.wp.data.select('core/editor') && window.wp.data.select('core/editor').getCurrentPostId(),
    null,
    { timeout: 120_000 },
  );
  await page.waitForTimeout(SETTLE_MS * 2);
  const welcomeGuideVisible = (await page.locator('.components-guide').count()) > 0;
  const editorShot = `${outPrefix}-editor.png`;
  await page.screenshot({ path: editorShot, fullPage: true });
  await page.evaluate(() => window.wp.data.dispatch('core/editor').setIsListViewOpened(true));
  await page.waitForTimeout(SETTLE_MS);
  const listShot = `${outPrefix}-listview.png`;
  await page.screenshot({ path: listShot, fullPage: true });
  const facts = await page.evaluate(collectEditorFacts);
  await context.close();
  return {
    screenshot: editorShot,
    list_view_screenshot: listShot,
    welcome_guide_visible: welcomeGuideVisible,
    console_validation_messages: console_messages,
    ...facts,
  };
}
