# Observations from the runs (not scores)

Plain facts read from the saved evidence in `results/<tool>/`. Nothing here is
a score, and nothing here ranks the tools. A separate scorer applies
`RUBRIC.md` (unchanged since `0e06bffc80`) to the same evidence.

## How the runs were made

- **Run date:** 2026-10-28, all five tools.
- **Platform:** WordPress 7.1.4, `@wp-playground/cli` 3.1.61, Playwright 1.57.0,
  theme Twenty Twenty-Five 1.5 for the four page-content tools. One fresh
  throwaway Playground per tool run. No live site was used.
- **PHP:** 8.3 for rawhandler, Blocks Engine, Block Runner and HTML to Blocks
  Converter. **Static Site Importer ran under PHP 8.5, by a different route from
  the other four**: its publisher's own Playground route (an importer block
  from its separate demo plugin, with a ZIP uploaded in the browser). Its CLI
  route could not run in Playground. See TOOLS.md section b and
  `results/failed-attempts/static-site-importer-1/WHY-FAILED.txt`.
- **Node:** v24.6.0 for the harness, except Block Runner, which ran under
  v24.22.1 through `npx -y node@24.22.1` (its engines field needs
  `^22.23.4 || ^24.22.1 || >=26.12.1`). The machine's global Node was not changed.
- **Inputs (the approved rule):** the four page-content tools (rawhandler,
  Blocks Engine, Block Runner, HTML to Blocks Converter) each got the inner
  HTML of each page's `<body>`, including the shared header, footer and inline
  `<script>`, with relative links made absolute against the served copy at
  `/sample-site/`. Static Site Importer got the whole `sample-site/` as one
  ZIP. Static Site Importer's default script removal ("inert" policy) was left
  on.
- **Each JSON** (`results/<tool>/<page>.json`) records the exact versions under
  `versions` and the tool pin under `tool_pin`. `harness_dirty` is `false` in
  all twenty.

| Tool | Harness commit | PHP | Node | Attempts |
|---|---|---|---|---|
| rawhandler | `0456f76` | 8.3 | v24.6.0 | 2 (attempt 1 discarded, harness fault) |
| static-site-importer | `6c8b3a7` | 8.5 | v24.6.0 | 3 (two CLI attempts failed, then one publisher-route run) |
| blocks-engine | `9b49a75` | 8.3 | v24.6.0 | 1 |
| block-runner | `e03f662` | 8.3 | v24.22.1 | 1 |
| html-to-blocks-converter | `0f154cc` | 8.3 | v24.6.0 | 1 |

The harness commits differ because each tool's evidence was committed before
the next run. The capture code (`harness/lib/capture.mjs`) is the same in all
five. The commits in between changed only results, the Block Runner Node pin,
and the Static Site Importer adapter, PHP pin and run order.

### Retries and discarded attempts

- **rawhandler attempt 1** was discarded because of a harness fault: the index
  page was screenshotted logged in, with the admin bar. The cookie that keeps
  frontend shots logged out was scoped to `/home/`, and WordPress redirects the
  front page's `/home/` to `/`. Fixed in `db90da3` (cookie on path `/`, with a
  unit test), then rawhandler ran again on a fresh Playground. Attempt 1 is kept
  in `results/failed-attempts/rawhandler-1/`. Every other tool ran after the fix.
- **Static Site Importer attempts 1 and 2** (CLI route): Playground exited before
  it was ready, with `Error when executing the blueprint step #7: memory access
  out of bounds`. Attempt 2 was the one retry allowed for "Playground did not
  start". Kept in `results/failed-attempts/static-site-importer-{1,2}/`, with two
  diagnostic runs in `static-site-importer-diagnostics/`. On the operator's
  decision, the tool then ran once by its publisher's Playground route, and
  that run completed. It was not retried.
- No run was retried to change a converter's output.

### Path note

Logs and Block Runner's own JSON reports contained this machine's absolute
paths. Only those path prefixes were replaced with `<repo>` / `<home>` /
`<scratch>` / `<os-tmp>`. Nothing else in any tool output was changed.

## Facts that hold for all four page-content tools

These follow from the input rule and the default theme, not from any one tool:

- The theme prints the WordPress page title as an `h1` ("Home", "About",
  "Services", "Contact") above the converted content, so each converted page
  has two `h1`s. The original `h1` text is present in all sixteen.
- The theme's own header (site title "Converter test site", page list nav) and
  footer (Blog, About, FAQs, ...) wrap the converted content. The sample site's
  header, nav and footer come through as page content inside that.
- The theme's styles apply: headings in Manrope, body `rgb(255, 255, 255)` /
  `rgb(17, 17, 17)`, headings `rgb(17, 17, 17)`. No Arvo face is loaded. The
  sample site's stylesheet was not part of their input.
- Internal links in the converted content point at the static copy
  (`/sample-site/*.html`, `/sample-site/services.html#tune-ups` and so on), as
  the input rule made them. None of these four tools rewrote them to the
  WordPress pages.
- Images load from `/sample-site/assets/img/`. None was copied into the media
  library.
- The shared script (`body[data-site-script]`) did not run on any converted
  page from these tools.

## rawhandler (`wp.blocks.rawHandler`, bundled in WordPress 7.1.4)

- **Every page:** exactly four `core/html` blocks. rawHandler has no transform
  for the top-level `header`, `main`, `footer` and `script` nodes, so each became
  one Custom HTML block holding its markup unchanged. The editor reports 0
  invalid blocks, 0 recovery notices and 0 validation console messages. Share
  of text in `core/html` (from `post_content`, scripts excluded): index
  964/1418, about 1457/1709, services 1683/1935, contact 825/1327 characters.
- The frontend renders the raw markup unstyled: the brand link, a "Menu"
  button, the nav as a bulleted list, all headings in order, cards stacked one
  under another at 1280, the footer as plain headings and a list.
- **index:** original headings all present, in order. The inline script did not
  run (`data-inline-script` unset), and "We are open right now." is absent. The
  wrench SVG renders with its `<title>`. Scroll width 390 at 390.
- **about:** the inline script ran. All four gallery images load with their alt
  text, and the four captions are present. The YouTube iframe
  (`youtube-nocookie.com/embed/aqz-KE-bpKQ`) renders at 304 x 154, against
  1060 x 596 in the original at 1280. **At 390 the page scroll width is 630**
  (horizontal overflow).
- **services:** the inline script ran. The table keeps its caption (as
  `<caption>`), 4 header cells, 3 body rows and 3 row headers. Scroll width 390
  at 390.
- **contact:** the inline script ran. The form keeps all six controls, their
  labels, the five select options and `required` on name and email. The map SVG
  renders with its `<title>`.

## Static Site Importer (v1.33.179, publisher's Playground route, PHP 8.5)

- **Import:** one ZIP upload through the importer block. Six REST responses,
  all HTTP 200. The last reports `success: true`, `page_count: 4`, theme
  `quillfern-cycle-works` (generated and activated), `block_count: 53`,
  `diagnostic_count: 25`, `quality_pass: false` with failure reason
  `core_html_block` (`tool-output/ssi-import-responses.json`). It made pages
  `home` (front page), `about`, `services` and `contact`. The demo's `/import/`
  page also remains, as the publisher's blueprint intends.
- **Theme:** the generated theme carries the site's design. On every page:
  Arvo headings (700 loaded, 400 listed but `unloaded`), body
  `rgb(251, 248, 242)` / `rgb(26, 38, 36)`, header `rgb(31, 78, 95)`, headings
  `rgb(31, 78, 95)` (`rgb(251, 248, 242)` on the hero). Button-styled links
  ("Book a repair", "Book a service", "See services and prices") have
  background `rgb(233, 166, 75)`.
- **Links:** nav and internal links point at the WordPress pages (`/`,
  `/about/`, `/services/`, `/contact/`), and the card links point at
  `/services/#tune-ups`, `#wheels` and `#cargo`. The current page carries
  `aria-current="page"`. At 390 the nav links are not visible (behind the Menu
  button). No page has a theme-printed second `h1`.
- **Scripts:** neither marker is set on any page. That is the tool's default
  inert script policy. "We are open right now." is absent on index.
- **Images:** copied into the media library (`/wp-content/uploads/2026/10/`).
- **Editor:** each page opens inside its template ("Template: Front Page" on
  index). List View shows Header, Content and Footer, so the harness's
  block list holds `core/template-part` x2 and `core/post-content`, not the
  page's own blocks. The page's own markup is in `editor.post_content`. Block
  names in index's content: button, buttons, cover, group, heading, html,
  paragraph, quote.
- **index:** the hero is a `core/cover` with `hero.svg` as its background, at
  full width with the text over the image. In the editor this cover shows
  "Block contains unexpected or invalid content" (1 recovery notice, 2
  `Block validation` console messages: the `class` attribute differs). Three
  cards side by side at 1280. The wrench SVG renders but has no `<title>`.
  Share of text in `core/html`: 56/716.
- **about:** all headings and sentences present. Four gallery images with alt
  text and four captions. The video became a YouTube oEmbed iframe
  (`youtube.com/embed/aqz-KE-bpKQ?feature=oembed`) with **height 0** (1060 wide
  at 1280, 350 at 390). Lists match the original. No `core/html` text.
- **services:** the table keeps 4 header cells, 3 body rows and 3 row headers.
  Its caption text is in a `<figcaption>`, not a `<caption>`. Lists match. No
  `core/html` text.
- **contact:** the form became a Jetpack-style contact form (hidden fields
  `jetpack_contact_form_jwt`, `contact-form-id` and others). The visible
  controls are name and email (both `required`, labels kept), a select with 6
  options (the original has 5), the textarea, the checkbox and a submit button.
  The script tag count is 12. The map SVG renders but has no `<title>`. Share of
  text in `core/html`: 26/396.
- **Site Editor:** template parts were not opened in the Site Editor. Not
  captured.

## Blocks Engine PHP Transformer (php-transformer-v0.44.217)

- **Every page:** converted to core blocks, mostly groups, headings,
  paragraphs, lists, a `core/navigation` with four `navigation-link`s, and
  buttons. 0 invalid blocks and no validation console messages on any page.
- **index:** the hero is wrapped in an unregistered block `custom/layout-shell`.
  The editor shows it as `core/missing` (1 recovery notice). Its content renders
  on the frontend. The wrench SVG is in `core/html` without its `<title>`.
  "Book a repair" renders as a plain underlined link. The three cards sit side
  by side at 1280 as columns of text, with no box around each. The footer is
  stacked. The inline script did not run, and "We are open right
  now." is absent. Share of text in `core/html`: 56/921.
- **about:** gallery as `core/gallery` with four `core/image` blocks, alt text
  and captions kept. The video is a `core/embed` (YouTube oEmbed iframe) at
  500 x 281 at 1280. All sentences present. No `core/html` text.
- **services:** `core/table` keeps 4 header cells, 3 body rows and 3 row
  headers, with the caption in a `<figcaption>`. `core/code` holds the code
  sample. No `core/html` text.
- **contact:** the form became a `core/group` with `tagName: form` whose fields
  are paragraphs ("Your name (required)", "Email (required)", ...). No
  `<input>`, `<select>` or `<textarea>` is left. The only control is a submit
  button. An unregistered `custom/authored-button` shows as `core/missing` (1
  recovery notice). The map SVG is in `core/html` without its `<title>`. Share
  of text in `core/html`: 26/773.
- **Scripts:** no inline-script marker on any page. `tool-output/<page>.result.json`
  holds the transformer's own report for each page.

## Block Runner (`block-runner@1.0.0`, `convert`, Node 24.22.1)

- **Every page:** its own report says `ok: true`, every block valid, and
  "`<script>` stripped from input" among the warnings
  (`tool-output/<page>.report.json`). Unmapped elements are kept as `core/html`
  ("unmapped element, no native block, preserved as Custom HTML fallback"). The
  editor reports 0 invalid blocks, 0 recovery notices and no validation console
  messages on all four pages.
- **Scripts:** no inline-script marker on any page. The scripts were removed by
  the tool.
- **index:** cards in `core/columns`, three across at 1280. "Book a repair" is a
  `core/button` (filled, background `rgb(17, 17, 17)`, the theme's). The quote
  is a `core/quote`. The wrench SVG keeps its `<title>`. The footer columns sit
  side by side at 1280. Share of text in `core/html`: 166/966.
- **about:** four `core/image` blocks in `core/columns`, alt text and captions
  kept, no `core/gallery`. The YouTube iframe renders at 304 x 154. Share of
  text in `core/html`: 52/1459.
- **services:** `core/table` keeps header, rows and row headers, with the
  caption in a `<figcaption>`. `core/code` for the code sample. Share of text
  in `core/html`: 52/1679.
- **contact:** the form keeps all six controls, labels, five options and
  `required`, and sits in `core/html`. The map SVG keeps its `<title>`. Share of
  text in `core/html`: 332/791.

## HTML to Blocks Converter (v0.7.2)

- **Every page:** converted on save to core blocks (groups, paragraphs,
  headings, lists, quote). The "Menu" button, SVGs and scripts were kept in
  `core/html`.
- **index:** 0 invalid blocks. The cards are stacked, not side by side, at 1280.
  "Book a repair" is a plain link. The inline script did not run. "We are open
  right now." is absent. The wrench SVG keeps its `<title>`. Share of text in
  `core/html`: 4/1418.
- **about:** gallery as `core/gallery` with four `core/image` blocks. **All four
  `core/image` blocks are invalid in the editor** (4 recovery notices, 8
  console messages). On the frontend the images load with alt text and the
  four captions are present. The inline script ran. The YouTube iframe renders
  at 304 x 154.
- **services:** **two `core/heading` blocks are invalid** (2 recovery notices, 4
  console messages). The saved markup has `<h2 id="tune-ups">`, and the block's
  save output drops the `id`. `core/table` keeps header, rows and row headers,
  with the caption in a `<figcaption>`. `core/code` for the code sample. The
  inline script ran.
- **contact:** **the form is gone**. No `<form>`, `<input>`, `<select>` or
  `<textarea>` is in the stored content, and the labels ("Your name", "About
  the bike", ...) are not in the page text. What is left is a `core/group`
  (`#booking`) holding one `core/button` link, "Send booking request", with
  `href="#"`. The map SVG keeps its
  `<title>` in `core/html`. The inline script ran. Share of text in
  `core/html`: 89/1152.

## Rubric edge cases found (RUBRIC.md left unchanged)

1. **Theme page title as a second `h1`.** Criterion 1 needs "one `h1`, with the
   original's text". All four page-content tools show two, because Twenty
   Twenty-Five prints the page title. The rubric does not say whether a
   theme-printed title counts.
2. **Internal links and the input rule.** Criterion 5 needs internal links to
   open the converted WordPress page, "not the static copy". The approved input
   rule makes every link absolute to the static copy for the four page-content
   tools, so none of them can pass it unless the tool rewrites links. The
   rubric does not adjust for this.
3. **Table caption as `<figcaption>`.** `core/table` stores its caption in
   `<figcaption>`, not `<caption>`. Four tools did this (Static Site Importer,
   Blocks Engine, Block Runner, HTML to Blocks Converter). The facts record
   `caption: null` with the text present in `figcaptions`. Criterion 2 says
   "keeps ... its caption" without saying which element.
4. **Editor evidence for a template-wrapped page.** Static Site Importer's
   pages open in the editor inside their template, so `editor.blocks` and
   `isValid` cover only the template wrapper. Recovery notices and console
   validation messages are still recorded, and the page's blocks are in
   `editor.post_content`. Criterion 10's per-block `isValid` check cannot be read
   straight from `editor.blocks` for this tool.
5. **`button_background` fact.** The harness reads the first element matching
   `a.button, .wp-block-button__link`. For Static Site Importer that is
   `rgba(0, 0, 0, 0)`, while the visible button links have
   `rgb(233, 166, 75)` in `links[].background`. Criterion 9 should be read from
   `links[]`, not from `theme.button_background`.
6. **Behaviour checks the harness does not exercise.** Criterion 8 asks whether
   contact's submit shows the "Thanks" line and whether the Menu button opens
   the nav at 390. The harness records markers and visibility, not
   interactions. There is no click evidence for these.
7. **Media library question for Static Site Importer.** "Reported, not
   scored": its images were copied to `/wp-content/uploads/`. The four
   page-content tools load them from `/sample-site/`.
8. **Form replaced by a provider form.** Static Site Importer's contact form
   became a Jetpack-style form with a sixth select option and extra hidden
   fields. Criterion 6 counts "five options", and it is silent on a converted
   form that adds one.
9. **Different route and PHP for Static Site Importer.** It ran by its
   publisher's Playground route under PHP 8.5. The rubric's running rules
   assume one blueprint and one PHP for all tools.
