use std::fs;
use std::path::Path;

use serde::Serialize;

/// Extensions anydoc can convert (matches anydoc-cli's help text).
const SUPPORTED_EXTENSIONS: &[&str] = &[
    "doc", "docx", "odt", "pdf", "ppt", "pptx", "rtf", "epub", "xls", "xlsx", "ods", "odp", "csv",
];

/// Structured, locale-independent conversion errors. The frontend maps
/// `kind` + fields to a translated message (see `src/i18n`) rather than
/// receiving pre-formatted text, so the UI can run in any supported locale.
#[derive(Debug, Serialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
enum AppError {
    NotFound {
        path: String,
    },
    UnsupportedExtension {
        path: String,
        extension: Option<String>,
        supported: Vec<&'static str>,
    },
    ConversionFailed {
        path: String,
        detail: String,
    },
    WriteFailed {
        path: String,
        detail: String,
    },
    Internal {
        detail: String,
    },
}

#[tauri::command]
fn supported_extensions() -> Vec<&'static str> {
    SUPPORTED_EXTENSIONS.to_vec()
}

fn extension_of(path: &str) -> Option<String> {
    Path::new(path)
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_ascii_lowercase())
}

/// Validates that `path` exists and has a supported extension - callers
/// must not call `anydoc::to_markdown` without this check passing first
/// (spec requires rejecting before conversion).
fn validate_input(path: &str) -> Result<(), AppError> {
    if !Path::new(path).exists() {
        return Err(AppError::NotFound { path: path.to_string() });
    }
    let extension = extension_of(path);
    match &extension {
        Some(ext) if SUPPORTED_EXTENSIONS.contains(&ext.as_str()) => Ok(()),
        _ => Err(AppError::UnsupportedExtension {
            path: path.to_string(),
            extension,
            supported: SUPPORTED_EXTENSIONS.to_vec(),
        }),
    }
}

fn markdown_to_html(markdown: &str) -> String {
    let parser = pulldown_cmark::Parser::new(markdown);
    let mut html = String::new();
    pulldown_cmark::html::push_html(&mut html, parser);
    html
}

#[derive(Serialize)]
struct ConvertedDocument {
    path: String,
    markdown: String,
    html: String,
}

/// Converts a single document to Markdown + rendered HTML. Validates the
/// path and extension first so unsupported input never reaches `anydoc`.
#[tauri::command]
async fn convert_document(path: String) -> Result<ConvertedDocument, AppError> {
    validate_input(&path)?;
    tauri::async_runtime::spawn_blocking(move || {
        let markdown = anydoc::to_markdown(&path).map_err(|err| AppError::ConversionFailed {
            path: path.clone(),
            detail: err.to_string(),
        })?;
        let html = markdown_to_html(&markdown);
        Ok(ConvertedDocument { path, markdown, html })
    })
    .await
    .map_err(|err| AppError::Internal { detail: err.to_string() })?
}

#[derive(Serialize)]
struct BatchItemResult {
    path: String,
    output_path: Option<String>,
    error: Option<AppError>,
}

#[derive(Serialize)]
struct BatchSummary {
    total: usize,
    succeeded: usize,
    failed: usize,
    results: Vec<BatchItemResult>,
}

/// Converts each input file to `<same-dir>/<same-stem>.md`. Failures on one
/// file never stop the batch - each item's outcome is recorded and the
/// summary is returned once every file has been attempted.
#[tauri::command]
async fn convert_batch(app: tauri::AppHandle, paths: Vec<String>) -> Result<BatchSummary, AppError> {
    use tauri::Emitter;

    let total = paths.len();
    let mut results = Vec::with_capacity(total);

    for (index, path) in paths.into_iter().enumerate() {
        let _ = app.emit(
            "batch-progress",
            serde_json::json!({ "index": index, "total": total, "path": path }),
        );

        let outcome = convert_and_write_one(&path);
        let item = match outcome {
            Ok(output_path) => BatchItemResult { path, output_path: Some(output_path), error: None },
            Err(err) => BatchItemResult { path, output_path: None, error: Some(err) },
        };
        results.push(item);
    }

    let succeeded = results.iter().filter(|r| r.error.is_none()).count();
    let failed = results.len() - succeeded;

    Ok(BatchSummary { total, succeeded, failed, results })
}

fn convert_and_write_one(path: &str) -> Result<String, AppError> {
    validate_input(path)?;

    let src = Path::new(path);
    let markdown = anydoc::to_markdown(src).map_err(|err| AppError::ConversionFailed {
        path: path.to_string(),
        detail: err.to_string(),
    })?;

    let out_path = src.with_extension("md");
    fs::write(&out_path, markdown).map_err(|err| AppError::WriteFailed {
        path: out_path.display().to_string(),
        detail: err.to_string(),
    })?;

    Ok(out_path.display().to_string())
}

/// Writes already-converted Markdown to an arbitrary destination (used by
/// the "Save as..." dialog for single-file conversions).
#[tauri::command]
async fn save_markdown(path: String, content: String) -> Result<(), AppError> {
    tauri::async_runtime::spawn_blocking(move || {
        fs::write(&path, content).map_err(|err| AppError::WriteFailed {
            path: path.clone(),
            detail: err.to_string(),
        })
    })
    .await
    .map_err(|err| AppError::Internal { detail: err.to_string() })?
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![
            supported_extensions,
            convert_document,
            convert_batch,
            save_markdown,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rejects_unsupported_extension() {
        let tmp = std::env::temp_dir().join(format!("anydoc-app-ext-test-{}.txt", std::process::id()));
        std::fs::write(&tmp, "not a document").unwrap();
        let err = validate_input(tmp.to_str().unwrap()).unwrap_err();
        std::fs::remove_file(&tmp).unwrap();
        match err {
            AppError::UnsupportedExtension { extension, supported, .. } => {
                assert_eq!(extension, Some("txt".to_string()));
                assert!(!supported.is_empty());
            }
            other => panic!("expected UnsupportedExtension, got {other:?}"),
        }
    }

    #[test]
    fn rejects_missing_file() {
        let err = validate_input("/no/such/file.pdf").unwrap_err();
        assert!(matches!(err, AppError::NotFound { .. }));
    }

    /// Synthetic, non-confidential fixtures generated in-place so tests
    /// don't depend on files outside this repository (earlier versions
    /// pointed at anydoc-cli's demo/ directory, which holds real internal
    /// documents that must never ship as test data in a public repo).
    fn write_fixture(tmp: &Path, name: &str, content: &str) -> std::path::PathBuf {
        let path = tmp.join(name);
        std::fs::write(&path, content).unwrap();
        path
    }

    #[test]
    fn converts_csv_and_renders_html() {
        let tmp = std::env::temp_dir().join(format!("anydoc-app-csv-test-{}", std::process::id()));
        std::fs::create_dir_all(&tmp).unwrap();
        let path = write_fixture(&tmp, "sample.csv", "name,value\nfoo,1\nbar,2\n");

        validate_input(path.to_str().unwrap()).expect("csv should validate");
        let markdown = anydoc::to_markdown(&path).expect("csv should convert");
        assert!(!markdown.trim().is_empty());
        let html = markdown_to_html(&markdown);
        assert!(html.contains("<"));

        std::fs::remove_dir_all(&tmp).unwrap();
    }

    #[test]
    fn converts_rtf() {
        let tmp = std::env::temp_dir().join(format!("anydoc-app-rtf-test-{}", std::process::id()));
        std::fs::create_dir_all(&tmp).unwrap();
        let path = write_fixture(&tmp, "sample.rtf", r"{\rtf1\ansi Hello world}");

        validate_input(path.to_str().unwrap()).expect("rtf should validate");
        let markdown = anydoc::to_markdown(&path).expect("rtf should convert");
        assert!(markdown.contains("Hello world"));

        std::fs::remove_dir_all(&tmp).unwrap();
    }

    #[test]
    fn batch_writes_md_next_to_source_and_reports_failure() {
        let tmp = std::env::temp_dir().join(format!("anydoc-app-batch-test-{}", std::process::id()));
        std::fs::create_dir_all(&tmp).unwrap();
        let src = write_fixture(&tmp, "sample.csv", "name,value\nfoo,1\n");
        let bad = write_fixture(&tmp, "sample.txt", "not a document");

        let ok_result = convert_and_write_one(src.to_str().unwrap());
        assert!(ok_result.is_ok());
        let out_path = src.with_extension("md");
        assert!(out_path.exists());

        let err_result = convert_and_write_one(bad.to_str().unwrap());
        assert!(err_result.is_err());

        std::fs::remove_dir_all(&tmp).unwrap();
    }
}
