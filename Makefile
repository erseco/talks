###############################################################################
# talks — presentations & materials of talks, workshops and training sessions
#
# Talks are eXeLearning units: each talk folder holds the committed, unzipped
# .elpx (content.xml + rendered index.html/html/libs/theme). The site just
# validates metadata and copies the units. Regenerating the units from the
# specs (scripts/exe/build.sh) is a LOCAL step needing the eXeLearning CLI —
# see scripts/exe/README.md.
###############################################################################

ROOT_DIR  := $(abspath .)
OUTPUT_DIR ?= $(ROOT_DIR)/output
PORT ?= 8080
EXE_DIR ?= $(HOME)/Downloads/git/exelearning_5

export ROOT_DIR OUTPUT_DIR EXE_DIR

.PHONY: all build validate test site serve clean help install import-external exe
.DEFAULT_GOAL := build

all: build

## build: validate metadata and generate the static site
build: validate site
	@echo "Build complete -> $(OUTPUT_DIR)/site/index.html"

## validate: check every talk.yml against the schema
validate:
	@node scripts/validate-talks.js

## test: run the repository checks (metadata validation)
test: validate

## site: generate the static site in output/site/
site:
	@node scripts/generate-site.js

## exe: (local) regenerate the eXeLearning units from scripts/exe/specs/*.json
exe:
	@EXE_DIR="$(EXE_DIR)" bash scripts/exe/build.sh

## serve: serve the generated site locally (http://localhost:$(PORT))
serve:
	@cd "$(OUTPUT_DIR)/site" && python3 -m http.server $(PORT)

## import-external: cache external PDF exports locally (best-effort)
import-external:
	@node scripts/import-external-talks.js

## install: install Node dependencies (js-yaml)
install:
	@npm install

## clean: remove generated artifacts (keeps output/.gitkeep)
clean:
	@rm -rf "$(OUTPUT_DIR)/site" "$(OUTPUT_DIR)/external" \
		"$(OUTPUT_DIR)/index.json" "$(OUTPUT_DIR)/site.zip"
	@echo "Cleaned generated output."

## help: list available targets
help:
	@echo "talks — available targets:"
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/^## /  /'
