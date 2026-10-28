# wp-html-converter-test

A fair, repeatable test of the tools that turn a hand-coded HTML site into
WordPress blocks. Five converters run, one at a time, on the same four-page
sample site, each on a fresh throwaway WordPress (WordPress Playground, never a
live site), and each is scored on a rubric that was fixed before the first run.

Scores only; no winner beyond what the scores show.

## What is here

| Path | What it is |
|---|---|
| `TOOLS.md` | The five converters: confirmed names, sources, licences, pinned versions, how each runs, what input it takes |
| `sample-site/` | The fictional four-page site (home, about, services, contact), plain HTML/CSS/JS, no build step |
| `sample-site/FEATURES.md` | Every feature the site exercises on purpose, and which rubric row it feeds |
| `RUBRIC.md` | The scoring rubric, fixed before the first run |
| `harness/` | Scripts that start a fresh Playground, run one converter, take screenshots and write raw observations |
| `results/` | Raw observations and screenshots per tool and page (`results/dry-run/` is a harness check, not a result) |

## The rubric is fixed

Rubric commit: `0e06bffc80fb85e63937557802eba909d62c4849`

That commit adds `RUBRIC.md` and nothing else, before any converter was run.
`harness/run.mjs` refuses to run if `RUBRIC.md` differs from that commit.

## Pinned versions

| Component | Pinned | Source | Run date |
|---|---|---|---|
| PHP (Playground) | 8.3 | `@wp-playground/cli --php` | |
| WordPress | 7.1.4 | `@wp-playground/cli --wp` | |
| Theme for page-content tools | Twenty Twenty-Five 1.5 (bundled with 7.1.4) | WordPress core | |
| `@wp-playground/cli` | 3.1.61 (`npm view @wp-playground/cli@latest version` was 3.1.61 on 2026-10-28) | npm | |
| Playwright (Chromium) | 1.57.0 | npm | |
| Gutenberg `rawHandler` | bundled in WordPress 7.1.4 | [WordPress/gutenberg](https://github.com/WordPress/gutenberg/tree/trunk/packages/blocks/src/api/raw-handling) | |
| Static Site Importer | v1.33.179 (`54c883f`), run under PHP 8.5 by its publisher's Playground route (TOOLS.md) | [Automattic/static-site-importer](https://github.com/Automattic/static-site-importer) | |
| Blocks Engine PHP Transformer | php-transformer-v0.44.217 (`ece89fe`) | [Automattic/blocks-engine](https://github.com/Automattic/blocks-engine) | |
| Block Runner | `block-runner@1.0.0` (`a50f986`) | [humanmade/block-runner](https://github.com/humanmade/block-runner) | |
| HTML to Blocks Converter | v0.7.2 (`8736740`) | [chubes4/html-to-blocks-converter](https://github.com/chubes4/html-to-blocks-converter) | |

Full SHAs, release-zip checksums and the npm integrity hash are in
`TOOLS.md` and `harness/pins.json`. The harness checks each zip's sha256 before
installing it.

## Reproduce

Needs Node and npm, and nothing else on the machine: no PHP, no Docker, no
database. Block Runner needs Node `^22.23.4 || ^24.22.1 || >=26.12.1`; its run
uses Node 24.22.1 through `npx -y node@24.22.1` (pinned in `harness/pins.json`).

```sh
git clone <this repo> && cd wp-html-converter-test
npm ci
npx playwright install chromium

# Harness check on a trivial "Hello" page, no converter (not a result):
node harness/dry-run.mjs

# One converter at a time, each on a fresh Playground:
node harness/run.mjs rawhandler
node harness/run.mjs static-site-importer
node harness/run.mjs blocks-engine
npx -y node@24.22.1 harness/run.mjs block-runner   # Block Runner needs a newer Node; pinned, global Node unchanged
node harness/run.mjs html-to-blocks-converter
```

To look at the same throwaway site by hand:

```sh
npx @wp-playground/cli@3.1.61 server --php=8.3 --wp=7.1.4 --blueprint=harness/blueprint.json \
  --mount="$PWD/sample-site:/wordpress/sample-site"
```

## Status

Phase 1: tools confirmed, sample site built, rubric fixed, harness proved by a
dry run. No scored run has happened yet, and no converter has been run on the
sample site.

The dry run (2026-10-28, harness commit `6dc88dd`, `results/dry-run/`) is a
harness check only, not a result: a fresh Playground started with PHP 8.3 and
WordPress 7.1.4, a blueprint step created a "Hello" page from a mounted file,
and the frontend (1280, 390), block editor and List View screenshots landed,
along with the served copy of the original home page. The converter adapters
in `harness/tools/` are written but have not been run.

Unit checks: `npm test`.

## Licence

MIT (see `LICENSE`), except the Arvo font files in `sample-site/assets/fonts/`,
which keep their SIL Open Font License 1.1 (`Arvo-OFL.txt`). The converters
under test are not part of this repo and keep their own licences (TOOLS.md).
