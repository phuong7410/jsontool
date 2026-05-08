# JSON Tool

A VS Code extension for formatting, minifying, and converting JSON and JSONL files.

## Features

Three commands available via the Command Palette (`Ctrl+Shift+P`) or the right-click context menu in JSON files:

- **JSON: Format (Pretty)** — pretty-prints JSON or JSONL using your editor's indent setting
- **JSON: Minify** — collapses JSON to a single compact line; compacts each object in JSONL to one line, keeping them newline-separated
- **JSON: Convert to JSONL** — converts a JSON array or multi-line JSON object to newline-delimited JSON (JSONL)

All commands operate on the current selection, or the entire document if nothing is selected.

### JSON and JSONL support

The extension handles both standard JSON and JSONL (newline-delimited JSON) as input — including formatted multi-line JSONL blocks where each object spans multiple lines separated by blank lines. For example, **Format** pretty-prints each object separated by a blank line; **Minify** compacts each object to a single line.

### Convert to JSONL

| Input | Output |
|-------|--------|
| JSON array `[{"a":1},{"b":2}]` | `{"a": 1}`<br>`{"b": 2}` |
| JSON object (single or multi-line) | Single-line `{"a": 1, "b": 2}` |
| Compact JSONL `{"a":1}\n{"b":2}` | Normalized `{"a": 1}\n{"b": 2}` |
| Formatted or messy JSONL blocks | Normalized single-line-per-object JSONL |

## Requirements

No additional requirements. Works out of the box with VS Code.

## Extension Settings

This extension has no configurable settings. It automatically picks up your editor's **Tab Size** setting for indentation when formatting.

## Release Notes

### 0.0.4

- Compact JSONL is now normalized to standard JSONL by Convert to JSONL (instead of erroring)
- Minify and Format now handle formatted multi-line JSONL blocks (objects separated by blank lines)
- Rewrote README with accurate feature descriptions and a Convert to JSONL reference table

### 0.0.3

- Fixed JSONL output spacing: values now include a space after `,` as well as `:`

### 0.0.2

- Extracted pure transformation logic into `processText` for testability
- Added unit test suite (runs without VS Code via `npm run test:unit`)

### 0.0.1

Initial release — format, minify, and convert to JSONL.
