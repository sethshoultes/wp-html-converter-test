# What the sample site exercises

Quillfern Cycle Works is a fictional bicycle repair shop in a fictional town,
Larkbend. No real person, brand or business is named. The phone number uses
the 555 range kept for fiction, the email uses the reserved `.example` domain,
and every price is invented and labelled so on the page.

Plain HTML, one stylesheet, one shared script, no framework and no build step.
Open `index.html` in a browser, or serve the folder with any static server.

Each feature below is there on purpose, because converters tend to lose it.
The "Rubric row" column says which RUBRIC.md criterion it feeds.

| Feature | Where | How it is built | Why converters trip on it | Rubric row |
|---|---|---|---|---|
| Shared nav and footer | all 4 pages | the same `<header class="site-header">` and `<footer class="site-footer">` copied into each page; `aria-current="page"` marks the current link | a page-content converter sees four copies of chrome, not one header; links point at `.html` files | links and nav |
| Small-screen menu toggle | all 4 pages | `<button class="nav-toggle">` shown under 640px, wired by `assets/js/site.js` | needs both the CSS media query and the external script | links and nav, scripts |
| Hero with a CSS background image | home | `.hero` sets `background-image: url("../img/hero.svg")` plus a gradient, in `site.css` only | the image is not in the markup at all, so markup-only converters cannot see it | images and captions, layout |
| Heading hierarchy | all; deepest on about (h1 to h4) | one `h1` per page, then `h2`, `h3`, `h4` in order; footer uses `h2` | levels get flattened, or footer headings outrank page ones | structure and headings |
| Ordered lists | about, services | `<ol>` with links inside items | numbering and nested inline links | lists and tables |
| Unordered lists | about, services (inside cards), contact, footer | `<ul>` | lists inside a card or nav are often flattened to paragraphs | lists and tables |
| Data table | services | `<table>` with `<caption>`, `<thead>`, `scope="col"`, row headers `<th scope="row">` | captions and row headers are often dropped | lists and tables |
| Card grid | home, services | `.cards` is CSS grid, `repeat(auto-fit, minmax(240px, 1fr))`; each card an `<article>` | grid layout lives in CSS; markup-only tools see stacked articles | layout |
| Image gallery with captions | about | `.gallery` is flexbox of four `<figure>` with `<img>` and `<figcaption>` | figures become loose images; captions lost; images not moved into the media library | images and captions, layout |
| Inline SVG | home (wrench icon), contact (map) | `<svg>` with `<title>` in the markup | no core block holds inline SVG, so it is dropped or put in an HTML block | embeds |
| Contact form | contact | `<form>` with text, email, select, textarea, checkbox and submit | core WordPress has no form block | forms |
| YouTube embed | about | `<iframe src="https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ">` in a 16:9 wrapper | iframes are stripped or not turned into an Embed block | embeds |
| Inline `<script>` | all 4 pages (year in footer); home (open-now line); contact (form handler) | `<script>` at the end of `<body>` | scripts are stripped from post content by design in many tools and by WordPress for non-admin users | scripts |
| External script | all 4 pages | `<script src="assets/js/site.js" defer>` in `<head>` | lives in the head, outside the body most tools read | scripts |
| CSS custom-property theme | `assets/css/site.css` | every colour and font comes from `--qf-*` variables on `:root` | the theme must be carried into `theme.json` or a stylesheet, or it is lost | typography and colours |
| Web font | `assets/css/site.css` | self-hosted Arvo via `@font-face` (`assets/fonts/`) | font files must be copied and registered; otherwise the theme font shows | typography and colours |
| Blockquote with citation | home, about | `<blockquote><p>...</p><cite>...</cite></blockquote>` | the `cite` is dropped or merged into the quote | structure and headings |
| Code block | services | `<pre><code class="language-js">` with escaped `&gt;` | whitespace and entities get mangled; may become a paragraph | structure and headings |
| Button-styled link | home hero, services, contact | `<a class="button">`; contact also has a styled `<button type="submit">` | a styled link should become a Buttons block, not a plain link | links and nav |
| Anchor links | home cards link to `services.html#tune-ups` etc. | `id` on headings and a card | ids and fragment links are dropped | links and nav |

## Assets and their licences

- `assets/img/*.svg`: drawn by hand for this repo (simple shapes), MIT like the rest of the site.
- `assets/fonts/Arvo-Regular.ttf`, `Arvo-Bold.ttf`: Arvo by Anton Koovit, SIL Open Font License 1.1, copied from https://github.com/google/fonts/tree/main/ofl/arvo. The licence text is in `assets/fonts/Arvo-OFL.txt`. The font keeps its OFL licence; it is not relicensed as MIT.
- The embedded film is Big Buck Bunny by the Blender Foundation, Creative Commons Attribution 3.0 (https://peach.blender.org/about/), played from the Blender Foundation's own YouTube upload. Nothing from it is copied into the repo.
