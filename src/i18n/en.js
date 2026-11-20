export default {
  toolbar: {
    open: "Open file...",
    reset: "Back to start",
    save: "Save as...",
    copy: "Copy to clipboard",
    dropHint: "or drag & drop file(s) into the window",
  },
  emptyState: {
    headline: "Drag files here...",
    supported: "Supported formats: {list}",
  },
  pane: {
    markdown: "Markdown",
    preview: "Preview",
  },
  previewTheme: {
    editorial: "Editorial (serif)",
    github: "GitHub",
    docs: "Docs",
    notion: "Notion",
    current: "Plain",
  },
  dropOverlay: "Drop to convert",
  batch: {
    tableFile: "File",
    tableResult: "Result",
    progress: "{done}/{total} processed",
    statusWaiting: "waiting...",
    statusConverting: "converting...",
    statusOk: "OK -> {file}",
    statusError: "error: {error}",
    summary: "Done: {succeeded} succeeded, {failed} failed (of {total}).",
  },
  errors: {
    notFound: "File {path} does not exist.",
    unsupportedExtensionKnown:
      "Unsupported extension '{extension}' for file {path}. Supported formats are: {supported}.",
    unsupportedExtensionUnknown:
      "File {path} has no extension. Supported formats are: {supported}.",
    needsOcrAll:
      "File {path} is scanned (all {pageCount} pages have no text layer) and needs OCR, which this app does not support.",
    needsOcrPages:
      "File {path} has scanned pages ({pages} of {pageCount}) that need OCR. This app does not support OCR, so the file was not converted rather than produce incomplete output.",
    conversionFailed: "Failed to convert {path}: {detail}",
    writeFailed: "Failed to save {path}: {detail}",
    internal: "Internal error: {detail}",
    clipboard: "Failed to copy to clipboard: {error}",
  },
};
