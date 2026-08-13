# anydoc-app

Desktop GUI that converts Office/PDF/EPUB documents to Markdown, built on
[Tauri](https://tauri.app/) 2.x. The Rust backend links the
[`anydoc`](https://crates.io/crates/anydoc) crate directly - no CLI
subprocess - the same way
[`anydoc-cli`](https://github.com/ZdenekCDC/anydoc-cli) does.

This is an independent, unofficial wrapper. All document conversion is
performed by the `anydoc` crate (MIT licensed) - see
[THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md) for attribution. This
project is not affiliated with Firecrawl.

## Features

- Open a file via the native dialog (multi-select) or drag & drop, single or
  multiple files at once.
- Async conversion on the Rust backend, with a raw Markdown pane and a
  rendered HTML preview side by side.
- "Save as..." (native dialog) or copy the Markdown to the clipboard.
- Batch conversion: each file is saved as `<name>.md` next to its source. A
  failure on one file never aborts the batch; you get a per-file OK/failed
  summary with the reason for each failure.
- Fully offline - no network calls beyond what the Tauri runtime itself
  needs to start a window (verified with `cargo tree`: no `reqwest`/`hyper`
  in the dependency graph).
- UI available in English and Czech, auto-detected from the system locale
  with a manual switcher (see [Localization](#localization) below).

## Supported formats

`doc`, `docx`, `odt`, `pdf`, `ppt`, `pptx`, `rtf`, `epub`, `xls`, `xlsx`,
`ods`, `odp`, `csv` (same list as `anydoc-cli`).

## Install

Download the installer/binary for your platform from the
[Releases](../../releases) page:

- **Linux**: `.deb`, `.rpm`, or `.AppImage`
- **Windows**: `.msi` or `.exe` (NSIS)
- **macOS**: `.dmg`

The binaries are **not code-signed**; on first run you may need to allow
them explicitly (macOS Gatekeeper, Windows SmartScreen).

## Development

Requires Rust (stable) and Node.js/npm (only for `@tauri-apps/cli` - the
frontend itself has no build step, just static HTML/CSS/JS).

```sh
npm install
npm run tauri dev
```

## Build

```sh
npm run tauri build
```

## Tests

```sh
cd src-tauri
cargo test
```

Tests use small synthetic fixtures generated in-place (no external test
data) and don't require network access.

## Localization

The UI ships in English and Czech. The default language is derived from the
webview's system locale (`navigator.language`) - Czech if it starts with
`cs`, English otherwise. Users can switch language anytime from the
dropdown in the toolbar; the choice is persisted in `localStorage` and
survives restarts.

Backend errors (`src-tauri/src/lib.rs`, `AppError`) are structured data
(a `kind` plus parameters like `path`/`extension`/`detail`), not
pre-formatted text - the frontend renders the localized message from
`src/i18n/cs.js` / `src/i18n/en.js` via `src/i18n/errors.js`. Add a new
language by adding another file under `src/i18n/`.

## License

This wrapper is MIT licensed, see [LICENSE](LICENSE). It depends on the MIT
licensed [`anydoc`](https://github.com/firecrawl/anydoc) crate and on Tauri
(MIT/Apache-2.0); see [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).
