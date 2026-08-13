# Third-party licenses

## anydoc

`anydoc-app` links the [`anydoc`](https://crates.io/crates/anydoc) Rust
crate directly, developed at <https://github.com/firecrawl/anydoc>. All
document parsing and Markdown rendering is done by that crate; this
repository only adds the desktop GUI (Tauri) around it, the same way
[`anydoc-cli`](https://github.com/ZdenekCDC/anydoc-cli) does for the
command line.

`anydoc` is distributed under the MIT License:

```
MIT License

Copyright (c) 2026 Sideguide Technologies Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## pulldown-cmark

Markdown -> HTML rendering for the preview pane uses
[`pulldown-cmark`](https://crates.io/crates/pulldown-cmark), MIT licensed.

## Tauri

The desktop shell is built on [Tauri](https://tauri.app/) (`tauri`,
`tauri-plugin-dialog`, `tauri-plugin-clipboard-manager`,
`tauri-plugin-opener`), dual-licensed MIT / Apache-2.0.

## Other dependencies

Run `cargo license` (or `cargo deny check licenses`) in `src-tauri/` to
audit the full transitive dependency tree before cutting a release.
