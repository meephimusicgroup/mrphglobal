export type Lang = "ru" | "en" | "es" | "uk" | "de" | "zh" | "ja";

export const LANG_LABELS: Record<Lang, string> = {
  ru: "🇷🇺 Русский",
  en: "🇬🇧 English",
  es: "🇪🇸 Español",
  uk: "🇺🇦 Українська",
  de: "🇩🇪 Deutsch",
  zh: "🇨🇳 中文",
  ja: "🇯🇵 日本語",
};

export const DEFAULT_LANG: Lang = "ru";

export type LocaleKey =
  | "welcome"
  | "welcomeBack"
  | "noWallet"
  | "walletExists"
  | "walletCreated"
  | "balanceTitle"
  | "receiveTitle"
  | "sendEnterAddress"
  | "sendEnterAmount"
  | "sendConfirm"
  | "sendSuccess"
  | "sendError"
  | "invalidAddress"
  | "invalidAmount"
  | "insufficientFunds"
  | "sending"
  | "historyTitle"
  | "historyEmpty"
  | "networkTitle"
  | "networkBody"
  | "ibcTitle"
  | "ibcBody"
  | "ibcNoChannels"
  | "ibcChannels"
  | "languagePick"
  | "languageSet"
  | "helpText"
  | "feeNote"
  | "txIncoming"
  | "txOutgoing"
  | "cancelled"
  | "mainMenu"
  | "btnConfirm"
  | "btnCancel"
  | "btnCustom"
  | "btnQr"
  | "qrCaption"
  | "balanceWithHeight"
  | "btnShare"
  | "seedWarning"
  | "seedShow"
  | "exportConfirm"
  | "seedExported"
  | "importSuccess"
  | "importInvalid"
  | "importUsage";

type LocaleStrings = Record<LocaleKey, string>;

export const locales: Record<Lang, LocaleStrings> = {
  ru: {
    welcome:
      "🌐 <b>MRPH Global Wallet</b>\n\nВаш кошелёк в суверенной сети <b>mrphglobal-1</b>.\n\n⚡ Переводы <b>24/7</b> — без банков, без границ.\n🌍 Отправляйте MRPH любому адресу <code>mrph...</code> в любой точке мира.\n\n<a href=\"http://167.233.230.221:8080/landing.html\">🌐 Сайт сети</a> · <a href=\"http://167.233.230.221:8080/ping/mrphglobal\">🔍 Explorer</a>\n\nСоздайте кошелёк кнопкой ниже 👇",
    welcomeBack:
      "🌐 <b>MRPH Global Wallet</b>\n\nСеть работает круглосуточно.\n<a href=\"http://167.233.230.221:8080/landing.html\">🌐 Сайт</a> · <a href=\"http://167.233.230.221:8080/ping/mrphglobal\">🔍 Explorer</a>\n\nВыберите действие 👇",
    noWallet: "Сначала создайте кошелёк 👇",
    walletExists: "✅ Кошелёк уже создан",
    walletCreated:
      "✅ <b>Кошелёк создан</b>\n\n📬 Адрес:\n<code>{address}</code>\n\nПополните его или получите перевод от друга.\n🔐 Мнемоника зашифрована на сервере.",
    balanceTitle: "💰 <b>Баланс</b>",
    receiveTitle: "📬 <b>Получить MRPH</b>\n\nОтправьте на этот адрес:\n<code>{address}</code>\n\n🌍 Работает из любой страны — сеть не спит.",
    sendEnterAddress:
      "📤 <b>Глобальный перевод</b>\n\nВведите адрес получателя <code>mrph...</code>\n\nИли нажмите «Отмена».",
    sendEnterAmount:
      "💸 Получатель:\n<code>{address}</code>\n\nВведите сумму в <b>MRPH</b> или выберите быструю сумму:",
    sendConfirm:
      "✅ <b>Подтвердите перевод</b>\n\n📤 {amount} MRPH\n📬 Кому: <code>{address}</code>\n💳 Комиссия: ~0.2 MRPH\n\n🌍 Трансграничный перевод — мгновенно, 24/7",
    sendSuccess:
      "🎉 <b>Отправлено!</b>\n\n💸 {amount} MRPH → <code>{address}</code>\n🔗 Tx: <code>{hash}</code>",
    sendError: "❌ Ошибка: {error}",
    invalidAddress: "❌ Неверный адрес. Нужен префикс <code>mrph</code>",
    invalidAmount: "❌ Неверная сумма. Пример: <code>1</code> или <code>0.5</code>",
    insufficientFunds:
      "❌ Недостаточно средств.\nБаланс: <b>{balance}</b> MRPH\nНужно: <b>{needed}</b> MRPH (с комиссией)",
    sending: "⏳ Отправка в блокчейн...",
    historyTitle: "📜 <b>История</b>",
    historyEmpty: "Пока нет транзакций.",
    networkTitle: "🌍 <b>Сеть MRPH Global</b>",
    networkBody:
      "Chain: <code>{chainId}</code>\nБлок: <b>{height}</b>\nСтатус: <b>{status}</b>\n\n⚡ Нода работает 24/7\n🌐 Переводы без границ — только адрес <code>mrph...</code>",
    ibcTitle: "🚇 <b>Межсетевой туннель (IBC)</b>",
    ibcBody:
      "IBC — «туннель» между Cosmos-сетями. MRPH Global уже поддерживает IBC Transfer.\n\n{channels}\n\n🔗 Когда подключим relayer к Cosmos Hub / Osmosis — MRPH можно будет пересылать между сетями как по туннелю.",
    ibcNoChannels: "📡 Активных IBC-каналов пока нет — сеть автономна.\nRelayer в разработке.",
    ibcChannels: "📡 Активные каналы:\n{list}",
    languagePick: "🌐 Выберите язык / Choose language:",
    languageSet: "✅ Язык: {lang}",
    helpText:
      "ℹ️ <b>Справка</b>\n\n• Переводы <b>24/7</b>\n• Self-custody: /export · /import\n• Tangem / Keplr — docs/WALLETS.md\n\nКоманды: /start /export /import /language",
    feeNote: "Комиссия сети ~0.2 MRPH",
    txIncoming: "📥 +{amount} MRPH",
    txOutgoing: "📤 −{amount} MRPH",
    cancelled: "Отменено",
    mainMenu: "🏠 Главное меню",
    btnConfirm: "✅ Подтвердить",
    btnCancel: "❌ Отмена",
    btnCustom: "✏️ Своя сумма",
    btnQr: "📱 QR-код",
    qrCaption: "📱 Отсканируйте QR — адрес для получения MRPH",
    balanceWithHeight: "Блок сети: <b>{height}</b> · 🟢 24/7",
    btnShare: "📤 Поделиться",
    seedWarning:
      "🔐 <b>Seed-фраза (24 слова)</b>\n\n<code>{mnemonic}</code>\n\n⚠️ Запишите на бумаге. Никому не отправляйте.\nУдалите это сообщение после сохранения.\n\nKeplr · Tangem · Leap — импортируйте эту фразу для self-custody.",
    seedShow: "Ваша seed-фраза (показана один раз):",
    exportConfirm: "⚠️ Экспорт seed-фразы. Нажмите только если вы один в чате:",
    seedExported: "Seed отправлена выше. Храните оффлайн.",
    importSuccess: "✅ Кошелёк импортирован\n\n<code>{address}</code>",
    importInvalid: "❌ Неверная мнемоника. Нужно 12 или 24 слова латиницей.",
    importUsage: "Формат: /import word1 word2 ... word24",
  },
  en: {
    welcome:
      "🌐 <b>MRPH Global Wallet</b>\n\nYour wallet on sovereign network <b>mrphglobal-1</b>.\n\n⚡ Transfers <b>24/7</b> — no banks, no borders.\n\n<a href=\"http://167.233.230.221:8080/landing.html\">🌐 Website</a> · <a href=\"http://167.233.230.221:8080/ping/mrphglobal\">🔍 Explorer</a>\n\nCreate your wallet below 👇",
    welcomeBack:
      "🌐 <b>MRPH Global Wallet</b>\n\nNetwork runs 24/7.\n<a href=\"http://167.233.230.221:8080/landing.html\">🌐 Website</a> · <a href=\"http://167.233.230.221:8080/ping/mrphglobal\">🔍 Explorer</a>\n\nChoose an action 👇",
    noWallet: "Create a wallet first 👇",
    walletExists: "✅ Wallet already exists",
    walletCreated:
      "✅ <b>Wallet created</b>\n\n📬 Address:\n<code>{address}</code>\n\nFund it or receive from a friend.\n🔐 Mnemonic encrypted on server.",
    balanceTitle: "💰 <b>Balance</b>",
    receiveTitle:
      "📬 <b>Receive MRPH</b>\n\nSend to this address:\n<code>{address}</code>\n\n🌍 Works from any country — network never sleeps.",
    sendEnterAddress:
      "📤 <b>Global transfer</b>\n\nEnter recipient <code>mrph...</code> address\n\nOr tap Cancel.",
    sendEnterAmount:
      "💸 Recipient:\n<code>{address}</code>\n\nEnter amount in <b>MRPH</b> or pick a quick amount:",
    sendConfirm:
      "✅ <b>Confirm transfer</b>\n\n📤 {amount} MRPH\n📬 To: <code>{address}</code>\n💳 Fee: ~0.2 MRPH\n\n🌍 Cross-border — instant, 24/7",
    sendSuccess:
      "🎉 <b>Sent!</b>\n\n💸 {amount} MRPH → <code>{address}</code>\n🔗 Tx: <code>{hash}</code>",
    sendError: "❌ Error: {error}",
    invalidAddress: "❌ Invalid address. Must start with <code>mrph</code>",
    invalidAmount: "❌ Invalid amount. Example: <code>1</code> or <code>0.5</code>",
    insufficientFunds:
      "❌ Insufficient funds.\nBalance: <b>{balance}</b> MRPH\nNeed: <b>{needed}</b> MRPH (incl. fee)",
    sending: "⏳ Broadcasting to blockchain...",
    historyTitle: "📜 <b>History</b>",
    historyEmpty: "No transactions yet.",
    networkTitle: "🌍 <b>MRPH Global Network</b>",
    networkBody:
      "Chain: <code>{chainId}</code>\nBlock: <b>{height}</b>\nStatus: <b>{status}</b>\n\n⚡ Node runs 24/7\n🌐 Borderless transfers — just a <code>mrph...</code> address",
    ibcTitle: "🚇 <b>Interchain tunnel (IBC)</b>",
    ibcBody:
      "IBC is a tunnel between Cosmos chains. MRPH Global supports IBC Transfer.\n\n{channels}\n\n🔗 Once a relayer connects to Cosmos Hub / Osmosis — MRPH can move between chains like through a tunnel.",
    ibcNoChannels: "📡 No active IBC channels yet — network is sovereign.\nRelayer in development.",
    ibcChannels: "📡 Active channels:\n{list}",
    languagePick: "🌐 Choose language:",
    languageSet: "✅ Language: {lang}",
    helpText:
      "ℹ️ <b>Help</b>\n\n• Transfers <b>24/7</b>\n• Self-custody: /export · /import\n• Tangem / Keplr — see docs/WALLETS.md\n\nCommands: /start /export /import /language",
    feeNote: "Network fee ~0.2 MRPH",
    txIncoming: "📥 +{amount} MRPH",
    txOutgoing: "📤 −{amount} MRPH",
    cancelled: "Cancelled",
    mainMenu: "🏠 Main menu",
    btnConfirm: "✅ Confirm",
    btnCancel: "❌ Cancel",
    btnCustom: "✏️ Custom",
    btnQr: "📱 QR code",
    qrCaption: "📱 Scan QR — MRPH receive address",
    balanceWithHeight: "Block: <b>{height}</b> · 🟢 24/7",
    btnShare: "📤 Share",
    seedWarning:
      "🔐 <b>Seed phrase (24 words)</b>\n\n<code>{mnemonic}</code>\n\n⚠️ Write on paper. Never share.\nDelete this message after saving.\n\nImport to Keplr · Tangem · Leap for self-custody.",
    seedShow: "Your seed phrase (shown once):",
    exportConfirm: "⚠️ Export seed. Tap only if you are alone:",
    seedExported: "Seed sent above. Store offline.",
    importSuccess: "✅ Wallet imported\n\n<code>{address}</code>",
    importInvalid: "❌ Invalid mnemonic. Need 12 or 24 words.",
    importUsage: "Format: /import word1 word2 ... word24",
  },
  es: {
    welcome:
      "🌐 <b>MRPH Global Wallet</b>\n\nTu billetera en la red <b>mrphglobal-1</b>.\n\n⚡ Transferencias <b>24/7</b> — sin bancos, sin fronteras.\n🌍 Envía MRPH a cualquier dirección <code>mrph...</code>.\n\nCrea tu billetera 👇",
    welcomeBack: "🌐 <b>MRPH Global Wallet</b>\n\nRed activa 24/7. Elige una acción 👇",
    noWallet: "Primero crea una billetera 👇",
    walletExists: "✅ La billetera ya existe",
    walletCreated:
      "✅ <b>Billetera creada</b>\n\n📬 Dirección:\n<code>{address}</code>\n\n🔐 Mnemónico cifrado en el servidor.",
    balanceTitle: "💰 <b>Saldo</b>",
    receiveTitle:
      "📬 <b>Recibir MRPH</b>\n\nEnvía a:\n<code>{address}</code>\n\n🌍 Funciona desde cualquier país.",
    sendEnterAddress: "📤 <b>Transferencia global</b>\n\nIntroduce dirección <code>mrph...</code>",
    sendEnterAmount:
      "💸 Destinatario:\n<code>{address}</code>\n\nCantidad en <b>MRPH</b>:",
    sendConfirm:
      "✅ <b>Confirmar</b>\n\n📤 {amount} MRPH\n📬 A: <code>{address}</code>\n💳 Comisión: ~0.2 MRPH",
    sendSuccess:
      "🎉 <b>¡Enviado!</b>\n\n💸 {amount} MRPH → <code>{address}</code>\n🔗 Tx: <code>{hash}</code>",
    sendError: "❌ Error: {error}",
    invalidAddress: "❌ Dirección inválida. Prefijo <code>mrph</code>",
    invalidAmount: "❌ Cantidad inválida",
    insufficientFunds: "❌ Fondos insuficientes.\nSaldo: <b>{balance}</b> MRPH",
    sending: "⏳ Enviando...",
    historyTitle: "📜 <b>Historial</b>",
    historyEmpty: "Sin transacciones.",
    networkTitle: "🌍 <b>Red MRPH Global</b>",
    networkBody:
      "Chain: <code>{chainId}</code>\nBloque: <b>{height}</b>\nEstado: <b>{status}</b>\n\n⚡ 24/7 sin fronteras",
    ibcTitle: "🚇 <b>Túnel IBC</b>",
    ibcBody: "IBC conecta blockchains Cosmos.\n\n{channels}",
    ibcNoChannels: "📡 Sin canales IBC activos. Relayer en desarrollo.",
    ibcChannels: "📡 Canales:\n{list}",
    languagePick: "🌐 Elige idioma:",
    languageSet: "✅ Idioma: {lang}",
    helpText: "ℹ️ Transferencias 24/7. Comisión ~0.2 MRPH.",
    feeNote: "Comisión ~0.2 MRPH",
    txIncoming: "📥 +{amount} MRPH",
    txOutgoing: "📤 −{amount} MRPH",
    cancelled: "Cancelado",
    mainMenu: "🏠 Menú",
    btnConfirm: "✅ Confirmar",
    btnCancel: "❌ Cancelar",
    btnCustom: "✏️ Otra cantidad",
    btnQr: "📱 QR",
    qrCaption: "📱 Escanea QR — dirección MRPH",
    balanceWithHeight: "Bloque: <b>{height}</b> · 🟢 24/7",
    btnShare: "📤 Compartir",
    seedWarning: "🔐 <b>Seed (24 palabras)</b>\n\n<code>{mnemonic}</code>\n\n⚠️ Escríbela en papel. Keplr · Tangem · Leap.",
    seedShow: "Tu seed (una vez):",
    exportConfirm: "⚠️ Exportar seed. Solo en privado:",
    seedExported: "Seed arriba. Guarda offline.",
    importSuccess: "✅ Importado\n\n<code>{address}</code>",
    importInvalid: "❌ Mnemónico inválido",
    importUsage: "Formato: /import word1 ... word24",
  },
  uk: {
    welcome:
      "🌐 <b>MRPH Global Wallet</b>\n\nВаш гаманець у мережі <b>mrphglobal-1</b>.\n\n⚡ Перекази <b>24/7</b> — без банків і кордонів.\n🌍 Надсилайте MRPH на будь-яку адресу <code>mrph...</code>.\n\nСтворіть гаманець 👇",
    welcomeBack: "🌐 <b>MRPH Global Wallet</b>\n\nМережа працює 24/7 👇",
    noWallet: "Спочатку створіть гаманець 👇",
    walletExists: "✅ Гаманець уже створено",
    walletCreated:
      "✅ <b>Гаманець створено</b>\n\n📬 Адреса:\n<code>{address}</code>\n\n🔐 Мнемоніка зашифрована.",
    balanceTitle: "💰 <b>Баланс</b>",
    receiveTitle: "📬 <b>Отримати MRPH</b>\n\n<code>{address}</code>\n\n🌍 З будь-якої країни.",
    sendEnterAddress: "📤 <b>Глобальний переказ</b>\n\nВведіть адресу <code>mrph...</code>",
    sendEnterAmount: "💸 Отримувач:\n<code>{address}</code>\n\nСума в <b>MRPH</b>:",
    sendConfirm:
      "✅ <b>Підтвердіть</b>\n\n📤 {amount} MRPH\n📬 Кому: <code>{address}</code>",
    sendSuccess: "🎉 <b>Надіслано!</b>\n\n💸 {amount} MRPH\n🔗 Tx: <code>{hash}</code>",
    sendError: "❌ Помилка: {error}",
    invalidAddress: "❌ Невірна адреса <code>mrph</code>",
    invalidAmount: "❌ Невірна сума",
    insufficientFunds: "❌ Недостатньо коштів. Баланс: <b>{balance}</b> MRPH",
    sending: "⏳ Надсилання...",
    historyTitle: "📜 <b>Історія</b>",
    historyEmpty: "Немає транзакцій.",
    networkTitle: "🌍 <b>Мережа MRPH Global</b>",
    networkBody: "Chain: <code>{chainId}</code>\nБлок: <b>{height}</b>\nСтатус: <b>{status}</b>",
    ibcTitle: "🚇 <b>Міжмережевий тунель (IBC)</b>",
    ibcBody: "IBC — тунель між Cosmos-мережами.\n\n{channels}",
    ibcNoChannels: "📡 Немає активних IBC-каналів. Relayer у розробці.",
    ibcChannels: "📡 Канали:\n{list}",
    languagePick: "🌐 Оберіть мову:",
    languageSet: "✅ Мова: {lang}",
    helpText: "ℹ️ Перекази 24/7. Комісія ~0.2 MRPH.",
    feeNote: "Комісія ~0.2 MRPH",
    txIncoming: "📥 +{amount} MRPH",
    txOutgoing: "📤 −{amount} MRPH",
    cancelled: "Скасовано",
    mainMenu: "🏠 Меню",
    btnConfirm: "✅ Підтвердити",
    btnCancel: "❌ Скасувати",
    btnCustom: "✏️ Своя сума",
    btnQr: "📱 QR-код",
    qrCaption: "📱 Скануй QR — адреса MRPH",
    balanceWithHeight: "Блок: <b>{height}</b> · 🟢 24/7",
    btnShare: "📤 Поділитися",
    seedWarning: "🔐 <b>Seed (24 слова)</b>\n\n<code>{mnemonic}</code>\n\n⚠️ Запишіть на папері. Keplr · Tangem · Leap.",
    seedShow: "Ваша seed-фраза (один раз):",
    exportConfirm: "⚠️ Експорт seed. Лише наодинці:",
    seedExported: "Seed вище. Зберігайте офлайн.",
    importSuccess: "✅ Імпортовано\n\n<code>{address}</code>",
    importInvalid: "❌ Невірна мнемоніка",
    importUsage: "Формат: /import word1 ... word24",
  },
  de: {
    welcome:
      "🌐 <b>MRPH Global Wallet</b>\n\nDeine Wallet im Netzwerk <b>mrphglobal-1</b>.\n\n⚡ Überweisungen <b>24/7</b> — ohne Grenzen.\n🌍 Sende MRPH an jede <code>mrph...</code>-Adresse.\n\nWallet erstellen 👇",
    welcomeBack: "🌐 <b>MRPH Global Wallet</b>\n\nNetzwerk läuft 24/7 👇",
    noWallet: "Zuerst Wallet erstellen 👇",
    walletExists: "✅ Wallet existiert bereits",
    walletCreated: "✅ <b>Wallet erstellt</b>\n\n📬 <code>{address}</code>",
    balanceTitle: "💰 <b>Guthaben</b>",
    receiveTitle: "📬 <b>MRPH empfangen</b>\n\n<code>{address}</code>",
    sendEnterAddress: "📤 <b>Globale Überweisung</b>\n\n<code>mrph...</code>-Adresse eingeben",
    sendEnterAmount: "💸 Empfänger:\n<code>{address}</code>\n\nBetrag in <b>MRPH</b>:",
    sendConfirm: "✅ <b>Bestätigen</b>\n\n📤 {amount} MRPH → <code>{address}</code>",
    sendSuccess: "🎉 <b>Gesendet!</b>\n\n🔗 Tx: <code>{hash}</code>",
    sendError: "❌ Fehler: {error}",
    invalidAddress: "❌ Ungültige Adresse",
    invalidAmount: "❌ Ungültiger Betrag",
    insufficientFunds: "❌ Nicht genug Guthaben: <b>{balance}</b> MRPH",
    sending: "⏳ Sende...",
    historyTitle: "📜 <b>Verlauf</b>",
    historyEmpty: "Keine Transaktionen.",
    networkTitle: "🌍 <b>MRPH Global Netzwerk</b>",
    networkBody: "Chain: <code>{chainId}</code>\nBlock: <b>{height}</b>\nStatus: <b>{status}</b>",
    ibcTitle: "🚇 <b>IBC-Tunnel</b>",
    ibcBody: "IBC verbindet Cosmos-Chains.\n\n{channels}",
    ibcNoChannels: "📡 Keine IBC-Kanäle. Relayer in Entwicklung.",
    ibcChannels: "📡 Kanäle:\n{list}",
    languagePick: "🌐 Sprache wählen:",
    languageSet: "✅ Sprache: {lang}",
    helpText: "ℹ️ Überweisungen 24/7. Gebühr ~0.2 MRPH.",
    feeNote: "Gebühr ~0.2 MRPH",
    txIncoming: "📥 +{amount} MRPH",
    txOutgoing: "📤 −{amount} MRPH",
    cancelled: "Abgebrochen",
    mainMenu: "🏠 Menü",
    btnConfirm: "✅ Bestätigen",
    btnCancel: "❌ Abbrechen",
    btnCustom: "✏️ Eigener Betrag",
    btnQr: "📱 QR-Code",
    qrCaption: "📱 QR scannen — MRPH-Adresse",
    balanceWithHeight: "Block: <b>{height}</b> · 🟢 24/7",
    btnShare: "📤 Teilen",
    seedWarning: "🔐 <b>Seed (24 Wörter)</b>\n\n<code>{mnemonic}</code>\n\n⚠️ Auf Papier schreiben. Keplr · Tangem · Leap.",
    seedShow: "Ihre Seed-Phrase (einmal):",
    exportConfirm: "⚠️ Seed exportieren. Nur allein:",
    seedExported: "Seed oben. Offline speichern.",
    importSuccess: "✅ Importiert\n\n<code>{address}</code>",
    importInvalid: "❌ Ungültige Mnemonic",
    importUsage: "Format: /import word1 ... word24",
  },
  zh: {
    welcome:
      "🌐 <b>MRPH Global 钱包</b>\n\n主权网络 <b>mrphglobal-1</b>。\n\n⚡ <b>24/7</b> 转账 — 无国界。\n🌍 向全球任何 <code>mrph...</code> 地址发送 MRPH。\n\n创建钱包 👇",
    welcomeBack: "🌐 <b>MRPH Global 钱包</b>\n\n网络 24/7 运行 👇",
    noWallet: "请先创建钱包 👇",
    walletExists: "✅ 钱包已存在",
    walletCreated: "✅ <b>钱包已创建</b>\n\n📬 <code>{address}</code>",
    balanceTitle: "💰 <b>余额</b>",
    receiveTitle: "📬 <b>接收 MRPH</b>\n\n<code>{address}</code>",
    sendEnterAddress: "📤 <b>全球转账</b>\n\n输入 <code>mrph...</code> 地址",
    sendEnterAmount: "💸 收款人:\n<code>{address}</code>\n\n<b>MRPH</b> 数量:",
    sendConfirm: "✅ <b>确认</b>\n\n📤 {amount} MRPH → <code>{address}</code>",
    sendSuccess: "🎉 <b>已发送!</b>\n\n🔗 Tx: <code>{hash}</code>",
    sendError: "❌ 错误: {error}",
    invalidAddress: "❌ 地址无效",
    invalidAmount: "❌ 金额无效",
    insufficientFunds: "❌ 余额不足: <b>{balance}</b> MRPH",
    sending: "⏳ 发送中...",
    historyTitle: "📜 <b>历史</b>",
    historyEmpty: "暂无交易。",
    networkTitle: "🌍 <b>MRPH Global 网络</b>",
    networkBody: "链: <code>{chainId}</code>\n区块: <b>{height}</b>\n状态: <b>{status}</b>",
    ibcTitle: "🚇 <b>跨链隧道 (IBC)</b>",
    ibcBody: "IBC 连接 Cosmos 链。\n\n{channels}",
    ibcNoChannels: "📡 暂无 IBC 通道。中继器开发中。",
    ibcChannels: "📡 通道:\n{list}",
    languagePick: "🌐 选择语言:",
    languageSet: "✅ 语言: {lang}",
    helpText: "ℹ️ 24/7 转账。手续费 ~0.2 MRPH。",
    feeNote: "手续费 ~0.2 MRPH",
    txIncoming: "📥 +{amount} MRPH",
    txOutgoing: "📤 −{amount} MRPH",
    cancelled: "已取消",
    mainMenu: "🏠 主菜单",
    btnConfirm: "✅ 确认",
    btnCancel: "❌ 取消",
    btnCustom: "✏️ 自定义",
    btnQr: "📱 二维码",
    qrCaption: "📱 扫描二维码 — MRPH 地址",
    balanceWithHeight: "区块: <b>{height}</b> · 🟢 24/7",
    btnShare: "📤 分享",
    seedWarning: "🔐 <b>助记词 (24词)</b>\n\n<code>{mnemonic}</code>\n\n⚠️ 写在纸上。Keplr · Tangem · Leap。",
    seedShow: "助记词（仅显示一次）:",
    exportConfirm: "⚠️ 导出助记词。请确保私密:",
    seedExported: "助记词已在上方。请离线保存。",
    importSuccess: "✅ 已导入\n\n<code>{address}</code>",
    importInvalid: "❌ 无效助记词",
    importUsage: "格式: /import word1 ... word24",
  },
  ja: {
    welcome:
      "🌐 <b>MRPH Global ウォレット</b>\n\n主権ブロックチェーン <b>mrphglobal-1</b>\n\n⚡ <b>24時間365日</b> 送金 — 国境なし\n\n<a href=\"http://167.233.230.221:8080/landing.html\">🌐 公式サイト</a> · <a href=\"http://167.233.230.221:8080/ping/mrphglobal\">🔍 Explorer</a>\n\nウォレットを作成 👇",
    welcomeBack:
      "🌐 <b>MRPH Global</b>\n\nネットワーク稼働中 24/7\n<a href=\"http://167.233.230.221:8080/landing.html\">🌐 サイト</a> · <a href=\"http://167.233.230.221:8080/ping/mrphglobal\">🔍 Explorer</a>",
    noWallet: "まずウォレットを作成してください 👇",
    walletExists: "✅ ウォレットは既に存在します",
    walletCreated: "✅ <b>ウォレット作成完了</b>\n\n📬 <code>{address}</code>",
    balanceTitle: "💰 <b>残高</b>",
    receiveTitle: "📬 <b>MRPH を受取</b>\n\n<code>{address}</code>",
    sendEnterAddress: "📤 <b>グローバル送金</b>\n\n<code>mrph...</code> アドレスを入力",
    sendEnterAmount: "💸 宛先:\n<code>{address}</code>\n\n<b>MRPH</b> 数量:",
    sendConfirm: "✅ <b>確認</b>\n\n📤 {amount} MRPH → <code>{address}</code>",
    sendSuccess: "🎉 <b>送信完了</b>\n\n🔗 Tx: <code>{hash}</code>",
    sendError: "❌ エラー: {error}",
    invalidAddress: "❌ 無効なアドレス",
    invalidAmount: "❌ 無効な数量",
    insufficientFunds: "❌ 残高不足: <b>{balance}</b> MRPH",
    sending: "⏳ 送信中...",
    historyTitle: "📜 <b>履歴</b>",
    historyEmpty: "取引がありません",
    networkTitle: "🌍 <b>MRPH Global ネットワーク</b>",
    networkBody: "Chain: <code>{chainId}</code>\nブロック: <b>{height}</b>\n状態: <b>{status}</b>",
    ibcTitle: "🚇 <b>IBC トンネル</b>",
    ibcBody: "Cosmosチェーン間のトンネル。\n\n{channels}",
    ibcNoChannels: "📡 IBCチャネルなし。Relayer開発中。",
    ibcChannels: "📡 チャネル:\n{list}",
    languagePick: "🌐 言語を選択:",
    languageSet: "✅ 言語: {lang}",
    helpText: "ℹ️ 24/7送金 · 手数料 ~0.2 MRPH · /export /import",
    feeNote: "手数料 ~0.2 MRPH",
    txIncoming: "📥 +{amount} MRPH",
    txOutgoing: "📤 −{amount} MRPH",
    cancelled: "キャンセル",
    mainMenu: "🏠 メニュー",
    btnConfirm: "✅ 確認",
    btnCancel: "❌ キャンセル",
    btnCustom: "✏️ 任意",
    btnQr: "📱 QR",
    qrCaption: "📱 QR — MRPH 受取アドレス",
    balanceWithHeight: "ブロック: <b>{height}</b> · 🟢 24/7",
    btnShare: "📤 共有",
    seedWarning:
      "🔐 <b>シードフレーズ (24語)</b>\n\n<code>{mnemonic}</code>\n\n⚠️ 紙に書き保管。共有しないでください。\n\nKeplr · Tangem · Leap にインポート可能。",
    seedShow: "シードフレーズ（一度だけ表示）:",
    exportConfirm: "⚠️ シードをエクスポート。一人の時のみ:",
    seedExported: "上記のシードをオフライン保管してください。",
    importSuccess: "✅ インポート完了\n\n<code>{address}</code>",
    importInvalid: "❌ 無効なニーモニック",
    importUsage: "形式: /import word1 word2 ... word24",
  },
};

export function t(lang: Lang, key: LocaleKey, vars?: Record<string, string>): string {
  let text = locales[lang]?.[key] ?? locales.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replaceAll(`{${k}}`, v);
    }
  }
  return text;
}
