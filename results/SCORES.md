# Scores

Scored from the saved evidence under `results/<tool>/` by the rubric in `RUBRIC.md` (unchanged since `0e06bffc80`), read as set out in `SCORING-NOTES.md`. Every cell, with its evidence note, is in `results/SCORES.csv`, so every number here can be recomputed from it.

Totals are plain sums of 0/1/2 cells. **N/E** (no evidence) cells are left out of the score and the maximum, and counted in their own column; they are not 0 and not points. `n/a` cells do not apply to the page. No weights. The tools take different inputs (TOOLS.md, "How inputs are given"): the four page-content tools got each page's body HTML, with links made absolute to the static copy; Static Site Importer got the whole site as a ZIP, including its stylesheet and font.

**†** Static Site Importer ran by its publisher's Playground route (an importer block from its demo plugin, ZIP uploaded in the browser) under PHP 8.5, not from `harness/blueprint.json` under PHP 8.3 like the other four (TOOLS.md section b; SCORING-NOTES.md note 9). Its output is scored by the same checks.

## Totals

| Tool | Score | Maximum (72 less 2 per N/E cell) | N/E cells |
|---|---|---|---|
| rawhandler | 25 | 72 | 0 |
| Static Site Importer † | 41 | 60 | 6 |
| Blocks Engine | 35 | 66 | 3 |
| Block Runner | 27 | 66 | 3 |
| HTML to Blocks Converter | 31 | 72 | 0 |

No two totals are equal, so there is no tie. Totals are scores only; with different N/E counts the maxima differ, and the maxima are shown beside them.

## Per criterion (sum over the pages where the criterion applies)

| Criterion | rawhandler | Static Site Importer † | Blocks Engine | Block Runner | HTML to Blocks Converter |
|---|---|---|---|---|---|
| 1 Structure and headings | 4 / 8 | 7 / 8 | 4 / 8 | 4 / 8 | 3 / 8 |
| 2 Lists and tables | 4 / 8 | 8 / 8 | 8 / 8 | 4 / 8 | 8 / 8 |
| 3 Layout | 3 / 8 | 3 / 8 | 4 / 8 | 4 / 8 | 3 / 8 |
| 4 Images and captions | 4 / 8 | 6 / 8 | 7 / 8 | 4 / 8 | 5 / 8 |
| 5 Links and nav | 4 / 8 | 8 / 8 | 4 / 8 | 4 / 8 | 4 / 8 |
| 6 Forms | 1 / 2 | 1 / 2 | 0 / 2 | 1 / 2 | 0 / 2 |
| 7 Embeds | 2 / 6 | 0 / 6 | 1 / 6 | 2 / 6 | 3 / 6 |
| 8 Scripts | 3 / 8 | 0 / 2 (N/E 3) | 0 / 2 (N/E 3) | 0 / 2 (N/E 3) | 3 / 8 |
| 9 Typography and colours | 0 / 8 | 8 / 8 | 0 / 8 | 0 / 8 | 0 / 8 |
| 10 Editable in block editor | 0 / 8 | 0 / 2 (N/E 3) | 7 / 8 | 4 / 8 | 2 / 8 |

## Per page

| Page | rawhandler | Static Site Importer † | Blocks Engine | Block Runner | HTML to Blocks Converter |
|---|---|---|---|---|---|
| index | 6 / 18 | 7 / 18 | 7 / 18 | 7 / 18 | 9 / 18 |
| about | 5 / 18 | 11 / 14 (N/E 2) | 10 / 16 (N/E 1) | 6 / 16 (N/E 1) | 5 / 18 |
| services | 6 / 16 | 11 / 12 (N/E 2) | 9 / 14 (N/E 1) | 6 / 14 (N/E 1) | 7 / 16 |
| contact | 8 / 20 | 12 / 16 (N/E 2) | 9 / 18 (N/E 1) | 8 / 18 (N/E 1) | 10 / 20 |
| **total** | 25 / 72 | 41 / 60 (N/E 6) | 35 / 66 (N/E 3) | 27 / 66 (N/E 3) | 31 / 72 |

## Full grid (score per cell)

### rawhandler

| Criterion | index | about | services | contact |
|---|---|---|---|---|
| 1 Structure and headings | 1 | 1 | 1 | 1 |
| 2 Lists and tables | 1 | 1 | 1 | 1 |
| 3 Layout | 1 | 0 | 1 | 1 |
| 4 Images and captions | 1 | 1 | 1 | 1 |
| 5 Links and nav | 1 | 1 | 1 | 1 |
| 6 Forms | n/a | n/a | n/a | 1 |
| 7 Embeds | 1 | 0 | n/a | 1 |
| 8 Scripts | 0 | 1 | 1 | 1 |
| 9 Typography and colours | 0 | 0 | 0 | 0 |
| 10 Editable in block editor | 0 | 0 | 0 | 0 |

### Static Site Importer †

| Criterion | index | about | services | contact |
|---|---|---|---|---|
| 1 Structure and headings | 1 | 2 | 2 | 2 |
| 2 Lists and tables | 2 | 2 | 2 | 2 |
| 3 Layout | 0 | 1 | 1 | 1 |
| 4 Images and captions | 0 | 2 | 2 | 2 |
| 5 Links and nav | 2 | 2 | 2 | 2 |
| 6 Forms | n/a | n/a | n/a | 1 |
| 7 Embeds | 0 | 0 | n/a | 0 |
| 8 Scripts | 0 | N/E | N/E | N/E |
| 9 Typography and colours | 2 | 2 | 2 | 2 |
| 10 Editable in block editor | 0 | N/E | N/E | N/E |

### Blocks Engine

| Criterion | index | about | services | contact |
|---|---|---|---|---|
| 1 Structure and headings | 1 | 1 | 1 | 1 |
| 2 Lists and tables | 2 | 2 | 2 | 2 |
| 3 Layout | 1 | 1 | 1 | 1 |
| 4 Images and captions | 1 | 2 | 2 | 2 |
| 5 Links and nav | 1 | 1 | 1 | 1 |
| 6 Forms | n/a | n/a | n/a | 0 |
| 7 Embeds | 0 | 1 | n/a | 0 |
| 8 Scripts | 0 | N/E | N/E | N/E |
| 9 Typography and colours | 0 | 0 | 0 | 0 |
| 10 Editable in block editor | 1 | 2 | 2 | 2 |

### Block Runner

| Criterion | index | about | services | contact |
|---|---|---|---|---|
| 1 Structure and headings | 1 | 1 | 1 | 1 |
| 2 Lists and tables | 1 | 1 | 1 | 1 |
| 3 Layout | 1 | 1 | 1 | 1 |
| 4 Images and captions | 1 | 1 | 1 | 1 |
| 5 Links and nav | 1 | 1 | 1 | 1 |
| 6 Forms | n/a | n/a | n/a | 1 |
| 7 Embeds | 1 | 0 | n/a | 1 |
| 8 Scripts | 0 | N/E | N/E | N/E |
| 9 Typography and colours | 0 | 0 | 0 | 0 |
| 10 Editable in block editor | 1 | 1 | 1 | 1 |

### HTML to Blocks Converter

| Criterion | index | about | services | contact |
|---|---|---|---|---|
| 1 Structure and headings | 1 | 1 | 0 | 1 |
| 2 Lists and tables | 2 | 2 | 2 | 2 |
| 3 Layout | 1 | 0 | 1 | 1 |
| 4 Images and captions | 1 | 0 | 2 | 2 |
| 5 Links and nav | 1 | 1 | 1 | 1 |
| 6 Forms | n/a | n/a | n/a | 0 |
| 7 Embeds | 2 | 0 | n/a | 1 |
| 8 Scripts | 0 | 1 | 1 | 1 |
| 9 Typography and colours | 0 | 0 | 0 | 0 |
| 10 Editable in block editor | 1 | 0 | 0 | 1 |

## Readings that decided cells

Cells where a reading in SCORING-NOTES.md, not a plain check, set the score, so a reader can see what moves if a reading is changed:

- **Note 1 (theme page title as a second `h1`):** caps criterion 1 at 1 on all sixteen pages of the four page-content tools.
- **Note 2 (links to the static copy):** caps criterion 5 at 1 on all sixteen pages of the four page-content tools. This follows from the input rule, not from any tool rewriting links wrongly.
- **Note 4 / note 6 (N/E):** Static Site Importer criterion 10 on about, services, contact (page blocks have no recorded `isValid`); criterion 8 on about, services, contact for Static Site Importer, Blocks Engine and Block Runner (the score turns on the unclicked Menu and submit).
- **Note 8 (six options):** Static Site Importer contact, criterion 6: 1, not 2.
- **Note 10 (script-written sentence):** criterion 1 on index fails the paragraph check for all five tools; for Static Site Importer it is the only failing check there (1, not 2).
- **Note 13 (content only in Custom HTML caps at 1):** rawhandler on every cell it would otherwise score 2 (criteria 2, 4, 6, 7); Block Runner criteria 2 and 4 on all pages (nav list and logo in core/html), criterion 6 on contact and criterion 7 on index and contact; HTML to Blocks Converter criterion 7 on contact.
- **Note 16 (invalid item is broken, 0):** Static Site Importer index criteria 3 and 4 (the hero `core/cover`); HTML to Blocks Converter about criteria 3 and 4 (gallery images) and services criterion 1 (headings).
- **Note 17 (missing-block warning is not a recovery notice):** Blocks Engine criterion 10 on index (1, not 0) and contact (2, not 0).
- **Note 18 (Menu `<button>` has a core block):** HTML to Blocks Converter criterion 10 on index and contact (1, not 2).

## Re-score check

See the "Re-score check" section added after the blind second pass.
