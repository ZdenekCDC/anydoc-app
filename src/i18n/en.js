export default {
  toolbar: {
    open: "Open file...",
    save: "Save as...",
    copy: "Copy to clipboard",
    dropHint: "or drag & drop file(s) into the window",
  },
  emptyState: {
    supported: "Supported formats: {list}",
  },
  pane: {
    markdown: "Markdown",
    preview: "Preview",
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
    conversionFailed: "Failed to convert {path}: {detail}",
    writeFailed: "Failed to save {path}: {detail}",
    internal: "Internal error: {detail}",
    clipboard: "Failed to copy to clipboard: {error}",
  },
};
