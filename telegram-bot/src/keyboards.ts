import { InlineKeyboard, Keyboard } from "grammy";
import type { Lang } from "./i18n/locales.js";
import { LANG_LABELS, t } from "./i18n/locales.js";

export function mainMenuKeyboard(lang: Lang): Keyboard {
  const labels: Record<Lang, [string, string, string, string, string, string]> = {
    ru: ["💰 Баланс", "📤 Отправить", "📬 Получить", "📜 История", "🌍 Сеть", "🚇 IBC"],
    en: ["💰 Balance", "📤 Send", "📬 Receive", "📜 History", "🌍 Network", "🚇 IBC"],
    es: ["💰 Saldo", "📤 Enviar", "📬 Recibir", "📜 Historial", "🌍 Red", "🚇 IBC"],
    uk: ["💰 Баланс", "📤 Надіслати", "📬 Отримати", "📜 Історія", "🌍 Мережа", "🚇 IBC"],
    de: ["💰 Guthaben", "📤 Senden", "📬 Empfangen", "📜 Verlauf", "🌍 Netz", "🚇 IBC"],
    zh: ["💰 余额", "📤 发送", "📬 接收", "📜 历史", "🌍 网络", "🚇 IBC"],
    ja: ["💰 残高", "📤 送金", "📬 受取", "📜 履歴", "🌍 ネット", "🚇 IBC"],
  };
  const [a, b, c, d, e, f] = labels[lang];
  const langBtn =
    lang === "ru"
      ? "🌐 Язык"
      : lang === "uk"
        ? "🌐 Мова"
        : lang === "de"
          ? "🌐 Sprache"
          : lang === "es"
            ? "🌐 Idioma"
            : lang === "zh"
              ? "🌐 语言"
              : lang === "ja"
                ? "🌐 言語"
                : "🌐 Language";
  const helpBtn =
    lang === "ru"
      ? "ℹ️ Справка"
      : lang === "uk"
        ? "ℹ️ Допомога"
        : lang === "de"
          ? "ℹ️ Hilfe"
          : lang === "es"
            ? "ℹ️ Ayuda"
            : lang === "zh"
              ? "ℹ️ 帮助"
              : lang === "ja"
                ? "ℹ️ ヘルプ"
                : "ℹ️ Help";
  return new Keyboard()
    .text(a)
    .text(b)
    .row()
    .text(c)
    .text(d)
    .row()
    .text(e)
    .text(f)
    .row()
    .text(langBtn)
    .text(helpBtn)
    .resized();
}

export function createWalletKeyboard(lang: Lang): InlineKeyboard {
  const label =
    lang === "ru"
      ? "✨ Создать кошелёк"
      : lang === "en"
        ? "✨ Create wallet"
        : lang === "es"
          ? "✨ Crear billetera"
          : lang === "uk"
            ? "✨ Створити гаманець"
            : lang === "de"
              ? "✨ Wallet erstellen"
              : lang === "ja"
                ? "✨ ウォレット作成"
                : "✨ 创建钱包";
  return new InlineKeyboard().text(label, "action:create_wallet");
}

export function receiveKeyboard(lang: Lang, address: string): InlineKeyboard {
  const shareText = encodeURIComponent(`MRPH Global · ${address}`);
  const shareUrl = encodeURIComponent(explorerUrl(address));
  return new InlineKeyboard()
    .text(t(lang, "btnQr"), "action:qr")
    .url("🔍 Explorer", explorerUrl(address))
    .row()
    .url(t(lang, "btnShare"), `https://t.me/share/url?url=${shareUrl}&text=${shareText}`);
}

export function cancelKeyboard(lang: Lang): InlineKeyboard {
  return new InlineKeyboard().text(t(lang, "btnCancel"), "action:cancel");
}

export function amountKeyboard(lang: Lang): InlineKeyboard {
  return new InlineKeyboard()
    .text("0.1 MRPH", "amount:0.1")
    .text("1 MRPH", "amount:1")
    .text("5 MRPH", "amount:5")
    .row()
    .text(t(lang, "btnCustom"), "amount:custom")
    .text(t(lang, "btnCancel"), "action:cancel");
}

export function exportConfirmKeyboard(lang: Lang): InlineKeyboard {
  return new InlineKeyboard()
    .text(t(lang, "btnConfirm"), "export:confirm")
    .text(t(lang, "btnCancel"), "action:cancel");
}

export function confirmSendKeyboard(lang: Lang): InlineKeyboard {
  return new InlineKeyboard()
    .text(t(lang, "btnConfirm"), "send:confirm")
    .text(t(lang, "btnCancel"), "action:cancel");
}

export function languageKeyboard(): InlineKeyboard {
  const kb = new InlineKeyboard();
  const langs = Object.entries(LANG_LABELS) as [Lang, string][];
  for (let i = 0; i < langs.length; i += 2) {
    const [l1, label1] = langs[i];
    const pair = langs[i + 1];
    if (pair) {
      kb.text(label1, `lang:${l1}`).text(pair[1], `lang:${pair[0]}`).row();
    } else {
      kb.text(label1, `lang:${l1}`);
    }
  }
  return kb;
}

function explorerUrl(address: string): string {
  return `http://167.233.230.221:8080/ping/mrphglobal/account/${address}`;
}

export const MENU_BUTTONS = new Set([
  "💰 Баланс", "📤 Отправить", "📬 Получить", "📜 История", "🌍 Сеть", "🚇 IBC",
  "💰 Balance", "📤 Send", "📬 Receive", "📜 History", "🌍 Network",
  "💰 Saldo", "📤 Enviar", "📬 Recibir", "📜 Historial", "🌍 Red",
  "💰 Guthaben", "📤 Senden", "📬 Empfangen", "📜 Verlauf", "🌍 Netz",
  "📤 Надіслати", "📬 Отримати", "📜 Історія", "🌍 Мережа",
  "💰 余额", "📤 发送", "📬 接收", "📜 历史", "🌍 网络",
  "💰 残高", "📤 送金", "📬 受取", "📜 履歴", "🌍 ネット",
  "🌐 Language", "ℹ️ Help", "🌐 Язык", "ℹ️ Справка",
  "🌐 Мова", "ℹ️ Допомога", "🌐 Sprache", "ℹ️ Hilfe",
  "🌐 Idioma", "ℹ️ Ayuda", "🌐 语言", "ℹ️ 帮助",
]);

export function isHelpButton(text: string): boolean {
  return text.startsWith("ℹ️");
}

export function isLanguageButton(text: string): boolean {
  return text.startsWith("🌐");
}
