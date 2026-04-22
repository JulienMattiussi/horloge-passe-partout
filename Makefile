.PHONY: help install dev build build-snippet build-preview build-og preview test test-watch typecheck format format-check check clean

default: help

help: ## Display available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk -F ':.*?## ' '{printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Installation & build

install: ## Install all dependencies
	npm install

dev: ## Start Vite dev server + esbuild watch on the snippet
	npm run dev

build: ## Build snippet + React demo into dist/
	npm run build

build-snippet: ## Build the embeddable snippet only
	npm run build:snippet

build-preview: ## Regenerate public/preview.svg from the digit images (needs ImageMagick)
	bash scripts/build-preview.sh

build-og: ## Rasterize public/og.svg to public/og.png
	node scripts/build-og.mjs

preview: ## Preview the production build locally
	npm run preview

clean: ## Remove build artifacts and node_modules
	rm -rf dist node_modules public/passe-partout.js public/passe-partout.js.map

# Code quality

typecheck: ## Type-check with tsc (no emit)
	npm run typecheck

format: ## Format code with prettier
	npm run format

format-check: ## Check formatting (CI)
	npm run format:check

# Tests

test: ## Run all tests
	npm test

test-watch: ## Run tests in watch mode
	npm run test:watch

check: typecheck format-check test ## Run all checks (typecheck + format + tests)
