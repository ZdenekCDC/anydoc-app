import { t, getLocale, setLocale } from "./i18n/index.js";
import { formatAppError } from "./i18n/errors.js";

const { invoke } = window.__TAURI__.core;
const { listen } = window.__TAURI__.event;
const { open: openDialog, save: saveDialog } = window.__TAURI__.dialog;
const { writeText } = window.__TAURI__.clipboardManager;

const els = {};
let currentSingle = null; // { path, markdown, html }
let supportedExtensions = [];

function q(id) {
  return document.getElementById(id);
}

function showError(message) {
  els.errorBanner.textContent = message;
  els.errorBanner.hidden = false;
}

function clearError() {
  els.errorBanner.hidden = true;
  els.errorBanner.textContent = "";
}

function showView(view) {
  els.emptyState.hidden = view !== "empty";
  els.singleResult.hidden = view !== "single";
  els.batchResult.hidden = view !== "batch";
}

function fileNameOf(path) {
  return path.split(/[/\\]/).pop();
}

function applyTranslations() {
  document.documentElement.lang = getLocale();
  els.openBtn.textContent = t("toolbar.open");
  els.saveBtn.textContent = t("toolbar.save");
  els.copyBtn.textContent = t("toolbar.copy");
  els.dropHint.textContent = t("toolbar.dropHint");
  els.emptyStateText.textContent = t("emptyState.supported", { list: supportedExtensions.join(", ") });
  els.paneMarkdownTitle.textContent = t("pane.markdown");
  els.panePreviewTitle.textContent = t("pane.preview");
  els.dropOverlay.textContent = t("dropOverlay");
  els.batchTableFileHeader.textContent = t("batch.tableFile");
  els.batchTableResultHeader.textContent = t("batch.tableResult");
  els.localeSelect.value = getLocale();
}

async function handlePaths(paths) {
  if (paths.length === 0) return;
  clearError();
  if (paths.length === 1) {
    await convertSingle(paths[0]);
  } else {
    await convertBatch(paths);
  }
}

async function convertSingle(path) {
  currentSingle = null;
  els.saveBtn.disabled = true;
  els.copyBtn.disabled = true;
  showView("single");
  els.markdownView.value = "";
  els.htmlView.innerHTML = "";

  try {
    const result = await invoke("convert_document", { path });
    currentSingle = result;
    els.markdownView.value = result.markdown;
    els.htmlView.innerHTML = result.html;
    els.saveBtn.disabled = false;
    els.copyBtn.disabled = false;
  } catch (err) {
    showView("empty");
    showError(formatAppError(err));
  }
}

async function convertBatch(paths) {
  showView("batch");
  els.batchTableBody.innerHTML = "";
  els.batchSummary.textContent = "";
  els.batchProgressBar.max = paths.length;
  els.batchProgressBar.value = 0;
  els.batchProgressLabel.textContent = t("batch.progress", { done: 0, total: paths.length });

  const rowByPath = new Map();
  for (const path of paths) {
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    nameCell.textContent = path;
    const statusCell = document.createElement("td");
    statusCell.textContent = t("batch.statusWaiting");
    row.append(nameCell, statusCell);
    els.batchTableBody.appendChild(row);
    rowByPath.set(path, statusCell);
  }

  const unlisten = await listen("batch-progress", (event) => {
    const { index, total, path } = event.payload;
    els.batchProgressBar.value = index;
    els.batchProgressLabel.textContent = t("batch.progress", { done: index, total });
    const cell = rowByPath.get(path);
    if (cell) cell.textContent = t("batch.statusConverting");
  });

  try {
    const summary = await invoke("convert_batch", { paths });
    els.batchProgressBar.value = summary.total;
    els.batchProgressLabel.textContent = t("batch.progress", { done: summary.total, total: summary.total });

    for (const item of summary.results) {
      const cell = rowByPath.get(item.path);
      if (!cell) continue;
      if (item.error) {
        cell.textContent = t("batch.statusError", { error: formatAppError(item.error) });
        cell.classList.add("status-error");
      } else {
        cell.textContent = t("batch.statusOk", { file: fileNameOf(item.output_path) });
        cell.classList.add("status-ok");
      }
    }

    els.batchSummary.textContent = t("batch.summary", {
      succeeded: summary.succeeded,
      failed: summary.failed,
      total: summary.total,
    });
  } catch (err) {
    showError(formatAppError(err));
  } finally {
    unlisten();
  }
}

async function onOpenClick() {
  clearError();
  const selection = await openDialog({
    multiple: true,
    filters: [{ name: "Documents", extensions: supportedExtensions }],
  });
  if (!selection) return;
  const paths = Array.isArray(selection) ? selection : [selection];
  await handlePaths(paths);
}

async function onSaveClick() {
  if (!currentSingle) return;
  const suggested = fileNameOf(currentSingle.path).replace(/\.[^.]+$/, ".md");
  const destination = await saveDialog({
    defaultPath: suggested,
    filters: [{ name: "Markdown", extensions: ["md"] }],
  });
  if (!destination) return;

  clearError();
  try {
    await invoke("save_markdown", { path: destination, content: els.markdownView.value });
  } catch (err) {
    showError(formatAppError(err));
  }
}

async function onCopyClick() {
  if (!currentSingle) return;
  try {
    await writeText(els.markdownView.value);
  } catch (err) {
    showError(t("errors.clipboard", { error: err }));
  }
}

async function onLocaleChange() {
  setLocale(els.localeSelect.value);
  applyTranslations();
}

function setupDragAndDrop() {
  listen("tauri://drag-enter", () => {
    els.dropOverlay.hidden = false;
  });
  listen("tauri://drag-leave", () => {
    els.dropOverlay.hidden = true;
  });
  listen("tauri://drag-drop", async (event) => {
    els.dropOverlay.hidden = true;
    const paths = event.payload?.paths ?? [];
    await handlePaths(paths);
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  els.errorBanner = q("error-banner");
  els.emptyState = q("empty-state");
  els.emptyStateText = q("empty-state-text");
  els.singleResult = q("single-result");
  els.batchResult = q("batch-result");
  els.markdownView = q("markdown-view");
  els.htmlView = q("html-view");
  els.openBtn = q("open-btn");
  els.saveBtn = q("save-btn");
  els.copyBtn = q("copy-btn");
  els.dropHint = q("drop-hint");
  els.dropOverlay = q("drop-overlay");
  els.batchTableBody = q("batch-table-body");
  els.batchTableFileHeader = q("batch-table-file-header");
  els.batchTableResultHeader = q("batch-table-result-header");
  els.batchProgressBar = q("batch-progress-bar");
  els.batchProgressLabel = q("batch-progress-label");
  els.batchSummary = q("batch-summary");
  els.paneMarkdownTitle = q("pane-markdown-title");
  els.panePreviewTitle = q("pane-preview-title");
  els.localeSelect = q("locale-select");

  els.openBtn.addEventListener("click", onOpenClick);
  els.saveBtn.addEventListener("click", onSaveClick);
  els.copyBtn.addEventListener("click", onCopyClick);
  els.localeSelect.addEventListener("change", onLocaleChange);

  supportedExtensions = await invoke("supported_extensions");

  setupDragAndDrop();
  applyTranslations();
  showView("empty");
});
