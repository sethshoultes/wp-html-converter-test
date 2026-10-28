# Rubric (fixed before the first run)

This file was committed on its own before any converter was run on the sample
site. Its commit SHA is recorded in README.md. If it changes after a scored run,
every scored run is thrown out and redone under the new version, and the
change gets its own commit saying why.

## What is scored

Five converters (TOOLS.md) by four pages (`index`, `about`, `services`,
`contact`) by ten criteria. Each applicable cell scores 0, 1 or 2:

- **0, lost or broken:** none of the criterion's checks pass, or what came
  through is broken (wrong content, unreadable, throws an error, or the block
  editor reports it invalid).
- **1, partly kept or needs manual repair:** some checks pass but not all, or
  they all pass only at one of the two widths, or the content is there but only
  inside a Classic or Custom HTML block, so a person would have to rebuild it.
- **2, kept faithfully:** every check for that criterion passes at both widths.

Each criterion below lists its checks. A check is a yes/no observation that
anyone can repeat from the saved evidence. The score is read straight off the
checks with the rule above; there is no other judgment and no weighting.

## Evidence for every cell

For each tool and page the harness saves, under `results/<tool>/`:

1. The **original** page, served from the same Playground at `/sample-site/`,
   screenshotted at 1280 x 800 and 390 x 844, full page.
2. The **converted frontend** page, screenshotted at the same two sizes.
3. The **block editor** view of the converted page (1280 wide), plus the
   editor's List View.
4. The editor's **validation result** for every block: the harness reads
   `wp.data.select('core/block-editor').getBlocks()` and records each block's
   name and `isValid`, and records every "This block contains unexpected or
   invalid content" (block recovery) notice and every `Block validation failed`
   console message.
5. Computed facts from the converted frontend: heading outline, visible text,
   link targets, image loads, computed fonts and colours, script markers
   (`body[data-inline-script]`, `body[data-site-script]`), iframe and SVG presence.
6. `results/<tool>/<page>.json`: the raw observations above, the tool and
   platform versions, the run date, and the scorer's yes/no for each check
   with the evidence file it rests on.

A check is judged at both widths unless it says "editor".

## Which cells apply

A criterion applies to a page only if the original page has the feature. A cell
that does not apply is shown as "n/a" and counts toward neither the score nor
the maximum.

| Criterion | index | about | services | contact |
|---|---|---|---|---|
| 1. Structure and headings | yes | yes | yes | yes |
| 2. Lists and tables | yes | yes | yes | yes |
| 3. Layout (cards, gallery) | yes | yes | yes | yes |
| 4. Images and captions | yes | yes | yes | yes |
| 5. Links and nav | yes | yes | yes | yes |
| 6. Forms | n/a | n/a | n/a | yes |
| 7. Embeds (iframe, SVG) | yes | yes | n/a | yes |
| 8. Scripts | yes | yes | yes | yes |
| 9. Typography and colours | yes | yes | yes | yes |
| 10. Editable in the block editor | yes | yes | yes | yes |

That is 36 cells per tool, so the most a tool can score is **72**.

## The criteria and their checks

### 1. Structure and headings
- The page has one `h1`, with the original's text.
- Every original heading is present, with the same level and in the same order
  (compared on the heading outline the harness extracts; the shared header and
  footer headings count where the original has them).
- All of the original's paragraph text is present (visible text compared after
  collapsing whitespace; every original sentence must appear).
- Where the original has them: the blockquote is a quote with its `cite` kept
  apart from the quote text (index, about); the code block keeps its line
  breaks, indentation and the `>=` characters (services).

### 2. Lists and tables
- Every original list is still a list of the same kind (`ol` or `ul`) with the
  same items in the same order, including lists inside cards and the footer.
- Links inside list items still work.
- Services only: the table keeps all rows and columns, its header row, its row
  headers and its caption.

### 3. Layout (cards, gallery)
- Header: brand and nav sit on one row at 1280; at 390 the nav collapses behind
  the Menu button or stacks cleanly without overflowing the screen.
- Index: the hero is a full-width band with its text over the image.
- Index, services: the cards sit side by side at 1280 (three across) and stack
  at 390, each card a distinct box.
- About: the gallery images sit side by side at 1280 and wrap at 390.
- Footer: its columns sit side by side at 1280 and stack at 390.
- Nothing overflows horizontally at 390 (page scroll width equals viewport width).

### 4. Images and captions
- Every original `<img>` loads (natural width above 0) and keeps its `alt` text.
- Index: the hero background image is visible behind the hero text.
- About: all four gallery captions are present, each with its own image.
- Reported, not scored: whether images were copied into the media library or
  still load from the original location.

### 5. Links and nav
- The four nav links are present, in order, with their labels.
- Internal links (nav, footer, cards, buttons) open the converted WordPress
  page for that link, not the static copy and not a 404.
- Anchor links (`services.html#tune-ups`, `#wheels`, `#cargo`) land on the
  right section.
- Button-styled links still look like buttons (filled background, padding),
  not plain text links.
- The current page is marked in the nav (`aria-current` or a visible marker).

### 6. Forms (contact only)
- All six controls render: name, email, service select (five options), message
  textarea, the checkbox, and the submit button.
- Each control keeps its visible label.
- The `required` fields are still required (the browser blocks an empty submit).

### 7. Embeds (iframe, SVG)
- About: the YouTube player for `aqz-KE-bpKQ` renders, at 16:9, inside the
  content width.
- Index, contact: the inline SVG (wrench icon; map) renders with its shapes
  and its `<title>`.

### 8. Scripts
- The page's inline script ran: `body[data-inline-script="ran"]` is set.
- The shared script ran: `body[data-site-script="ran"]` is set.
- The behaviour still works: index shows "We are open right now." or "We are
  closed right now."; contact's submit shows the "Thanks" line without leaving
  the page; at 390 the Menu button opens the nav.

A tool that removes scripts on purpose (for safety) scores what lands, like any
other tool. The reason is reported beside the score, and TOOLS.md says which
tools do this by default.

### 9. Typography and colours (theme)
Checked on computed styles of the converted frontend against the original's:
- Headings use Arvo (the web font loaded, not a fallback).
- Header background is `#1f4e5f`.
- Button background is `#e9a64b`.
- Page background is `#fbf8f2` and body text `#1a2624`.
- Heading colour is `#1f4e5f`.

### 10. Editable in the block editor
Judged in the editor (block editor view and validation result), page content only:
- Every block is valid (`isValid` true), and there is no block recovery notice
  and no `Block validation failed` message.
- No single Classic (`core/freeform`) or Custom HTML (`core/html`) block holds
  the page: the share of the page's visible text that sits in such blocks is
  recorded, and must be under 50% for any score above 0.
- Content that has a core block is in that core block (heading, paragraph,
  list, table, image, gallery, quote, code, buttons, embed), not in a Classic or
  Custom HTML block. Content with no core equivalent (inline SVG, form,
  script) may sit in a Custom HTML block without losing this check.

Scores for this row: 0 if any block is invalid, any recovery notice shows, or
50% or more of the text is in Classic/Custom HTML blocks; 2 if all three checks
pass; 1 otherwise.

Template parts a tool generates (for example a shared header) are not part of
the page editor, so they are not scored here. Whether they open cleanly in the
Site Editor is reported.

## Totals and tables

All sums are plain sums of the 0/1/2 cells. No weights, no adjustments, no
bonus for features beyond the rubric.

- **Per tool total:** sum of its 36 cells, shown as `score / 72`.
- **Per criterion table:** one row per criterion, one column per tool, each cell
  the sum over the pages where it applies, shown as `score / max`.
- **Per page table:** one row per page, one column per tool, same rule.
- **Full grid:** every cell, published as `results/scores.csv`, so every total
  can be recomputed from it.

## Ties

Tools with the same total share the same rank, shown as "=2" (for example), and
are listed alphabetically by tool name inside the tie. There is no tie-breaker.

## What is reported but not scored

Reported in its own table, with the facts as measured, and never folded into
the scores: time to convert, install steps and friction (what had to be
installed, Node or PHP version needs, errors before a run worked), whether a
theme was generated, whether images went into the media library, Site Editor
behaviour of generated template parts, the tool's own warnings, licence, and
release cadence.

## Running rules

- One scored run per tool, on a fresh throwaway WordPress started from
  `harness/blueprint.json` with the pinned versions. Never a live site.
- No hand repair of any output between the tool and the screenshots.
- If a run fails because of the harness, the harness is fixed, the fix is
  committed, and the tool is run again from a fresh site; the failed attempt
  is kept in the log. If it fails because of the tool, that is the result: the
  error is recorded and the affected cells score 0.
- Scores are filled in only from saved evidence, after the runs, and each yes/no
  names the file it rests on, so anyone can check it.

## The write-up

Scores only; no winner beyond what the scores show. The write-up reports the
totals and tables above and the not-scored facts. It does not call any tool
best, recommend one, or rank beyond the totals, and it says plainly that the
tools take different inputs (TOOLS.md, "How inputs are given").
