# Scoring notes: how the rubric is read where it does not foresee the runs

These notes were written **after the runs and before any score**. They exist
because the rubric, fixed before the first run, could not foresee every case
the runs turned up (`results/OBSERVATIONS.md`, "Rubric edge cases found").
`RUBRIC.md` itself is unchanged since `0e06bffc80`; nothing here edits it, and
the harness still refuses to run if it differs from that commit.

How each case is decided:

- From the rubric text alone, quoted below. Where the text can be read more
  than one way, the literal reading is taken.
- The same way for all five tools. No rule here was chosen by looking at which
  tool it helps or hurts.
- Where the rubric text truly does not decide a cell, the rule is: **score the
  cell on the evidence the rubric names; if that evidence does not exist, mark
  the cell N/E (no evidence)**. An N/E cell is excluded from that tool's
  maximum and shown in its own column. It is never a 0 and never a point.

The scorer did not run the tools. Every score comes from the saved evidence
under `results/<tool>/`.

## The nine edge cases in OBSERVATIONS.md

### 1. Theme page title as a second `h1`

Rubric, criterion 1: "The page has one `h1`, with the original's text." The
evidence the rubric names for frontend checks is "Computed facts from the
converted frontend: heading outline ...". The converted frontend is the page a
visitor gets, and the rubric says nothing about excluding a theme's title.

**Reading:** the `h1` count is taken on the converted frontend page as
captured. Two `h1`s fail this check, whatever printed the second one. The
other heading check ("Every original heading is present, with the same level
and in the same order") is a presence-and-order check: the original outline
must appear in the converted outline in the same order. It says nothing about
extra headings, so extra headings do not fail it.

### 2. Internal links and the input rule

Rubric, criterion 5: "Internal links (nav, footer, cards, buttons) open the
converted WordPress page for that link, not the static copy and not a 404."

**Reading:** literal. A link that opens `/sample-site/*.html` opens the static
copy and fails this check, whatever made it point there. The rubric does not
adjust for the input rule (TOOLS.md says the same: "it does not adjust for the
difference"). This is reported beside the scores as a consequence of the input
rule, not hidden.

The anchor check ("Anchor links (`services.html#tune-ups`, `#wheels`,
`#cargo`) land on the right section") is a separate check and does not name
which copy. It is judged on whether each card link keeps its fragment and the
document it opens has an element with that `id` (for the static copy, the
served `sample-site/services.html`; for a WordPress page, that page's stored
markup and heading facts).

Criterion 2's "Links inside list items still work" is judged on whether each
link opens a page that loads (not a 404). It does not say "the converted
WordPress page", so a link to the served static copy works for that check.

### 3. Table caption as `<figcaption>`

Rubric, criterion 2: "the table keeps all rows and columns, its header row, its
row headers and its caption." Where the rubric means a specific element it
names it in code (`h1`, `ol`, `ul`, `cite`, `<img>`); here it does not.

**Reading:** the caption is kept if its text stays attached to the table (a
`<caption>`, or the `<figcaption>` of the table's own `core/table` figure). The
facts record `caption: null` with the text in `figcaptions`; the stored markup
shows whether that figcaption belongs to the table.

### 4. Editor evidence for a template-wrapped page

Rubric, criterion 10: "Every block is valid (`isValid` true), and there is no
block recovery notice and no `Block validation failed` message." The evidence
the rubric names for `isValid` is "the harness reads
`wp.data.select('core/block-editor').getBlocks()` and records each block's name
and `isValid`". For Static Site Importer that list holds only
`core/template-part` x2 and `core/post-content`, so the page's own blocks have
no recorded `isValid`. Recovery notices and console messages are recorded for
the whole editor, and the page's text-in-HTML share can be read from
`editor.post_content`.

**Reading:** the row's rule is "0 if any block is invalid, any recovery notice
shows, or 50% or more of the text is in Classic/Custom HTML blocks; 2 if all
three checks pass; 1 otherwise". Where a recorded recovery notice, console
message or text share already decides 0, the cell is 0. Where they do not,
the score depends on the page blocks' `isValid`, which the rubric names and
the evidence does not hold, so the cell is **N/E**. The same rule would apply
to any tool whose page blocks were missing from `editor.blocks`.

### 5. `button_background` fact

Rubric, criterion 9: "Button background is `#e9a64b`", checked "on computed
styles of the converted frontend against the original's". The evidence the
rubric names is "computed fonts and colours", not one field.

**Reading:** the check is read from the computed `background` in `links[]` of
the links that were button-styled in the original (`a.button`: "Book a repair"
on index, "Book a service" on services, "See services and prices" on contact),
for every tool, not from `theme.button_background` (which reads the first
match of a selector and, for Static Site Importer, lands on the brand link).
The contact page's submit `<button>` has no recorded background, so it is not
read; the check on contact rests on the button-styled link.

### 6. Behaviour checks the harness does not exercise

Rubric, criterion 8: "The behaviour still works: index shows "We are open right
now." or "We are closed right now."; contact's submit shows the "Thanks" line
without leaving the page; at 390 the Menu button opens the nav."

**Reading:** the parts with evidence are judged (index's line is in the
recorded visible text, or it is not). The parts with no evidence (no click was
recorded: the Menu at 390, the contact submit) are not guessed, including from
whether a script that wires them ran. Then:

- If the cell's score is the same whatever the unevidenced part would show, the
  cell is scored. Example: a page where the shared-script check fails and the
  inline-script check passes is 1 either way.
- If the score would depend on the unevidenced part, the cell is **N/E**.
  Example: about, where the only behaviour is the Menu at 390, and both
  marker checks fail: 0 if the Menu does not open the nav, 1 if it does.
- On index the behaviour check fails on its evidenced part alone if the line is
  absent, because the check needs every listed behaviour on that page.

Criterion 6's "The `required` fields are still required (the browser blocks an
empty submit)" is judged from the recorded `required` attribute on the name
and email controls and the absence of `novalidate` on the form in the stored
markup. Blocking an empty submit is what the browser does with that attribute;
unlike the Menu, it does not depend on a script.

### 7. Media library question for Static Site Importer

Rubric, criterion 4: "Reported, not scored: whether images were copied into the
media library or still load from the original location."

**Reading:** not scored. The image check is "Every original `<img>` loads
(natural width above 0) and keeps its `alt` text", judged the same way wherever
the image loads from. An original `alt=""` kept as `alt=""` is kept.

### 8. Form replaced by a provider form

Rubric, criterion 6: "All six controls render: name, email, service select
(five options), message textarea, the checkbox, and the submit button."

**Reading:** literal. A service select with a number of options other than
five does not meet "service select (five options)", so this check fails. Extra
hidden fields are not controls that render and do not affect the check. The
labels check and the `required` check are judged on their own.

### 9. Different route and PHP for Static Site Importer

Rubric, running rules: "One scored run per tool, on a fresh throwaway WordPress
started from `harness/blueprint.json` with the pinned versions." Static Site
Importer ran by its publisher's Playground route under PHP 8.5, not from
`harness/blueprint.json` under PHP 8.3. The rubric scores output ("Scores are
filled in only from saved evidence"), and does not say what to do when a
running rule could not be met.

**Reading:** its output is scored by the same checks as every other tool, and
every table marks it with **†** and a footnote naming the route and the PHP
version. It is not excluded and not adjusted.

## Further cases the scorer found in the rubric text

These came up while reading the rubric against the evidence formats, before
any score. They are decided the same way.

### 10. A sentence written by the page's own script

Rubric, criterion 1: "All of the original's paragraph text is present (visible
text compared after collapsing whitespace; every original sentence must
appear)." On index, the original's visible text includes the sentence its
inline script adds to the opening-hours paragraph ("We are open right now." or
"We are closed right now.").

**Reading:** literal. The comparison is against the original's recorded
visible text, so that sentence is one of the original's sentences. If it is
absent from the converted page, this check fails. (The same absence is also
judged under criterion 8; the rubric does not forbid one fact failing two
checks.)

### 11. A check whose subject the original page does not have

The rubric marks some checks "Where the original has them", and says a whole
criterion applies only "if the original page has the feature". About has no
button-styled link, so criterion 5's "Button-styled links still look like
buttons" and criterion 9's "Button background is `#e9a64b`" have nothing to
compare on that page ("against the original's").

**Reading:** a check whose subject is absent from the original page is not one
of that cell's checks. The cell is scored on its remaining checks.

### 12. Which header, nav and footer

The four page-content tools' pages carry the WordPress theme's own header, nav
and footer around the converted content.

**Reading:** checks that name the sample site's parts ("The four nav links",
"brand and nav", "Footer: its columns") are judged on the sample site's
header, nav and footer, wherever they landed. Count checks on "the page"
(case 1) count the whole page. Extra theme links or headings do not fail a
presence check.

### 13. Content kept only inside a Classic or Custom HTML block

Rubric, score scale: "1, partly kept or needs manual repair: some checks pass
but not all, or they all pass only at one of the two widths, or the content is
there but only inside a Classic or Custom HTML block, so a person would have to
rebuild it." and "2, kept faithfully: every check for that criterion passes at
both widths."

When every check passes but the content sits in a Custom HTML block, both
definitions are met as written. The only reading under which the Custom HTML
clause has any effect is as a cap: such a cell scores 1, not 2. That reading
is taken, for every criterion except 10, which has its own rule. Criterion
10's allowance ("Content with no core equivalent (inline SVG, form, script) may
sit in a Custom HTML block without losing this check") is scoped by its own
words to "this check", so it does not lift the cap elsewhere.

The rubric does not say whether the clause looks at the whole criterion or at
each item it checks. The scorer applies it per item, because the checks are
per item ("Every original list", "Every original `<img>`"): if any item a
criterion checks is present only inside a `core/html` or `core/freeform`
block, that cell scores at most 1. Where an item sits is read from the stored
markup (`editor.post_content`).

### 14. Checks that do not depend on width

Checks judged on stored markup or in the editor are judged once. "Passes at
both widths" applies to the frontend checks.

### 15. Heading colours

Rubric, criterion 9: "Heading colour is `#1f4e5f`", "checked ... against the
original's". The original itself shows some headings in `#fbf8f2` (the index
hero and the footer).

**Reading:** each heading's computed colour is compared with the original's
colour for the same heading. "Headings use Arvo" passes when the computed
heading font is Arvo and at least one Arvo face is `loaded`.

## Outputs

`results/SCORES.csv` is the full grid the rubric asks for (the rubric names it
`results/scores.csv`; the file name follows the scoring task). Every row gives
tool, page, criterion, score (0, 1, 2, `n/a` or `N/E`) and a one-line evidence
note naming the file it rests on. `results/SCORES.md` holds the per-criterion,
per-page and per-tool tables as plain sums, with N/E counts in their own
column and ties shown as ties.
