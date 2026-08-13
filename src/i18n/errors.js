import { t } from "./index.js";

/**
 * Formats a structured `AppError` (as serialized by the Rust backend, see
 * `src-tauri/src/lib.rs`) into a localized, human-readable message.
 */
export function formatAppError(error) {
  if (!error || typeof error !== "object" || !error.kind) {
    return String(error);
  }

  switch (error.kind) {
    case "not_found":
      return t("errors.notFound", { path: error.path });
    case "unsupported_extension":
      return error.extension
        ? t("errors.unsupportedExtensionKnown", {
            extension: error.extension,
            path: error.path,
            supported: error.supported.join(", "),
          })
        : t("errors.unsupportedExtensionUnknown", {
            path: error.path,
            supported: error.supported.join(", "),
          });
    case "conversion_failed":
      return t("errors.conversionFailed", { path: error.path, detail: error.detail });
    case "write_failed":
      return t("errors.writeFailed", { path: error.path, detail: error.detail });
    case "internal":
      return t("errors.internal", { detail: error.detail });
    default:
      return JSON.stringify(error);
  }
}
