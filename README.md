# MRPH Global — Sovereign Layer-1 Blockchain

[![GitHub](https://img.shields.io/badge/GitHub-meephimusicgroup%2Fmrphglobal-181717?style=flat-square&logo=github)](https://github.com/meephimusicgroup/mrphglobal)
[![Live Network](https://img.shields.io/badge/network-live-00d4aa?style=flat-square)](http://167.233.230.221:8080/landing.html)
[![Explorer](https://img.shields.io/badge/explorer-mrphglobal--1-6c63ff?style=flat-square)](http://167.233.230.221:8080/ping/mrphglobal)
[![Telegram](https://img.shields.io/badge/bot-@mrphglobal__bot-26A5E4?style=flat-square&logo=telegram)](https://t.me/mrphglobal_bot)

**Live:** [Website](http://167.233.230.221:8080/landing.html) · [Explorer](http://167.233.230.221:8080/ping/mrphglobal) · RPC `:26657` · LCD `:1317`

| Docs | |
|---|---|
| [Production node](docs/PRODUCTION.md) | [Wallets & Tangem](docs/WALLETS.md) |
| [Explorer](docs/EXPLORER.md) | [Telegram bot](docs/TELEGRAM_BOT.md) |
| [IBC / USDT / TON roadmap](docs/BRIDGE.md) | [Chain registry](chain-registry/mrphglobal/) |

---

# MRPH Global — суверенный Layer-1 блокчейн

Независимая Cosmos SDK сеть. Нативный токен **MRPH** (`umrph`, 6 знаков). Chain ID: `mrphglobal-1`. Префикс адресов: `mrph`.

> **Важно:** Merphicoin на TON — отдельный продукт. С этой сетью он не связан.

## Параметры сети

| Параметр | Значение |
|---|---|
| Chain ID | `mrphglobal-1` |
| Бинарник | `mrphglobald` |
| Базовый деном | `umrph` (1 MRPH = 1 000 000 umrph) |
| Общий сапплай (genesis) | 1 000 000 000 MRPH |
| Валидаторов | 1 (оператор на Hetzner) |

## Требования

- **Linux**, **macOS** или **WSL** (Windows без WSL не поддерживается Ignite)
- **Go 1.25.x** (по умолчанию в `setup-dev.sh`; Go 1.26 требует sonic-fix — скрипт делает его автоматически)
- Ignite CLI **≥ v29.8.0**

## Быстрый старт (локально, WSL)

### 0. Скопировать проект из OneDrive (обязательно для WSL)

**Не собирайте из `/mnt/c/...`** — медленно и OneDrive лочит файлы при компиляции.

```bash
# внутри Ubuntu WSL, один раз:
bash /mnt/c/Users/marte/OneDrive/Desktop/mrphglobal/scripts/bootstrap-wsl.sh
cd ~/mrphglobal
```

### 1. Установка окружения

```bash
bash scripts/setup-dev.sh
source ~/.bashrc
```

Скрипт: Go **1.25.7**, Ignite ≥29.8, sonic `v1.15.0` + `go mod tidy`, scaffold (если нужно), `config.yml`, proto.

### 2. Запуск ноды (разработка)

```bash
export PATH="$HOME/go/bin:$PATH"
ignite chain serve
```

Ожидаемое поведение: сборка `mrphglobald`, RPC на `:26657`, REST API на `:1317`, блоки идут.

Проверка в другом терминале:

```bash
mrphglobald status
mrphglobald q bank balances $(mrphglobald keys show treasury -a)
```

### 3. Перезапуск локальной ноды

```bash
# Остановить: Ctrl+C в терминале с ignite chain serve
ignite chain serve --reset-once   # сброс данных и новый genesis
# или
ignite chain serve              # обычный перезапуск
```

## Деплой на Hetzner

### Продакшн 24/7 (Фаза 1) — рекомендуется

Полная инструкция: **[docs/PRODUCTION.md](docs/PRODUCTION.md)**

На сервере (Ubuntu):

```bash
# Скопировать репозиторий в /opt/mrphglobal, затем:
cd /opt/mrphglobal
bash scripts/prod/deploy-phase1.sh
```

Скрипт: Go 1.25.10, Ignite proto, сборка `mrphglobald`, **новые** prod-ключи (`file` keyring), genesis, systemd, ufw, chrony.

**Живые эндпоинты:**

- RPC: `http://167.233.230.221:26657`
- LCD: `http://167.233.230.221:1317`

Мнемоники — только в `/root/.mrphglobal-secrets/` на сервере; скопировать оффлайн один раз, не коммитить.

### Telegram wallet bot (Фаза 3)

Инструкция: **[docs/TELEGRAM_BOT.md](docs/TELEGRAM_BOT.md)**

```bash
TELEGRAM_BOT_TOKEN=<токен_от_BotFather> bash scripts/prod/deploy-phase3.sh
```

Команды бота: `/createwallet`, `/address`, `/balance`, `/send`.

### Быстрый деплой через Spaceship (dev-стиль)

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential curl chrony
sudo systemctl enable --now chrony
```

Файрвол (пример с ufw):

```bash
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 26656/tcp   # p2p — обязательно
# Опционально (лучше за reverse-proxy):
# sudo ufw allow 26657/tcp   # RPC
# sudo ufw allow 1317/tcp    # REST
sudo ufw enable
```

### Деплой через Spaceship

На машине разработчика (где собран проект):

```bash
bash scripts/deploy-hetzner.sh root@<HETZNER_IP> ~/.ssh/id_rsa
```

Или вручную:

```bash
ignite spaceship deploy root@<HETZNER_IP> --key ~/.ssh/id_rsa
```

### Проверка на сервере

```bash
ssh root@<HETZNER_IP>
mrphglobald status
# latest_block_height должен расти
```

### Перезапуск ноды на сервере

```bash
# через spaceship (с машины оператора)
ignite spaceship deploy root@<HETZNER_IP> --key ~/.ssh/id_rsa

# или на сервере — найти процесс и перезапустить по логам spaceship
# логи обычно в ~/log/ или рядом с spaceship.pid
```

**Бэкап ключей валидатора** (критично, никому не передавать):

- `~/.mrphglobal/config/priv_validator_key.json`
- `~/.mrphglobal/config/node_key.json`

## Кошельки

### Создать адрес (оператор)

```bash
mrphglobald keys add artist-wallet
mrphglobald keys show artist-wallet -a
```

Список ключей:

```bash
mrphglobald keys list
```

### Отправить MRPH артисту (с treasury)

```bash
mrphglobald tx bank send treasury <АДРЕС_АРТИСТА> 1000000umrph \
  --chain-id mrphglobal-1 \
  --keyring-backend test \
  -y
```

Проверить баланс:

```bash
mrphglobald q bank balances <АДРЕС_АРТИСТА>
```

### Keplr (для артистов)

Параметры кастомной сети:

| Поле | Значение |
|---|---|
| Chain ID | `mrphglobal-1` |
| Denom | `umrph` |
| Decimals | 6 |
| Display denom | MRPH |
| Bech32 prefix | `mrph` |
| RPC | `http://<HETZNER_IP>:26657` |
| REST | `http://<HETZNER_IP>:1317` |

## Windows (разработка)

Ignite CLI **не работает нативно на Windows** — нужен **WSL** (Ubuntu):

```powershell
# PowerShell от администратора (один раз):
wsl --install -d Ubuntu
# перезагрузка, затем в Ubuntu:
bash /mnt/c/Users/marte/OneDrive/Desktop/mrphglobal/scripts/bootstrap-wsl.sh
cd ~/mrphglobal
ignite chain serve
```

Или: `scripts/setup-wsl.ps1` — проверит WSL и запустит bootstrap.

**Не используйте** `cd /mnt/c/... && ignite chain serve` как рабочий путь — только bootstrap в `~/mrphglobal`.

## Типичные проблемы

| Симптом | Решение |
|---|---|
| `command not found: mrphglobald` | `export PATH="$HOME/go/bin:$PATH"` |
| `GoMapIterator` / sonic при сборке | `bash scripts/setup-dev.sh` (Go 1.25 + sonic v1.15.0) |
| Медленная/битая сборка в WSL | `bash scripts/bootstrap-wsl.sh` → `~/mrphglobal` |
| Ошибки сборки Go | Go 1.25.x, не 1.26 без sonic-fix |
| Блоки не растут на сервере | `chrony`, проверьте процесс и логи |
| Консенсус встал после рестарта | Перезапустите ноду; при 1 валидаторе сеть зависит от этого процесса |

## Структура репозитория

```
mrphglobal/
├── config.yml           # конфиг Ignite (genesis, аккаунты, валидатор)
├── scripts/
│   ├── setup-dev.sh     # установка + scaffold
│   ├── deploy-hetzner.sh
│   └── config.yml       # шаблон конфига MRPH
├── ARTIST_MEMO.md       # памятка для артиста
└── README.md
```

## Ссылки

- [Ignite CLI](https://docs.ignite.com)
- [Cosmos SDK](https://docs.cosmos.network)
