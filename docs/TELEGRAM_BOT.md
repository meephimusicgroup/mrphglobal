# MRPH Global — Telegram wallet bot (Фаза 3)

Бот для кошельков MRPH в сети `mrphglobal-1`. Один кошелёк на Telegram-пользователя.

## Команды бота (v2)

| Действие | Описание |
|---|---|
| Меню-кнопки | Баланс, Отправить, Получить, История, Сеть, IBC |
| `/language` | 6 языков: RU, EN, ES, UK, DE, ZH |
| Отправка | Пошаговый wizard + быстрые суммы (0.1 / 1 / 5 MRPH) |
| 🚇 IBC | Статус межсетевого «туннеля» (relayer — в разработке) |

Классические команды тоже работают: `/createwallet`, `/balance`, `/send`.

## Безопасность

- Мнемоники шифруются **AES-256-GCM** ключом `BOT_ENCRYPTION_KEY`
- Файл кошельков: `/opt/mrph-telegram-bot/data/wallets.json` (chmod 600)
- Бот **не экспортирует** мнемонику в чат — только адрес и операции
- Токен бота только в `.env`, не в git

> Для production-кошельков с крупными суммами лучше Keplr + оффлайн-бэкап мнемоники. Бот — удобный MVP для артистов.

## Подготовка токена

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. `/newbot` → имя и username
3. Скопируйте токен вида `123456:ABC...`

## Деплой на Hetzner

На сервере (рядом с нодой, LCD на `127.0.0.1:1317`):

```bash
cd /opt/mrphglobal
git pull   # или scp обновлённых файлов

TELEGRAM_BOT_TOKEN=<ваш_токен> bash scripts/prod/deploy-phase3.sh
```

Повторный деплой (обновление кода):

```bash
bash /opt/mrphglobal/scripts/prod/deploy-phase3.sh
```

## Управление

```bash
systemctl status mrph-telegram-bot
systemctl restart mrph-telegram-bot
journalctl -u mrph-telegram-bot -f
```

## Конфигурация

Файл: `/opt/mrph-telegram-bot/.env`

| Переменная | Значение по умолчанию |
|---|---|
| `CHAIN_ID` | `mrphglobal-1` |
| `LCD_URL` | `http://127.0.0.1:1317` |
| `RPC_URL` | `http://127.0.0.1:26657` |
| `DATA_DIR` | `/opt/mrph-telegram-bot/data` |

При первом деплое `BOT_ENCRYPTION_KEY` генерируется автоматически. **Сохраните бэкап `.env`** — без ключа кошельки не расшифровать.

## Пополнение кошелька артиста

С treasury (на сервере):

```bash
export MRPH_PASS="$(cat /root/.mrphglobal-secrets/keyring.pass)"
{ echo "$MRPH_PASS"; } | mrphglobald tx bank send treasury <АДРЕС_ИЗ_БОТА> 1000000umrph \
  --chain-id mrphglobal-1 \
  --home /root/.mrphglobal \
  --keyring-backend file \
  --fees 200umrph -y
```

Проверка в боте: `/balance`

## Локальная разработка

```bash
cd telegram-bot
cp .env.example .env
# заполнить TELEGRAM_BOT_TOKEN и BOT_ENCRYPTION_KEY (openssl rand -hex 32)
npm install
npm run dev
```
