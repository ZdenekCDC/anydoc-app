import cs from "./cs.js";
import en from "./en.js";

const LOCALES = { cs, en };
const STORAGE_KEY = "anydoc-app.locale";
const FALLBACK_LOCALE = "en";

function detectSystemLocale() {
  const lang = navigator.language || navigator.languages?.[0] || "";
  return lang.toLowerCase().startsWith("cs") ? "cs" : FALLBACK_LOCALE;
}

let currentLocale = localStorage.getItem(STORAGE_KEY) || detectSystemLocale();

export function getLocale() {
  return currentLocale;
}

export function setLocale(locale) {
  if (!LOCALES[locale]) return;
  currentLocale = locale;
  localStorage.setItem(STORAGE_KEY, locale);
}

function lookup(key) {
  const dict = LOCALES[currentLocale] ?? LOCALES[FALLBACK_LOCALE];
  const value = key.split(".").reduce((node, part) => node?.[part], dict);
  if (value !== undefined) return value;
  const fallback = key.split(".").reduce((node, part) => node?.[part], LOCALES[FALLBACK_LOCALE]);
  return fallback ?? key;
}

export function t(key, params) {
  let text = lookup(key);
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}
