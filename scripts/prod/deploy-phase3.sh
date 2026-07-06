#!/usr/bin/env bash
# MRPH Global — Phase 3: Telegram wallet bot
# Run on Hetzner:
#   TELEGRAM_BOT_TOKEN=<token> bash /opt/mrphglobal/scripts/prod/deploy-phase3.sh
set -euo pipefail

CHAIN_SRC="${CHAIN_SRC:-/opt/mrphglobal}"
BOT_DIR="${BOT_DIR:-/opt/mrph-telegram-bot}"
ENV_FILE="${BOT_DIR}/.env"
SERVICE_NAME="mrph-telegram-bot"

log() { echo "==> $*"; }

# --- Node.js 20 ---
log "Installing Node.js 20..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq curl ca-certificates

if ! command -v node &>/dev/null || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt 18 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
fi
log "Node $(node -v)"

# --- Deploy bot files ---
log "Installing bot to ${BOT_DIR}..."
mkdir -p "$BOT_DIR"
rsync -a --delete \
  --exclude node_modules \
  --exclude dist \
  --exclude .env \
  --exclude data \
  "$CHAIN_SRC/telegram-bot/" "$BOT_DIR/"

cd "$BOT_DIR"
npm install
npm run build

# --- .env ---
if [[ ! -f "$ENV_FILE" ]]; then
  log "Creating ${ENV_FILE} from template..."
  cp "$BOT_DIR/.env.example" "$ENV_FILE"
  ENC_KEY="$(openssl rand -hex 32)"
  sed -i "s|^BOT_ENCRYPTION_KEY=.*|BOT_ENCRYPTION_KEY=${ENC_KEY}|" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
fi

if [[ -n "${TELEGRAM_BOT_TOKEN:-}" ]]; then
  sed -i "s|^TELEGRAM_BOT_TOKEN=.*|TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}|" "$ENV_FILE"
fi

if ! grep -qE '^TELEGRAM_BOT_TOKEN=.+$' "$ENV_FILE"; then
  echo ""
  echo "ERROR: TELEGRAM_BOT_TOKEN not set."
  echo "  1. Create bot via @BotFather"
  echo "  2. Run: TELEGRAM_BOT_TOKEN=<token> bash $0"
  echo "  or edit ${ENV_FILE}"
  exit 1
fi

mkdir -p "${BOT_DIR}/data"
chmod 700 "${BOT_DIR}/data"

# --- systemd ---
log "Installing systemd service..."
cp "$CHAIN_SRC/scripts/prod/mrph-telegram-bot.service" "/etc/systemd/system/${SERVICE_NAME}.service"
systemctl daemon-reload
systemctl enable "$SERVICE_NAME"
systemctl restart "$SERVICE_NAME"

sleep 2
if systemctl is-active --quiet "$SERVICE_NAME"; then
  log "Bot is running."
else
  journalctl -u "$SERVICE_NAME" -n 30 --no-pager
  exit 1
fi

echo ""
echo "=============================================="
echo " Phase 3 — Telegram bot deployed"
echo "=============================================="
echo " Service: systemctl status ${SERVICE_NAME}"
echo " Logs:    journalctl -u ${SERVICE_NAME} -f"
echo " Data:    ${BOT_DIR}/data/wallets.json"
echo " Config:  ${ENV_FILE}"
echo ""
echo " Commands: /start /createwallet /address /balance /send"
echo "=============================================="
