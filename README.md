# Idea Setup Experiment

A placeholder demo of a small tool I built to test product ideas before they go to engineering. It shows the same idea on **mobile and desktop screens** and puts **customer journeys side by side**, so you can compare the current journey with a new idea step by step.

Everything here is placeholder content. "Petal" and "Petal Studio" are made-up apps used only to show how the tool works.

**Live demo:** https://mohamedabusamra.github.io/idea-setup-experiment/

## What it does

- **Two phones, two journeys.** The current journey on the left, the new idea on the right. Step both together, or each phone on its own with its arrows.
- **Focus one journey.** Tap a phone's label to show it alone; Back returns to the comparison.
- **Desktop frame.** Desktop screens render inside a browser frame with a live URL bar.
- **Demo controls per epic.** Autoplay, seconds per step, and scenario switches (for example Success / Error) appear only where the epic needs them.
- **Shareable links.** Every screen has a hash route like `#/mobile/signup/idea-verify`.
- **No framework, no server.** Plain HTML, CSS, and JavaScript. Open `index.html` directly or host it on GitHub Pages.

## Placeholder content

| Surface | Epic | Screens |
| --- | --- | --- |
| Mobile | Sign up | Current: welcome, long form, documents, verify, waiting for review. Idea: welcome, quick account, verify, home, finish profile later. |
| Desktop | Dashboard setup | Welcome, pick a template, dashboard |

## Layout

Screens are grouped by **surface → epic → screen**. Each screen folder owns its HTML, plus CSS and JS when it needs them.

```
features/
  shell/                          demo chrome (sidebar, phones, browser frame)
  mobile/
    epics.js                      epic chips; an epic can set compareFlow
    shared/petal-app.css          placeholder phone app styles
    signup/                       new idea journey
      idea-welcome/idea-welcome.html
      ...
    signup-current/               current journey (compared against)
  website/
    epics.js
    dashboard-setup/
      shared/                     placeholder desktop styles and state
      studio-template/            html + css + js
      ...
js/                               app core: state, routing, mount, bind
css/tokens.css                    color tokens
scripts/build-bundle.cjs          builds the generated files below
css/app.css                       generated, do not edit
js/bundle.js                      generated, do not edit
js/generated/templates.js         generated, do not edit
```

## Run it

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server
# open http://localhost:8000
```

## Change or add a screen

1. Edit or add `features/<surface>/<epic>/<screen>/<screen>.html` (and `.css` / `.js` if needed).
2. List the screen in that epic's `screens.js`.
3. For a new epic, add it to `features/<surface>/epics.js` and `js/registry.js`.
4. To compare two journeys on mobile, give the epic `compareFlow: "<other-epic-id>"`.
5. Rebuild:

```bash
npm run build
```

Links between screens use `data-goto="<screen-id>"`. Content that depends on the scenario switch uses `only-success` / `only-error`.
