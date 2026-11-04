# Agent guide

This repo is a **static HTML prototype** for testing ideas on mobile and desktop screens. No framework, no server.

Read `README.md` for the layout. Read the nearest `AGENTS.md` before editing a folder.

## Source of truth

| Kind | Edit | Do not edit |
| --- | --- | --- |
| Screen markup | `features/<surface>/<epic>/<screen>/<screen>.html` | JS template strings |
| Screen styles | colocated `.css` or the epic's `shared/` | `css/app.css` |
| Screen behavior | colocated `.js` | `js/bundle.js` |
| Demo chrome | `features/shell/` | — |
| Tokens | `css/tokens.css` | — |

After HTML/CSS/JS changes run `npm run build`. It regenerates `css/app.css`, `js/generated/templates.js`, and `js/bundle.js`.

## Conventions

- Screen ids are file names and must be unique across the whole repo.
- The bundle joins every JS file into one scope: top-level names must be unique too.
- New JS files must be added to `jsFiles` in `scripts/build-bundle.cjs`.
- Keep `data-goto`, `data-screen`, `data-step-journey`, and `data-feature-canvas` stable — navigation depends on them.
- No pixel layouts in JavaScript. HTML + CSS only.
- Placeholder content only: no real company names, logos, or data.
