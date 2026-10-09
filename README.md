# ible.ai

The public landing page for [ible.ai](https://ible.ai). It is the umbrella site for projects published under the [ible-ai GitHub organization](https://github.com/ible-ai).

The site introduces three public projects:

| Project | What it does | Links |
| --- | --- | --- |
| graphible | Type a topic and an LLM streams it onto a canvas as a graph of linked concepts | [Live app](https://graph.ible.ai) · [Source](https://github.com/ible-ai/graphible) |
| adaptible | A small language model that keeps its conversations and retrains itself on its own corrections | [Source](https://github.com/ible-ai/adaptible) · [Results](https://github.com/ible-ai/adaptible/tree/main/results) |
| vizible | Minimal, deterministic color-coded debugging for Python | [Source](https://github.com/ible-ai/vizible) |

## Project structure

This is a dependency-free static site served by GitHub Pages.

```text
.
├── index.html          # Semantic page structure and content
├── styles.css          # Layout, visual system, and responsive behavior
├── script.js           # Navigation, project titles, copy buttons, and the graphible transition
├── assets/
│   ├── favicon.svg     # Browser icon (the -i mark)
│   └── og.png          # Link-preview card
├── CNAME               # Custom-domain configuration
└── README.md
```

There is no package manager, build command, framework, or analytics script. The only external request is the Fraunces typeface from Google Fonts.

## Run locally

Start a static file server from the repository root:

```sh
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

Using a server is preferable to opening `index.html` directly because it matches the root-relative asset paths used by GitHub Pages.

## Make changes

- Edit page structure and copy in `index.html`.
- Edit colors, type, spacing, and responsive behavior in `styles.css`. The palette is the brand's paper set: paper `#f8fafc`, ink `#0f172a`, and indigo `#6366f1`. The page stays on paper in every system theme.
- Edit the navigation, the project-title motion, the copy buttons, or the graphible portal in `script.js`. Each title steps from its name to its address (adaptible, adapt-ible, adapt.ible, adapt.ible.ai); the root comes from the title's `data-root` in `index.html`. graphible's title carries `data-portal`, which plays the transition before following the link.
- Add a project as another `<article class="project" data-project>` inside `#projects .project-grid`, with its site as the title link and its repository as the GitHub icon link.

Keep the page dependency-free unless a new feature clearly requires a build system. Respect the existing `prefers-reduced-motion` rules when adding motion.

## Deployment

GitHub Pages serves the repository from `main`. The root `CNAME` maps the site to `ible.ai`; do not remove it.

Before pushing:

1. Preview the page at desktop and mobile widths.
2. Test the mobile menu, keyboard focus states, the project titles, the copy buttons, and the graphible portal transition.
3. Check the project links and in-page navigation.
4. Confirm `assets/favicon.svg`, `styles.css`, and `script.js` load without errors.
5. Run `git diff --check`.

A push to `main` publishes through the repository's existing Pages configuration.

## License

No license is currently declared for this repository.
