export default {
  toolbar: {
    open: "Otevřít soubor...",
    save: "Uložit jako...",
    copy: "Zkopírovat do schránky",
    dropHint: "nebo přetáhněte soubor(y) do okna",
  },
  emptyState: {
    supported: "Podporované formáty: {list}",
  },
  pane: {
    markdown: "Markdown",
    preview: "Náhled",
  },
  dropOverlay: "Pustit pro konverzi",
  batch: {
    tableFile: "Soubor",
    tableResult: "Výsledek",
    progress: "{done}/{total} zpracováno",
    statusWaiting: "čeká...",
    statusConverting: "konvertuji...",
    statusOk: "OK -> {file}",
    statusError: "chyba: {error}",
    summary: "Hotovo: {succeeded} v pořádku, {failed} selhalo (z {total}).",
  },
  errors: {
    notFound: "Soubor {path} neexistuje.",
    unsupportedExtensionKnown:
      "Nepodporovaná přípona '{extension}' souboru {path}. Podporované formáty jsou: {supported}.",
    unsupportedExtensionUnknown:
      "Soubor {path} nemá příponu. Podporované formáty jsou: {supported}.",
    conversionFailed: "Konverze souboru {path} selhala: {detail}",
    writeFailed: "Nepodařilo se uložit {path}: {detail}",
    internal: "Interní chyba: {detail}",
    clipboard: "Nepodařilo se zkopírovat do schránky: {error}",
  },
};
