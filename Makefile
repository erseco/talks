###############################################################################
# talks — presentations & materials of talks, workshops and training sessions
#
# Root Makefile: validate metadata, render Marp decks and build the static site.
###############################################################################

ROOT_DIR  := $(abspath .)
OUTPUT_DIR ?= $(ROOT_DIR)/output
MARP_BIN  ?= $(ROOT_DIR)/node_modules/.bin/marp

export ROOT_DIR OUTPUT_DIR MARP_BIN

.PHONY: all build validate test slides site serve clean help install import-external
.DEFAULT_GOAL := build

all: build

## build: validate, render every Marp deck and generate the static site
build: validate slides site
	@echo "Build complete -> $(OUTPUT_DIR)/site/index.html"

## validate: check every talk.yml against the schema
validate:
	@node scripts/validate-talks.js

## test: run the repository checks (metadata validation)
test: validate

## slides: render Marp decks to HTML (+ PDF, best-effort) in output/talks/
slides: check-marp
	@node scripts/build-talks.js

## site: generate the static site in output/site/
site:
	@node scripts/generate-site.js

## serve: live preview of the Marp decks (http://localhost:8080)
serve: check-marp
	@$(MARP_BIN) --server --watch --allow-local-files --theme-set assets/themes talks

## import-external: cache external PDF exports locally (best-effort)
import-external:
	@node scripts/import-external-talks.js

## install: install Node dependencies (Marp CLI + js-yaml)
install:
	@npm install

## clean: remove generated artifacts (keeps output/.gitkeep)
clean:
	@rm -rf "$(OUTPUT_DIR)/site" "$(OUTPUT_DIR)/talks" "$(OUTPUT_DIR)/external" \
		"$(OUTPUT_DIR)/index.json" "$(OUTPUT_DIR)/site.zip"
	@echo "Cleaned generated output."

check-marp:
	@test -x "$(MARP_BIN)" || command -v marp >/dev/null 2>&1 || { \
		echo "Error: marp not found. Run 'make install' (installs @marp-team/marp-cli)."; \
		exit 1; \
	}

## help: list available targets
help:
	@echo "talks — available targets:"
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/^## /  /'
