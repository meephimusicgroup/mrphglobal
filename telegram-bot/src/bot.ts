import { Bot, GrammyError, HttpError, InlineKeyboard, InputFile } from "grammy";
import { config } from "./config.js";
import {
  createWallet,
  estimateFeeBase,
  explorerAddressUrl,
  explorerTxUrl,
  formatAmount,
  getBalance,
  getIbcChannels,
  getNetworkStatus,
  getRecentTxs,
  importFromMnemonic,
  isValidAddress,
  parseDisplayAmount,
  sendTokens,
} from "./chain.js";
import { encryptSecret, decryptSecret } from "./crypto.js";
import { detectLang } from "./i18n/detect.js";
import type { Lang } from "./i18n/locales.js";
import { LANG_LABELS, t } from "./i18n/locales.js";
import {
  amountKeyboard,
  cancelKeyboard,
  confirmSendKeyboard,
  createWalletKeyboard,
  exportConfirmKeyboard,
  isHelpButton,
  isLanguageButton,
  languageKeyboard,
  mainMenuKeyboard,
  MENU_BUTTONS,
  receiveKeyboard,
} from "./keyboards.js";
import { generateAddressQr } from "./qr.js";
import { migrateLegacyWallets, UserStorage } from "./storage.js";

const storage = new UserStorage(config.dataDir);

function userId(ctx: { from?: { id: number } }): string {
  if (!ctx.from?.id) {
    throw new Error("No Telegram user id");
  }
  return String(ctx.from.id);
}

async function langOf(ctx: { from?: { id: number } }): Promise<Lang> {
  return storage.getLang(userId(ctx));
}

async function showMainMenu(
  ctx: { from?: { id: number }; reply: (text: string, extra?: object) => Promise<unknown> },
): Promise<void> {
  const lang = await langOf(ctx);
  const wallet = await storage.getWallet(userId(ctx));
  const text = wallet ? t(lang, "welcomeBack") : t(lang, "welcome");
  await ctx.reply(text, {
    parse_mode: "HTML",
    link_preview_options: { is_disabled: true },
    reply_markup: wallet ? mainMenuKeyboard(lang) : createWalletKeyboard(lang),
  });
}

export async function initBotStorage(): Promise<void> {
  await migrateLegacyWallets(storage, config.dataDir);
}

export function createBot(): Bot {
  const bot = new Bot(config.token);

  bot.command("start", async (ctx) => {
    const id = userId(ctx);
    const rec = await storage.getRecord(id);
    if (!rec.lang && ctx.from?.language_code) {
      await storage.setLang(id, detectLang(ctx.from.language_code));
    }
    await showMainMenu(ctx);
  });
  bot.command("menu", async (ctx) => showMainMenu(ctx));
  bot.command("language", async (ctx) => {
    const lang = await langOf(ctx);
    await ctx.reply(t(lang, "languagePick"), {
      reply_markup: languageKeyboard(),
    });
  });
  bot.command("help", async (ctx) => {
    const lang = await langOf(ctx);
    await ctx.reply(t(lang, "helpText"), { parse_mode: "HTML" });
  });

  // Legacy commands still work
  bot.command("createwallet", async (ctx) => handleCreateWallet(ctx));
  bot.command("balance", async (ctx) => handleBalance(ctx));
  bot.command("address", async (ctx) => handleReceive(ctx));
  bot.command("send", async (ctx) => {
    const text = ctx.message?.text ?? "";
    const parts = text.trim().split(/\s+/);
    if (parts.length >= 3) {
      await handleQuickSend(ctx, parts[1], parts[2]);
      return;
    }
    await handleSendStart(ctx);
  });

  bot.command("export", async (ctx) => {
    const lang = await langOf(ctx);
    const wallet = await storage.getWallet(userId(ctx));
    if (!wallet) {
      await ctx.reply(t(lang, "noWallet"), { reply_markup: createWalletKeyboard(lang) });
      return;
    }
    await ctx.reply(t(lang, "exportConfirm"), {
      parse_mode: "HTML",
      reply_markup: exportConfirmKeyboard(lang),
    });
  });

  bot.command("import", async (ctx) => {
    const lang = await langOf(ctx);
    const id = userId(ctx);
    const text = (ctx.message?.text ?? "").replace(/^\/import(@\w+)?\s*/i, "").trim();
    if (!text) {
      await ctx.reply(t(lang, "importUsage"), { parse_mode: "HTML" });
      return;
    }
    if (await storage.getWallet(id)) {
      await ctx.reply(t(lang, "walletExists"), { parse_mode: "HTML" });
      return;
    }
    try {
      const { address } = await importFromMnemonic(text);
      await storage.setWallet(id, {
        address,
        encryptedMnemonic: encryptSecret(text.trim().toLowerCase(), config.encryptionKey),
        createdAt: new Date().toISOString(),
      });
      await ctx.reply(t(lang, "importSuccess", { address }), {
        parse_mode: "HTML",
        reply_markup: mainMenuKeyboard(lang),
      });
    } catch {
      await ctx.reply(t(lang, "importInvalid"), { parse_mode: "HTML" });
    }
  });

  bot.callbackQuery("export:confirm", async (ctx) => {
    const lang = await langOf(ctx);
    const wallet = await storage.getWallet(userId(ctx));
    if (!wallet) {
      await ctx.answerCallbackQuery();
      return;
    }
    await ctx.answerCallbackQuery();
    const mnemonic = decryptSecret(wallet.encryptedMnemonic, config.encryptionKey);
    await ctx.reply(t(lang, "seedWarning", { mnemonic }), { parse_mode: "HTML" });
  });

  bot.callbackQuery("action:create_wallet", async (ctx) => {
    await ctx.answerCallbackQuery();
    await handleCreateWallet(ctx);
  });

  bot.callbackQuery("action:cancel", async (ctx) => {
    const lang = await langOf(ctx);
    await storage.clearSendDraft(userId(ctx));
    await ctx.answerCallbackQuery({ text: t(lang, "cancelled") });
    await ctx.reply(t(lang, "mainMenu"), { reply_markup: mainMenuKeyboard(lang) });
  });

  bot.callbackQuery(/^lang:(.+)$/, async (ctx) => {
    const code = ctx.match[1] as Lang;
    const id = userId(ctx);
    await storage.setLang(id, code);
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(t(code, "languageSet", { lang: LANG_LABELS[code] }));
    await showMainMenu(ctx);
  });

  bot.callbackQuery("action:qr", async (ctx) => {
    const lang = await langOf(ctx);
    const wallet = await storage.getWallet(userId(ctx));
    if (!wallet) {
      await ctx.answerCallbackQuery();
      return;
    }
    await ctx.answerCallbackQuery();
    const png = await generateAddressQr(wallet.address);
    await ctx.replyWithPhoto(new InputFile(png, "mrph-qr.png"), {
      caption: `${t(lang, "qrCaption")}\n\n<code>${wallet.address}</code>`,
      parse_mode: "HTML",
    });
  });

  bot.callbackQuery(/^amount:(.+)$/, async (ctx) => {
    const pick = ctx.match[1];
    const lang = await langOf(ctx);
    const id = userId(ctx);
    const rec = await storage.getRecord(id);
    if (!rec.sendDraft?.to) {
      await ctx.answerCallbackQuery();
      return;
    }
    if (pick === "custom") {
      await storage.updateRecord(id, { awaiting: "send_amount" });
      await ctx.answerCallbackQuery();
      await ctx.reply(t(lang, "sendEnterAmount", { address: rec.sendDraft.to }), {
        parse_mode: "HTML",
      });
      return;
    }
    await storage.updateRecord(id, {
      sendDraft: { to: rec.sendDraft.to, amount: pick },
      awaiting: undefined,
    });
    await ctx.answerCallbackQuery();
    await ctx.reply(
      t(lang, "sendConfirm", { amount: pick, address: rec.sendDraft.to }),
      { parse_mode: "HTML", reply_markup: confirmSendKeyboard(lang) },
    );
  });

  bot.callbackQuery("send:confirm", async (ctx) => {
    const lang = await langOf(ctx);
    const id = userId(ctx);
    const wallet = await storage.getWallet(id);
    const rec = await storage.getRecord(id);
    if (!wallet || !rec.sendDraft?.to || !rec.sendDraft.amount) {
      await ctx.answerCallbackQuery();
      return;
    }
    await ctx.answerCallbackQuery();
    await executeSend(ctx, wallet, rec.sendDraft.to, rec.sendDraft.amount, lang);
    await storage.clearSendDraft(id);
  });

  bot.on("message:text", async (ctx) => {
    const text = ctx.message.text.trim();
    const lang = await langOf(ctx);
    const id = userId(ctx);

    if (MENU_BUTTONS.has(text)) {
      if (text.includes("Balance") || text.includes("Баланс") || text.includes("Saldo") || text.includes("Guthaben") || text.includes("余额")) {
        await handleBalance(ctx);
      } else if (text.includes("Send") || text.includes("Отправить") || text.includes("Enviar") || text.includes("Senden") || text.includes("Надіслати") || text.includes("发送")) {
        await handleSendStart(ctx);
      } else if (text.includes("Receive") || text.includes("Получить") || text.includes("Recibir") || text.includes("Empfangen") || text.includes("Отримати") || text.includes("接收")) {
        await handleReceive(ctx);
      } else if (text.includes("History") || text.includes("История") || text.includes("Historial") || text.includes("Verlauf") || text.includes("Історія") || text.includes("历史")) {
        await handleHistory(ctx);
      } else if (text.includes("Network") || text.includes("Сеть") || text.includes("Red") || text.includes("Netz") || text.includes("Мережа") || text.includes("网络")) {
        await handleNetwork(ctx);
      } else if (text.includes("IBC")) {
        await handleIbc(ctx);
      } else if (isLanguageButton(text)) {
        await ctx.reply(t(lang, "languagePick"), { reply_markup: languageKeyboard() });
      } else if (isHelpButton(text)) {
        await ctx.reply(t(lang, "helpText"), { parse_mode: "HTML" });
      }
      return;
    }

    const rec = await storage.getRecord(id);
    if (rec.awaiting === "send_address") {
      if (!isValidAddress(text)) {
        await ctx.reply(t(lang, "invalidAddress"), { parse_mode: "HTML" });
        return;
      }
      await storage.updateRecord(id, {
        sendDraft: { to: text },
        awaiting: "send_amount",
      });
      await ctx.reply(t(lang, "sendEnterAmount", { address: text }), {
        parse_mode: "HTML",
        reply_markup: amountKeyboard(lang),
      });
      return;
    }

    if (rec.awaiting === "send_amount" && rec.sendDraft?.to) {
      let baseAmount: string;
      try {
        baseAmount = parseDisplayAmount(text);
      } catch {
        await ctx.reply(t(lang, "invalidAmount"), { parse_mode: "HTML" });
        return;
      }
      const display = formatAmount(baseAmount);
      await storage.updateRecord(id, {
        sendDraft: { to: rec.sendDraft.to, amount: display },
        awaiting: undefined,
      });
      await ctx.reply(
        t(lang, "sendConfirm", { amount: display, address: rec.sendDraft.to }),
        { parse_mode: "HTML", reply_markup: confirmSendKeyboard(lang) },
      );
    }
  });

  bot.catch((err) => {
    console.error(`Update ${err.ctx.update.update_id}:`, err.error);
    if (err.error instanceof GrammyError) {
      console.error("Grammy:", err.error.description);
    } else if (err.error instanceof HttpError) {
      console.error("HTTP:", err.error);
    }
  });

  return bot;
}

async function handleCreateWallet(ctx: { from?: { id: number }; reply: Function }): Promise<void> {
  const lang = await langOf(ctx);
  const id = userId(ctx);
  const existing = await storage.getWallet(id);
  if (existing) {
    await ctx.reply(t(lang, "walletExists"), {
      parse_mode: "HTML",
      reply_markup: mainMenuKeyboard(lang),
    });
    return;
  }
  const { address, mnemonic } = await createWallet();
  await storage.setWallet(id, {
    address,
    encryptedMnemonic: encryptSecret(mnemonic, config.encryptionKey),
    createdAt: new Date().toISOString(),
  });
  const kb = new InlineKeyboard().url("🔍 Explorer", explorerAddressUrl(address));
  await ctx.reply(t(lang, "walletCreated", { address }), {
    parse_mode: "HTML",
    reply_markup: kb,
  });
  await ctx.reply(t(lang, "seedShow"), { parse_mode: "HTML" });
  await ctx.reply(t(lang, "seedWarning", { mnemonic }), { parse_mode: "HTML" });
  await ctx.reply(t(lang, "welcomeBack"), {
    parse_mode: "HTML",
    reply_markup: mainMenuKeyboard(lang),
  });
}

async function handleBalance(ctx: { from?: { id: number }; reply: Function }): Promise<void> {
  const lang = await langOf(ctx);
  const wallet = await storage.getWallet(userId(ctx));
  if (!wallet) {
    await ctx.reply(t(lang, "noWallet"), { reply_markup: createWalletKeyboard(lang) });
    return;
  }
  const [amount, net] = await Promise.all([
    getBalance(wallet.address),
    getNetworkStatus(),
  ]);
  await ctx.reply(
    [
      t(lang, "balanceTitle"),
      "",
      `<code>${wallet.address}</code>`,
      "",
      `<b>${formatAmount(amount)} ${config.displayDenom}</b>`,
      "",
      t(lang, "balanceWithHeight", { height: net.height }),
      "",
      t(lang, "feeNote"),
    ].join("\n"),
    { parse_mode: "HTML", reply_markup: receiveKeyboard(lang, wallet.address) },
  );
}

async function handleReceive(
  ctx: { from?: { id: number }; reply: Function; replyWithPhoto?: Function },
): Promise<void> {
  const lang = await langOf(ctx);
  const wallet = await storage.getWallet(userId(ctx));
  if (!wallet) {
    await ctx.reply(t(lang, "noWallet"), { reply_markup: createWalletKeyboard(lang) });
    return;
  }
  await ctx.reply(t(lang, "receiveTitle", { address: wallet.address }), {
    parse_mode: "HTML",
    reply_markup: receiveKeyboard(lang, wallet.address),
  });
}

async function handleSendStart(ctx: { from?: { id: number }; reply: Function }): Promise<void> {
  const lang = await langOf(ctx);
  const id = userId(ctx);
  const wallet = await storage.getWallet(id);
  if (!wallet) {
    await ctx.reply(t(lang, "noWallet"), { reply_markup: createWalletKeyboard(lang) });
    return;
  }
  await storage.updateRecord(id, { awaiting: "send_address", sendDraft: undefined });
  await ctx.reply(t(lang, "sendEnterAddress"), {
    parse_mode: "HTML",
    reply_markup: cancelKeyboard(lang),
  });
}

async function handleQuickSend(
  ctx: { from?: { id: number }; reply: Function },
  to: string,
  amountInput: string,
): Promise<void> {
  const lang = await langOf(ctx);
  const wallet = await storage.getWallet(userId(ctx));
  if (!wallet) {
    await ctx.reply(t(lang, "noWallet"));
    return;
  }
  if (!isValidAddress(to)) {
    await ctx.reply(t(lang, "invalidAddress"), { parse_mode: "HTML" });
    return;
  }
  await executeSend(ctx, wallet, to, amountInput, lang);
}

async function executeSend(
  ctx: { reply: Function },
  wallet: { address: string; encryptedMnemonic: string; createdAt: string },
  to: string,
  amountInput: string,
  lang: Lang,
): Promise<void> {
  let baseAmount: string;
  try {
    baseAmount = parseDisplayAmount(amountInput);
  } catch {
    await ctx.reply(t(lang, "invalidAmount"), { parse_mode: "HTML" });
    return;
  }
  const current = BigInt(await getBalance(wallet.address));
  const send = BigInt(baseAmount);
  const fee = estimateFeeBase();
  if (current < send + fee) {
    await ctx.reply(
      t(lang, "insufficientFunds", {
        balance: formatAmount(current.toString()),
        needed: formatAmount((send + fee).toString()),
      }),
      { parse_mode: "HTML" },
    );
    return;
  }
  await ctx.reply(t(lang, "sending"));
  try {
    const { txHash } = await sendTokens(wallet, to, baseAmount);
    const kb = new InlineKeyboard().url("🔍 Tx", explorerTxUrl(txHash));
    await ctx.reply(
      t(lang, "sendSuccess", {
        amount: formatAmount(baseAmount),
        address: to,
        hash: txHash,
      }),
      { parse_mode: "HTML", reply_markup: kb },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "error";
    await ctx.reply(t(lang, "sendError", { error: msg }), { parse_mode: "HTML" });
  }
}

async function handleHistory(ctx: { from?: { id: number }; reply: Function }): Promise<void> {
  const lang = await langOf(ctx);
  const wallet = await storage.getWallet(userId(ctx));
  if (!wallet) {
    await ctx.reply(t(lang, "noWallet"), { reply_markup: createWalletKeyboard(lang) });
    return;
  }
  const txs = await getRecentTxs(wallet.address, 5);
  if (txs.length === 0) {
    await ctx.reply([t(lang, "historyTitle"), "", t(lang, "historyEmpty")].join("\n"), {
      parse_mode: "HTML",
    });
    return;
  }
  const lines = txs.map((tx) => {
    const label =
      tx.direction === "in"
        ? t(lang, "txIncoming", { amount: formatAmount(tx.amount) })
        : t(lang, "txOutgoing", { amount: formatAmount(tx.amount) });
    const short =
      tx.counterparty.length > 16
        ? `${tx.counterparty.slice(0, 10)}...${tx.counterparty.slice(-4)}`
        : tx.counterparty;
    return `${label}\n<code>${short}</code>\n<a href="${explorerTxUrl(tx.hash)}">tx</a>`;
  });
  await ctx.reply([t(lang, "historyTitle"), "", ...lines].join("\n\n"), {
    parse_mode: "HTML",
    link_preview_options: { is_disabled: true },
  });
}

async function handleNetwork(ctx: { from?: { id: number }; reply: Function }): Promise<void> {
  const lang = await langOf(ctx);
  const net = await getNetworkStatus();
  const status = net.catchingUp ? "syncing" : "🟢 24/7 LIVE";
  await ctx.reply(
    t(lang, "networkBody", {
      chainId: net.chainId,
      height: net.height,
      status,
    }),
    { parse_mode: "HTML" },
  );
}

async function handleIbc(ctx: { from?: { id: number }; reply: Function }): Promise<void> {
  const lang = await langOf(ctx);
  const channels = await getIbcChannels();
  const open = channels.filter((c) => c.state === "STATE_OPEN");
  const channelsText =
    open.length > 0
      ? t(lang, "ibcChannels", {
          list: open
            .map(
              (c) =>
                `• ${c.channelId} ↔ ${c.counterpartyChannel} (${c.portId})`,
            )
            .join("\n"),
        })
      : t(lang, "ibcNoChannels");
  await ctx.reply(
    [t(lang, "ibcTitle"), "", t(lang, "ibcBody", { channels: channelsText })].join("\n"),
    { parse_mode: "HTML" },
  );
}
