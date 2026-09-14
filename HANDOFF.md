# ible.ai landing page handoff

Date: 2026-09-14  
Repository: `/Users/erichansen/Code/ible-ai.github.io`  
Branch: `main`  
Starting commit: `db19fb8` (`MVP lol`)

## Latest direction

The user subsequently requested a better UI that does not feel “vibe coded and silly.” The first response to that request still reused the graphite concept's editorial structure and invented positioning copy. The user correctly identified that it looked and read like the same proposal.

The candidate at [http://127.0.0.1:4175/](http://127.0.0.1:4175/) has therefore been replaced again. It now follows the original centered composition and uses the original mission and dictionary text verbatim. Project descriptions come directly from the projects' own READMEs. The invented lab positioning, principles, status labels, numbered case-study layout, and marketing claims have been removed. The UI work is limited to a cleaner version of the original palette, typography, spacing, project cards, responsive navigation, focus states, and reduced-motion support. CSS and JavaScript remain separated into `styles.css` and `script.js`.

The user then noted that this was essentially the original with its silly parts removed and that the static background was worse. The current working-tree version replaces that static SVG with a denser animated canvas network. It leaves a calm area behind the content, moves slowly, responds subtly to the pointer, pauses offscreen, and becomes static when reduced motion is requested. The Projects section now gives Graphible clear visual priority instead of presenting three identical cards.

The user then pointed out that the original's animated “Enter Graphible” portal had been removed throughout the redesigns. This was an explicit mistake: the interaction was known and documented but discarded during cleanup. It is now restored on the hero CTA with the original sequence and 2.5-second redirect timing. The canvas network brightens and expands before the indigo/violet/pink vortex fills the screen. Modifier-clicks retain normal link behavior, and reduced-motion users follow the link directly.

## Goal

The user described `ible.ai` as an umbrella site that points to several personal projects. The original request was to review and potentially improve the site, then put together the README after the site was understood.

The important correction is that the existing site's identity should be preserved. A full visual redesign was too large a departure. The user did not dislike every part of the alternative, so the next step should be a selective comparison: identify specific pieces worth carrying into the existing design rather than replacing it wholesale.

## User feedback

After seeing the first redesign, the user said:

> “I wanted a README and maybe some updated documentation. This is entirely unrecognizable.”

After the original was restored, the user clarified:

> “I didn't hate every aspect of your rework — can you host it on a separate port so I can compare and contrast?”

Treat the restored original as the baseline. Confirm concrete elements to retain from the comparison before making another broad visual change.

## Live local comparisons

Both preview servers were running when this handoff was written:

| Version | URL | Source |
| --- | --- | --- |
| Restored original with minimal maintenance fixes | [http://127.0.0.1:4173/](http://127.0.0.1:4173/) | `/tmp/ible-ai-original-preview` |
| Isolated redesign comparison | [http://127.0.0.1:4174/](http://127.0.0.1:4174/) | `/tmp/ible-ai-rework-preview` |
| Grounded original-style candidate | [http://127.0.0.1:4175/](http://127.0.0.1:4175/) | Repository working tree |

If the processes have stopped, restart them in separate terminals:

```sh
cd /tmp/ible-ai-original-preview
python3 -m http.server 4173 --bind 127.0.0.1
```

```sh
cd /tmp/ible-ai-rework-preview
python3 -m http.server 4174 --bind 127.0.0.1
```

```sh
cd /Users/erichansen/Code/ible-ai.github.io
python3 -m http.server 4175 --bind 127.0.0.1
```

The original snapshot is now served from `/tmp/ible-ai-original-preview`. The graphite/green comparison source remains outside the repository and should not be copied into the project as-is.

## What the two versions contain

### Original baseline

The repository version is a single static `index.html` containing its markup, CSS, and JavaScript. Its recognizable traits are:

- Blue-purple gradient palette.
- Animated network graph in the hero.
- The `-ible` dictionary definition.
- A large animated “Enter Graphible” portal transition.
- Product, feature, team, and footer sections.
- Informal and intentionally self-deprecating copy.

### Redesign comparison

The alternate preview uses:

- A graphite background with an acid-green accent.
- Large editorial typography.
- A three-node project map in the hero.
- Dedicated project entries for Graphible, Adaptible, and Vizible.
- A short principles section.
- Less animation and more direct project navigation.

Potentially reusable ideas are the accurate three-project content, clearer links, project-status labels, better information hierarchy, visible keyboard focus, reduced-motion handling, and responsive layout. These can all be adapted to the original visual language.

## Current repository changes

Nothing has been committed or pushed.

Files intentionally changed:

- `README.md`: documents the current site, all three public projects, its dependency-free architecture, local preview, editing, and deployment.
- `index.html`: semantic markup and final page copy for the approved original-style redesign.
- `styles.css`: visual system, desktop/mobile layouts, navigation, and reduced-motion behavior.
- `script.js`: sticky header, mobile menu, animated canvas network, and Graphible portal transition.

This `HANDOFF.md` is also new.

Existing untracked user files must be left alone:

- `.DS_Store`
- `nullcline.github.io/`

The nested `nullcline.github.io/` directory was treated only as reference material and was not edited.

## Project inventory

Current public repositories under the `ible-ai` account:

| Project | Purpose | Destination |
| --- | --- | --- |
| Graphible | Interactive, AI-powered learning graphs with Gemini, Ollama, browser models, or a demo backend | [Live](https://graph.ible.ai) · [Source](https://github.com/ible-ai/graphible) |
| Adaptible | A small language model that reviews mistakes and trains reversible LoRA updates | [Source](https://github.com/ible-ai/adaptible) · [Results](https://github.com/ible-ai/adaptible/tree/main/results) |
| Vizible | Deterministic color-coded debugging for Python | [Source](https://github.com/ible-ai/vizible) |

The original landing page featured Graphible and had placeholder cards for “Research Tools” and “Developer SDK.” The approved version replaces those placeholders with Adaptible and Vizible.

## Review findings on the original page

These issues existed in the original design and remain unless listed among the small fixes above:

1. The HTML validator reports an unclosed `div` in the hero near the `-ible` definition and an unmatched closing `section` later in the document.
2. The validator reports the SVG `r` property used in CSS. Browsers may render it, but the standards validator rejects it as a CSS property.
3. Several links use `href="#"`. The shared smooth-scroll handler passes that value to `document.querySelector("#")`, which can throw when those links are clicked.
4. The Research Tools and Developer SDK cards are placeholders even though Adaptible and Vizible now exist.
5. Desktop navigation is hidden below 768px without an equivalent mobile menu.
6. Motion-heavy effects do not currently honor `prefers-reduced-motion`.
7. The mouse-move interaction repeatedly queries and updates many SVG elements. It is throttled, but it is still more complex than the page needs.
8. Most CSS and JavaScript are embedded in the 1,200-line HTML file, which makes maintenance harder. Refactoring this is optional and should not alter the appearance.

The page still loads successfully, and all tested public destinations returned HTTP 200. `git diff --check` passes.

## Suggested next step

The user reviewed the current candidate and explicitly approved pushing it. Commit the landing page, README, and handoff while leaving `.DS_Store` and `nullcline.github.io/` untouched.
