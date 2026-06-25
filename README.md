# talks

> Presentaciones y materiales de charlas, talleres y sesiones formativas.

Public archive and browsable catalogue of Ernesto Serrano's talks. It keeps the
metadata, sources and slides of every talk in one place, renders the modern
ones with [Slidev](https://sli.dev/), and publishes a static website.

- **Website:** https://erseco.github.io/talks/ *(after enabling GitHub Pages)*
- **Pre-release artifacts:** https://github.com/erseco/talks/releases/tag/pre-release

The website is in Spanish; the code, comments and this document are in English.

## How it works

Each talk lives in its own folder and is described by a `talk.yml` file, which
is the **single source of truth**. Every talk declares an `engine`:

| engine | what it is | output |
| --- | --- | --- |
| `slidev` *(default)* | a [Slidev](https://sli.dev/) deck (`slides.md`) | SPA + PDF |
| `marp` | a [Marp](https://marp.app/) deck (`slides.md`), kept for compatibility | HTML + PDF |
| `external` | slides hosted elsewhere (Google Slides, PDF, video) | links only |

A small Node toolchain (no app framework of its own) discovers those files and:

1. validates the metadata (`scripts/validate-talks.js`),
2. renders each deck per its engine (`scripts/build-talks.js`),
3. generates the static site with filters, search and a per-talk page
   (`scripts/generate-site.js`) plus a normalised `index.json`.

Everything is generated into `output/`, which is **not** versioned.

## Repository structure

```text
talks/
├── .github/workflows/      # ci.yml, pages.yml, release.yml
├── assets/
│   ├── images/             # shared images
│   └── themes/             # Marp themes (used only by engine: marp)
├── data/
│   └── site.yml            # site-level config (title, author, links…)
├── scripts/                # validate / build-talks / generate-site / import-external
├── site/static/            # style.css + app.js for the generated site
├── talks/                  # one folder per talk, grouped by year
│   └── <year>/<id>/
│       ├── talk.yml        # metadata (required, includes `engine`)
│       ├── README.md
│       ├── slides.md       # Slidev (or Marp) source
│       ├── notes.md        # speaker notes
│       ├── external.md     # source/links (external talks)
│       └── assets/
├── output/                 # generated artifacts (gitignored, .gitkeep only)
├── Makefile
├── package.json
├── README.md
├── LICENSE                 # CC BY-SA 4.0
└── LICENSE-CONTENT.md
```

The Slidev theme is installed from npm (`@slidev/theme-seriph`); the Slidev decks
are served from the site under `charlas/<id>/slides/`.

## Local commands

Requires Node.js ≥ 20 and `make`. Install dependencies once (Slidev, Marp CLI,
Playwright and js-yaml — Playwright downloads a Chromium for PDF export):

```bash
make install        # or: npm install
```

Then:

```bash
make                # default: validate + slides + site (full build)
make validate       # check every talk.yml against the schema
make slides         # render every deck to output/talks/<id>/ (HTML + PDF)
make site           # build the static site in output/site/
make serve          # live preview a deck (TALK=path/slides.md to choose; default: the 3ipunt deck)
make import-external # cache external PDF exports locally (best-effort)
make clean          # remove generated artifacts
```

PDF rendering needs a Chrome/Chromium browser (via Playwright for Slidev). It is
best-effort: if no browser is available the build still produces the HTML site
(set `BUILD_PDF=0` to skip PDF explicitly).

## Adding a talk

### A new Slidev talk (default)

1. Create `talks/<year>/<YYYY-MM-DD-event-slug>/` (the folder name is the `id`).
2. Add `talk.yml` with `status: draft`, `engine: slidev` and
   `formats.source: "slides.md"`.
3. Write `slides.md` with Slidev front matter:
   ```yaml
   ---
   theme: seriph
   layout: cover
   title: "My talk"
   author: "Ernesto Serrano"
   ---
   # My talk
   ```
   Use Slidev layouts (`cover`, `section`, `two-cols`, `center`…), put images in
   the talk's `assets/`, and write presenter notes as the last HTML comment of a
   slide. Optionally add a `notes.md`.
4. `make build` and open `output/site/index.html`, or `make serve TALK=…` to
   preview live.

### A Marp talk (optional)

Set `engine: marp` in `talk.yml`. The deck uses the Marp theme in
`assets/themes/talks.css` and renders to a single HTML file + PDF.

### An external / legacy talk

For talks whose slides live elsewhere (Google Slides, PDF, video):

1. Create the folder and a `talk.yml` with `engine: external` and
   `status: external` (or `external-link-unverified` if the link does not resolve).
2. Fill the `external:` block (`source_url`, `pdf_url`, `pptx_url`, `video_url`…).
   Tip: Google Slides export supports `format=pptx` / `format=odp`, which keep the
   speaker notes (PDF does not) — handy to recover the original `notes.md`.
3. Add an `external.md` documenting the source and its verification state.

Run `make validate` to confirm the metadata is well-formed.

## Releases and pre-release

GitHub Actions ([`release.yml`](.github/workflows/release.yml)) uses
[`ncipollo/release-action`](https://github.com/ncipollo/release-action) — chosen
because it updates an existing release in place (`allowUpdates`, `tag`,
`prerelease`, `removeArtifacts: false`), which is exactly what a rolling
pre-release needs.

- **Push to `main`** (or manual dispatch): the rolling **`pre-release`** tag is
  refreshed with the latest deck PDFs, the full site bundle (`site.zip`) and
  `index.json`. The full HTML decks live inside `site.zip` (and on Pages).
- **A published GitHub release**: the same artifacts are attached to it.
- **Pull requests**: only build, never touch any release.

[`pages.yml`](.github/workflows/pages.yml) deploys `output/site` to GitHub Pages
on every push to `main` with minimal permissions (`contents: read`,
`pages: write`, `id-token: write`).

### Enabling GitHub Pages (one-time)

Repository **Settings → Pages → Build and deployment → Source: GitHub Actions**.
The next push to `main` publishes the site.

## Licensing

This repository is licensed under **Creative Commons Attribution-ShareAlike 4.0
International (CC BY-SA 4.0)** — see [`LICENSE`](LICENSE) and
[`LICENSE-CONTENT.md`](LICENSE-CONTENT.md). It applies to both the code
(scripts, workflows, Makefile) and the original presentation content.

Externally hosted / legacy talks keep their **own** license: where it is unknown
each talk's `talk.yml` records `license.content: "unknown"`. Third-party assets
retain the license of their respective owners.

## Author

**Ernesto Serrano** — <https://ernesto.es> · <https://github.com/erseco>
