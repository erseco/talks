#!/usr/bin/env bash
#
# Regenerate the committed eXeLearning units from scripts/exe/specs/*.json.
#
# This is a LOCAL step (not run in CI): it needs python3 + the `markdown`
# package and the eXeLearning CLI (Bun) checked out at $EXE_DIR. It builds a
# .elp from each spec, exports it to .elpx with its theme, and unzips the result
# into the matching talk folder. The unzipped unit is what gets committed and
# served by the site; CI only copies it.
#
# Usage:  EXE_DIR=/path/to/exelearning_5 scripts/exe/build.sh [id ...]
# Themes: the spec's "theme" must exist under
#         $EXE_DIR/public/files/perm/themes/base/<theme> (symlink custom ones
#         from assets/exe-themes/, e.g. jacquenetta).
set -euo pipefail

REPO="$(cd "$(dirname "$0")/../.." && pwd)"
EXE_DIR="${EXE_DIR:-/Users/ernesto/Downloads/git/exelearning_5}"
SPECS="$REPO/scripts/exe/specs"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# Files that make up an eXeLearning unit (everything else in the folder —
# talk.yml, README.md, notes.md, external.md — is metadata we keep).
UNIT_PATHS=(index.html content.xml content.dtd search_index.js html libs idevices content theme)

select_specs() {
  if [ "$#" -gt 0 ]; then
    for id in "$@"; do echo "$SPECS/$id.json"; done
  else
    ls "$SPECS"/*.json
  fi
}

for spec in $(select_specs "$@"); do
  id="$(basename "$spec" .json)"
  year="${id:0:4}"
  dir="$REPO/talks/$year/$id"
  [ -d "$dir" ] || { echo "SKIP $id (no talk folder $dir)"; continue; }
  theme="$(python3 -c "import json;print(json.load(open('$spec')).get('theme','base'))")"
  echo "== $id (theme: $theme) =="

  python3 "$REPO/scripts/exe/exelib.py" "$spec" "$TMP/$id.elp"
  make -C "$EXE_DIR" export-elpx FORMAT=elpx INPUT="$TMP/$id.elp" OUTPUT="$TMP/$id.elpx" THEME="$theme" >/dev/null

  ( cd "$dir" && rm -rf "${UNIT_PATHS[@]}" slides.md )
  unzip -q -o "$TMP/$id.elpx" -d "$dir"
  echo "  -> talks/$year/$id ($(find "$dir" -type f | wc -l | tr -d ' ') files)"
done

echo "Done. Run 'make build' to regenerate the site."
