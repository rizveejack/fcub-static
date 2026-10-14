# FCUB — Static Website Export

A fully static, framework-free version of the First Capital University of
Bangladesh website. **Tailwind CSS 4 + vanilla JavaScript only** — no React,
no Next.js, no UI libraries. Built as a design reference for porting the
site to any other framework.

## Run it

Any static file server works. From this folder:

```bash
# Python
python3 -m http.server 8000

# Bun
bunx serve .

# Node
npx serve .
```

Then open http://localhost:8000 — or simply double-click `index.html`
(fonts load from Google Fonts; everything else is local).

## Page map (19 pages)

| Static file      | Content (Next.js route)              |
| ---------------- | ------------------------------------ |
| `index.html`     | Home (`/`) — all 13 sections         |
| `about.html`     | About the University                 |
| `leadership.html`| Leadership & Governance              |
| `campus-life.html`| Campus Life                         |
| `academics.html` | Faculties & Departments overview     |
| `academics-cse.html` … `academics-agriculture.html` | 8 department pages |
| `admissions.html`| Admissions                           |
| `notices.html`   | Notices & Circulars (filterable)     |
| `events.html`    | University Events                    |
| `contact.html`   | Contact (demo form)                  |
| `result.html`    | Certificate Verification (roll lookup) |
| `404.html`       | "Lost on Campus" error page          |

## Structure

```
fcub-static/
├── *.html            ← 19 finished pages (open these)
├── css/styles.css    ← compiled Tailwind (80 KB, the design system)
├── js/main.js        ← all interactions, vanilla DOM APIs
├── js/data.js        ← site data (notices, results…) as window.FCUB_DATA
├── images/           ← all photos incl. people/
├── favicon.svg, logo.svg
├── src/tailwind.css  ← design-token source (@theme palette, keyframes…)
├── partials/         ← head / header / footer partials (build inputs)
└── pages/*.fragment.html  ← per-page content fragments (build inputs)
```

## Editing & rebuilding

The finished HTML at the root is generated. Two ways to change things:

**Quick edit** — edit any root `*.html` file directly; it is plain HTML.

**Structured edit** — edit the fragment in `pages/`, then rebuild from the
repo root:

```bash
bun scripts/build-static.mjs                      # re-assemble pages + data.js
cd download/fcub-static
bunx @tailwindcss/cli -i src/tailwind.css -o css/styles.css --minify   # re-compile CSS
```

## Porting notes (for your framework)

- **Design tokens** live in `src/tailwind.css` under `@theme`:
  `forest #0e3327`, `forest-deep #08211a`, `brass #b5923f`, `brass-light
  #d8c284`, `paper #faf7f0`, `ink`, `clay` + Fraunces (display) / Inter
  (sans) fonts. Copy the `@theme` block into any Tailwind 4 project, or
  transcribe the variables.
- **Custom CSS classes** (also in `src/tailwind.css`): `.eyebrow`,
  `.display-italic`, `.brass-rule`, `.frame-arch`, `.grain`, `.link-lux`,
  `.reveal` (scroll animation), `.page-enter`, ticker keyframes, and the
  header state machine (`body.is-solid`).
- **Header**: transparent over dark heroes; JS adds `body.is-solid` after
  40 px scroll. Nav dropdowns are pure CSS (`:hover` / `:focus-within`).
- **Interactions in `js/main.js`** (port 1:1 to your framework):
  1. header scroll state  2. mobile drawer  3. accordions
     (`.acc-trigger[aria-expanded]` + `.acc-panel`)
  4. scroll reveal (`.reveal` + IntersectionObserver)
  5. notice department filter (`data-filter-group`, `data-dept-row`,
     `data-max`, `[data-count]/[data-total]`)
  6. certificate verification (reads `window.FCUB_DATA.results`)
  7. contact demo form (`#contact-form` → `#contact-success`)
- **Data**: `js/data.js` mirrors the app's `src/lib/data.ts`. The result
  register holds the seeded demo rolls (e.g. `FCUB-1913-CSE-041`).
