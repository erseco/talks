# talks

> Presentaciones y materiales de charlas, talleres y sesiones formativas.

Public archive and browsable catalogue of Ernesto Serrano's talks. Each talk is
an **[eXeLearning](https://exelearning.net/) unit** (a self-contained, multi-page
HTML learning object), and the repository publishes a static catalogue that lists
and serves them.

- **Website:** https://erseco.github.io/talks/ *(after enabling GitHub Pages)*
- **Pre-release artifacts:** https://github.com/erseco/talks/releases/tag/pre-release

The website is in Spanish; the code, comments and this document are in English.

## How it works

Each talk lives in its own folder and is described by a `talk.yml` (the single
source of truth for metadata). Every talk declares an `engine`:

| engine | what it is | served as |
| --- | --- | --- |
| `exelearning` *(default)* | the committed, **unzipped `.elpx`** (`content.xml` + rendered `index.html`/`html`/`libs`/`theme`) | the unit, under `charlas/<id>/unit/` |
| `external` | slides hosted elsewhere (link only) | links from the card |

The eXeLearning units are **pre-rendered and committed** — the catalogue build
just validates metadata and copies each unit. So CI needs nothing but Node:

1. `scripts/validate-talks.js` validates every `talk.yml`.
2. `scripts/generate-site.js` builds the catalogue (cards, filters, search,
   per-talk pages, `index.json`) and copies each unit under `charlas/<id>/unit/`.

Regenerating a unit (Markdown spec → `.elp` → eXeLearning CLI → unzip) is a
**local** step — see [Authoring](#authoring-a-talk) and `scripts/exe/`.

## Repository structure

```text
talks/
├── .github/workflows/      # ci.yml, pages.yml, release.yml
├── assets/
│   ├── images/             # shared images
│   └── exe-themes/         # custom eXeLearning themes (jacquenetta…)
├── data/site.yml           # site-level config (title, author, links…)
├── scripts/
│   ├── validate-talks.js
│   ├── generate-site.js
│   ├── import-external-talks.js
│   └── exe/                # exelib.py (spec→.elp), build.sh, specs/*.json
├── site/static/            # catalogue style.css + app.js + theme.js + fonts
├── talks/<year>/<id>/      # one folder per talk:
│   ├── talk.yml            #   metadata (required)
│   ├── README.md
│   ├── notes.md            #   speaker notes (recovered / authored)
│   ├── index.html, html/, libs/, content/, theme/, content.xml …  ← the unit
│   └── external.md         #   provenance (for talks adapted from elsewhere)
├── output/                 # generated site (gitignored, .gitkeep only)
├── Makefile · package.json · LICENSE · LICENSE-CONTENT.md
```

## Local commands

Requires Node.js ≥ 20 and `make`.

```bash
make install   # install Node deps (js-yaml)
make           # default: validate + build the static site (output/site/)
make validate  # check every talk.yml
make site      # (re)generate output/site/
make serve     # serve the site locally (http://localhost:8080)
make clean     # remove generated artifacts
```

Regenerating the eXeLearning units (local only, needs the eXeLearning CLI):

```bash
# Requires python3 + `pip install markdown` and the eXeLearning CLI (Bun) repo.
EXE_DIR=/path/to/exelearning_5 make exe    # rebuilds every unit from its spec
```

## Authoring a talk

A talk's content is a small **JSON spec** in `scripts/exe/specs/<id>.json`:
pages → blocks → Markdown. `scripts/exe/exelib.py` turns it into an eXeLearning
`.elp` (Markdown iDevices), and `scripts/exe/build.sh` exports it with its theme
and unzips the unit into the talk folder.

1. Create `talks/<year>/<id>/talk.yml` with `engine: exelearning`.
2. Write `scripts/exe/specs/<id>.json` (set `"theme"` to `base` or `jacquenetta`).
3. Custom themes live in `assets/exe-themes/`; symlink them where the CLI looks
   (`$EXE_DIR/public/files/perm/themes/base/<theme>`).
4. `make exe` to render, then `make build` and commit the generated unit.

External / link-only talks use `engine: external` and the `external:` block.

## Themes

- **base** — eXeLearning's default theme (used for the recent talks).
- **jacquenetta** (`assets/exe-themes/jacquenetta/`) — a minimalist **black &
  white** theme inspired by the *Jacquenetta* SlidesCarnival template, built on
  top of `base`. Used for the older talks.

## Releases and pre-release

[`release.yml`](.github/workflows/release.yml) uses
[`ncipollo/release-action`](https://github.com/ncipollo/release-action). On push
to `main` (or manual dispatch) it refreshes a rolling **`pre-release`** with the
site bundle (`site.zip`) and `index.json`; on a published release it attaches the
same artifacts. Pull requests only build.

[`pages.yml`](.github/workflows/pages.yml) deploys `output/site` to GitHub Pages
on every push to `main` (minimal permissions). One-time setup: **Settings → Pages
→ Source: GitHub Actions**.

## Licensing

This repository is licensed under **CC BY-SA 4.0** — see [`LICENSE`](LICENSE) and
[`LICENSE-CONTENT.md`](LICENSE-CONTENT.md), covering both the code and the
original presentation content. Bundled eXeLearning runtime files and themes keep
their own licenses; older talks adapted from earlier material keep the license
recorded in their `talk.yml`.

## Author

**Ernesto Serrano** — <https://ernesto.es> · <https://github.com/erseco>
