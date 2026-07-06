import type { Lang } from "./locales.js";
import { DEFAULT_LANG } from "./locales.js";

export function detectLang(code?: string): Lang {
  if (!code) {
    return DEFAULT_LANG;
  }
  const c = code.toLowerCase();
  if (c.startsWith("ru")) return "ru";
  if (c.startsWith("uk")) return "uk";
  if (c.startsWith("de")) return "de";
  if (c.startsWith("es")) return "es";
  if (c.startsWith("zh")) return "zh";
  if (c.startsWith("ja")) return "ja";
  if (c.startsWith("en")) return "en";
  return DEFAULT_LANG;
}
