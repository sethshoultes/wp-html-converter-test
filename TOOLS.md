# The converters under test

Each candidate was checked on 2026-10-28 against its own source (GitHub API,
npm registry, release assets). Nothing here is from memory. A candidate that
could not be confirmed under its name, or could not be run, would be marked
EXCLUDED with the reason. None was: all five are confirmed.

Pins are fixed for the scored runs. If a pin has to move before phase 2, the
change is a separate commit that says why, and the README table is updated.

## Summary

| # | Name as published | Owner | Licence | Latest release (2026-10-28) | Pinned | Verdict |
|---|---|---|---|---|---|---|
| a | `rawHandler` in `@wordpress/blocks` (exposed as `wp.blocks.rawHandler`) | WordPress (Gutenberg project) | GPL-2.0-or-later / MPL-2.0 (dual) | WordPress 7.1.4 (core); Gutenberg plugin v24.3.0 | the copy bundled in WordPress 7.1.4 | CONFIRMED |
| b | Static Site Importer | Automattic | GPL-2.0 | v1.33.179 | v1.33.179, `54c883f13cb77e54ed2ee2312b7f6deb9ce0a5fd`, 2026-10-28 | CONFIRMED |
| c | Blocks Engine (PHP Transformer) | Automattic | GPL-3.0-or-later | php-transformer-v0.44.217 | php-transformer-v0.44.217, `ece89fe61c3c918ce4777b734b45176352b8c2d2`, 2026-10-28 | CONFIRMED |
| d | Block Runner (`block-runner` on npm) | Human Made | GPL-2.0-or-later | v1.0.0 | npm `block-runner@1.0.0`, tag `a50f986093b026c8579f77c584b7e0a61ae99084`, 2026-10-24 | CONFIRMED |
| e | HTML to Blocks Converter (`html-to-blocks-converter`) | Chris Huber (`chubes4`, independent) | GPL-2.0-or-later | v0.7.2 | v0.7.2, `873674012f6ec3a8f908914a2dfa3751242b908e`, 2026-06-02 | CONFIRMED |

None of b, c or e is listed on WordPress.org (the plugin API returns "Plugin
not found" for `static-site-importer`, `blocks-engine` and
`html-to-blocks-converter`). They install from their GitHub release zips.

## How inputs are given (the same rule for every tool)

The test takes each tool as it is published and feeds it the input it is
built to take, with no hand repair afterwards.

- **Page-content converters** (a, c, d, e) take HTML markup, not a site. Each
  gets the inner HTML of each page's `<body>`, including the shared nav, footer
  and inline `<script>`, with one mechanical change: every relative `src` and
  `href` is resolved to an absolute URL against the page's address in the
  served copy of the sample site (`/sample-site/` on the same Playground). That
  is what a browser gives when you copy from a live page, and without it every
  image path would break for reasons that have nothing to do with the tool.
  Nothing else is changed (`harness/lib/input.mjs` is the whole rule). They are
  not given the stylesheet, because none of them takes one. The converted markup
  becomes the content of one WordPress page per source page, under the pinned
  default theme.
- **The site importer** (b) takes a whole static site. It gets `sample-site/`
  as one ZIP, which is the intake its README names.

So b is the only tool that can carry the shared header, footer, CSS theme and
web font into WordPress. The rubric scores what lands, whoever's design that is;
it does not adjust for the difference. That difference is reported beside the
scores.

## a. Gutenberg `rawHandler`

- **Exact name:** `rawHandler`, exported from `@wordpress/blocks`
  (`packages/blocks/src/api/raw-handling/index.ts`, `export function rawHandler( { HTML = '' } )`).
  In the editor it is the global `wp.blocks.rawHandler`. It is the same
  conversion the editor's "Convert to blocks" uses on a Classic block. Its
  sibling `pasteHandler` handles clipboard paste.
- **Source:** https://github.com/WordPress/gutenberg/tree/trunk/packages/blocks/src/api/raw-handling
- **npm:** https://www.npmjs.com/package/@wordpress/blocks (latest 17.0.0; dist-tag `wp-7.0` = 15.13.1)
- **Owner / licence:** WordPress / Gutenberg contributors; code since 2021-04-15 is dual GPL-2.0-or-later and MPL-2.0 (repo `LICENSE.md`).
- **Latest release:** Gutenberg plugin v24.3.0 (2026-10-28, `dcea4fe78a552ad17ff5ba0d28b987c728747659`); WordPress core 7.1.4 (the current offer from `api.wordpress.org/core/version-check/1.7/`).
- **Pinned:** the copy bundled in WordPress 7.1.4. The Gutenberg plugin is NOT installed, so the code under test is what a site owner gets from core.
- **How it runs:** in the block editor of the throwaway Playground site. The harness opens a new page in the editor, calls `wp.blocks.rawHandler({ HTML })` in the page, puts the result into the editor with `wp.data.dispatch('core/block-editor').resetBlocks()`, and saves through `wp.data.dispatch('core/editor').savePost()`. No plugin, no network.
- **Input:** a string of HTML markup (pasted markup). One call per page.

## b. Static Site Importer

- **Exact name:** Static Site Importer (plugin header `Plugin Name: Static Site Importer`).
- **Source:** https://github.com/Automattic/static-site-importer
- **Owner / licence:** Automattic (GitHub organisation); GPL-2.0.
- **Latest release:** v1.33.179, published 2026-10-28T15:42:50Z. The repo releases several times a day (v1.33.177 to v1.33.179 all on 2026-10-28).
- **Pinned:** v1.33.179, commit `54c883f13cb77e54ed2ee2312b7f6deb9ce0a5fd` (2026-10-28T15:42:41Z), release asset `static-site-importer.zip`, sha256 `d7c2238cd8ef75e35b358ea3e86d2e56f258b8e4cb69e5fbe4dc720404ebbc57`. The zip bundles its own `vendor/`, including `automattic/blocks-engine-php-transformer` v0.44.216 (`composer.lock` at the tag; the README's "pins 0.33.0" line is out of date).
- **Requirements (plugin header):** WordPress 7.1 or later, PHP 8.2 or later. Run here under PHP 8.5 (see How it runs).
- **How it runs:** the publisher's own Playground route (`docs/playground/blueprint.json` at the pinned commit), under **PHP 8.5**, which that blueprint names. The other four tools run under PHP 8.3. The blueprint installs the pinned plugin zip, the publisher's host-policy MU plugin (`static_site_importer_retain_response_artifacts` off) and the separate **Static Site Importer Playground Demo** plugin, which owns the importer block, then creates the `/import/` page with that block. The harness opens `/import/` in the browser, uploads `sample-site.zip` in the block, presses "Generate WordPress Website" and waits up to 300 s for the block's own redirect to the imported home page. That is the same flow as the publisher's `tools/verify-playground-launch.mjs`. The block asks for `activate: true` and `theme_materialization: block`.
  - **The demo plugin** (`demos/playground-importer/`, version 1.0.0) has no published zip for v1.33.179: GitHub Pages publication stops at v1.28.0. The harness fetches its six files at the pinned commit, refuses any whose sha256 differs from `harness/pins.json`, and zips them.
  - **Left out of the publisher's blueprint:** the WordPress.com migration plugin (a handoff after import) and `networking` (used only for URL imports). Neither takes part in a ZIP import.
  - **Why not the CLI:** the first plan was `wp static-site-importer import --request=<request.json>` in a Playground `wp-cli` step. It failed twice on fresh Playgrounds with PHP-WASM `memory access out of bounds`: the CLI import re-launches WP-CLI through `proc_open()`, which Playground cannot do, and its `--single-step --state` mode crashes the same way one step later. The attempts and diagnostics are kept in `results/failed-attempts/static-site-importer-*`.
- **Input:** pasted HTML, one public URL, a single `.html` file, a folder of files, or a ZIP with a root `index.html` (README "What It Does" and `includes/cli.php`). This test uses the ZIP.
- **Behaviour to know before scoring:** by default it strips every executable `<script>` (its "inert" client-script policy, README "Client Script Policy"). The only way to keep scripts is an opt-in meant for isolated previews. The test runs the default, so the scripts row shows the default.

## c. Blocks Engine

- **Exact name:** Blocks Engine (repo `Automattic/blocks-engine`). The part that converts HTML is its **PHP Transformer** (`php-transformer/`, plugin header `Plugin Name: Blocks Engine PHP Transformer`, Composer name `automattic/blocks-engine-php-transformer`). The monorepo also has a JavaScript package, `@automattic/blocks-engine` 0.2.2 on npm, described as primitives; it is not the HTML converter used here.
- **Source:** https://github.com/Automattic/blocks-engine (read-only subtree mirror of the PHP part: https://github.com/Automattic/blocks-engine-php-transformer)
- **Owner / licence:** Automattic; GPL-3.0-or-later.
- **Latest release:** php-transformer-v0.44.217, published 2026-10-28T17:11:33Z (several releases a day).
- **Pinned:** php-transformer-v0.44.217, commit `ece89fe61c3c918ce4777b734b45176352b8c2d2` (2026-10-28T17:10:34Z), release asset `php-transformer.zip`, sha256 `b47c45f10c676fc49c614aff44e2bcad71809ae46b499d7953a995803ec24ee8`.
- **Requirements:** PHP 8.2 or later (plugin header).
- **How it runs:** the release zip installs as a thin WordPress plugin. The harness calls its documented helper `blocks_engine_php_transformer_transform_html( $html )` (in `php-transformer.php`) through `wp eval-file`, takes the serialized block markup from the result, and saves it as the page's content.
- **Input:** an HTML string (a fragment). The same package also compiles whole site artifacts, but that path is what Static Site Importer (b) wraps, so this entry tests the HTML transformer on its own.

## d. Block Runner

- **Exact name:** Block Runner; npm package `block-runner`, CLI `block-runner`.
- **Source:** https://github.com/humanmade/block-runner ; npm https://www.npmjs.com/package/block-runner ; homepage https://www.accelerateplugin.com/block-runner
- **Owner / licence:** Human Made (GitHub organisation `humanmade`); GPL-2.0-or-later.
- **Latest release:** v1.0.0, GitHub release 2026-10-24T12:39:50Z; npm `block-runner@1.0.0`, integrity `sha512-xz8SlBp1jvo0MMaocKd5tDS/dqyYbmxdqwdFiQEv1UyV9KEhUOiZ6XjbOvfst4JGS5UZwhjf3kogAGcnQ3Iacg==`.
- **Pinned:** `block-runner@1.0.0` (tag commit `a50f986093b026c8579f77c584b7e0a61ae99084`, 2026-10-24T12:39:23Z).
- **Requirements:** Node `^22.23.4 || ^24.22.1 || >=26.12.1` (`engines`). The README states the package makes no AI model calls; the test uses only its built-in rules (`convert`), never an agent.
- **How it runs:** headless, outside WordPress: `npx --no-install block-runner convert <page-body>.html --out <page>.blocks.html --json`. The harness saves the output markup into a Playground page with WP-CLI. The JSON report (warnings, fallback blocks) is kept as a raw observation.
- **Input:** a single HTML file (or string through the library). One call per page. Its whole-site route (`site compile` / `plan` / `apply`) takes an agent's structured plan, not raw HTML, so it is out of scope for a no-agent test.

## e. html-to-blocks-converter

- **Exact name:** HTML to Blocks Converter (plugin header), repo `chubes4/html-to-blocks-converter`.
- **Source:** https://github.com/chubes4/html-to-blocks-converter
- **Owner / licence:** Chris Huber (GitHub user `chubes4`, https://chubes.net), an individual, not an organisation; GPL-2.0-or-later.
- **Latest release:** v0.7.2, 2026-06-02T04:14:04Z, asset `html-to-blocks-converter.zip`.
- **Pinned:** v0.7.2, commit `873674012f6ec3a8f908914a2dfa3751242b908e` (2026-06-02T04:13:58Z), sha256 `e3b85f9be71fc0232af5d234ac77fe9f7f9f31136ab8094c67404e533a4da5c3`.
- **Requirements:** WordPress 6.4+, PHP 7.4+ (plugin header); no Composer dependencies at v0.7.2.
- **How it runs:** plugin zip installed by the blueprint. With the plugin active, raw HTML written through `wp_insert_post()` is converted to blocks on save. The harness writes each page's body HTML with `wp post create` and reads back the stored block markup.
- **Input:** an HTML string (post content). One page per call.
- **Note on independence:** the pinned v0.7.2 has its own converter built on WordPress core's HTML API. The repo's `main` branch is 66 commits ahead and, unreleased, turns the plugin into a "legacy" shim that delegates to Blocks Engine (`composer.json` on `main` requires `automattic/blocks-engine-php-transformer`). The test pins the release, so e is an independent engine here. A later release may not be.

## Considered, not included

Found while searching; real, but not added to the set.

- **WP Post HTML to Blocks** (WordPress.org slug `wp-post-html-to-blocks`), v1.2, last updated 2023-08-16, tested to WordPress 6.1, 0 active installs. Not maintained.
- **guzmandrade-dev/html-to-blocks** (GPL-3.0), last push 2026-06-06, no releases found, 0 stars.
- **karl-mantle/html-to-gutenberg-blocks**, created 2026-10-22, no licence, built for WP All Import. Too new and site-specific.
- **Gutenberg `pasteHandler`**, the clipboard sibling of `rawHandler` in the same package. Not a separate tool.
