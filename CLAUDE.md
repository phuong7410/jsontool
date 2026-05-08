# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run compile       # type-check + lint + build (dev)
npm run package       # type-check + lint + build (production, minified)
npm run watch         # parallel watch for esbuild + tsc (for active development)
npm run lint          # ESLint on src/
npm run check-types   # TypeScript type-check only, no emit
npm run test:unit     # run unit tests (pure logic, no VS Code needed, fast)
npm run test          # run extension tests via @vscode/test-cli (downloads VS Code)
```

To package the extension as a `.vsix` for installation:
```bash
npx vsce package
```

## Architecture

This is a VS Code extension with a single source file: [src/extension.ts](src/extension.ts).

All three commands (`jsontool.format`, `jsontool.minify`, `jsontool.toJsonl`) share a two-layer design:

- **`processText(text, mode)`** — pure transformation logic. Parses the input first as standard JSON, then falls back to JSONL (newline-delimited JSON) if that fails. Returns formatted, minified, or JSONL-converted output.
- **`runCommand(mode)`** — VS Code plumbing. Gets the active editor, determines the text range (selection or full document), calls `processText`, applies the edit, and surfaces errors via `window.showErrorMessage`.

`getIndent()` reads the editor's `tabSize` setting and returns the appropriate indent string for pretty-printing.

**Build pipeline:** esbuild bundles `src/extension.ts` → `dist/extension.js` (CommonJS, `vscode` externalized). TypeScript is checked separately via `tsc --noEmit`. The `.vscodeignore` strips everything except `dist/extension.js` from the packaged `.vsix`.

**Testing:** Tests live in `src/test/` and compile to `out/`. Two test modes:

- **Unit tests** (`npm run test:unit`) — run mocha directly on compiled output. Tests `processText` pure logic only, no VS Code dependency, fast.
- **Extension tests** (`npm run test`) — launches a real VS Code instance via `@vscode/test-cli` / `@vscode/test-electron`. Use this for testing VS Code command behavior (editor integration, selections, etc.).
