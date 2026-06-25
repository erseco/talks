###############################################################################
# talks — presentations & materials of talks, workshops and training sessions
#
# Root Makefile: validate metadata, render decks (Slidev/Marp) and build the site.
###############################################################################

ROOT_DIR  := $(abspath .)
OUTPUT_DIR ?= $(ROOT_DIR)/output
SLIDEV_BIN ?= $(ROOT_DIR)/node_modules/.bin/slidev
MARP_BIN  ?= $(ROOT_DIR)/node_modules/.bin/marp
# Deck to preview with `make serve` (override: make serve TALK=path/to/slides.md)
TALK ?= talks/2026/2026-07-03-3ipunt-dev-tools-ci-ai/slides.md

export ROOT_DIR OUTPUT_DIR SLIDEV_BIN MARP_BIN

.PHONY: all build validate test slides site serve clean help install import-external check-engines
.DEFAULT_GOAL := build

all: build

## build: validate, render every deck (Slidev/Marp) and generate the static site
build: validate slides site
	@echo "Build complete -> $(OUTPUT_DIR)/site/index.html"

## validate: check every talk.yml against the schema
validate:
	@node scripts/validate-talks.js

## test: run the repository checks (metadata validation)
test: validate

## slides: render decks to HTML (+ PDF, best-effort) in output/talks/
slides: check-engines
	@node scripts/build-talks.js

## site: generate the static site in output/site/
site:
	@node scripts/generate-site.js

## serve: live preview a deck with Slidev (override: make serve TALK=path/slides.md)
serve: check-engines
	@$(SLIDEV_BIN) "$(TALK)"

## import-external: cache external PDF exports locally (best-effort)
import-external:
	@node scripts/import-external-talks.js

## install: install Node dependencies (Slidev, Marp CLI, Playwright, js-yaml)
install:
	@npm install

## clean: remove generated artifacts (keeps output/.gitkeep)
clean:
	@rm -rf "$(OUTPUT_DIR)/site" "$(OUTPUT_DIR)/talks" "$(OUTPUT_DIR)/external" \
		"$(OUTPUT_DIR)/index.json" "$(OUTPUT_DIR)/site.zip"
	@echo "Cleaned generated output."

check-engines:
	@test -x "$(SLIDEV_BIN)" || command -v slidev >/dev/null 2>&1 || { \
		echo "Error: slidev not found. Run 'make install'."; \
		exit 1; \
	}

## help: list available targets
help:
	@echo "talks — available targets:"
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/^## /  /'
