#!/usr/bin/env bash
# MRPH Global — Phase 2: ping-pub self-hosted explorer
# Run on Hetzner: bash /opt/mrphglobal/scripts/prod/deploy-phase2.sh
set -euo pipefail

EXPLORER_DIR="${EXPLORER_DIR:-/opt/ping-explorer}"
CHAIN_SRC="${CHAIN_SRC:-/opt/mrphglobal}"
PUBLIC_IP="${MRPH_PUBLIC_IP:-167.233.230.221}"
EXPLORER_PORT="${EXPLORER_PORT:-8080}"
NGINX_SITE="/etc/nginx/sites-available/mrph-explorer"

log() { echo "==> $*"; }

# --- Node.js + yarn + nginx ---
log "Installing Node.js 20, yarn, nginx..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq curl git nginx

if ! command -v node &>/dev/null || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt 18 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
fi
npm install -g yarn 2>/dev/null || true
command -v yarn &>/dev/null || npm install -g yarn

log "Node $(node -v), yarn $(yarn -v 2>/dev/null || echo n/a)"

# --- Clone / update explorer ---
if [[ ! -d "$EXPLORER_DIR/.git" ]]; then
  log "Cloning ping-pub/explorer..."
  git clone --depth=1 https://github.com/ping-pub/explorer.git "$EXPLORER_DIR"
else
  log "Updating ping-pub/explorer..."
  git -C "$EXPLORER_DIR" pull --ff-only || true
fi

# --- MRPH chain config + logo ---
log "Installing MRPH chain config..."
mkdir -p "$EXPLORER_DIR/chains/mainnet" "$EXPLORER_DIR/public/logos"
cp "$CHAIN_SRC/scripts/prod/explorer/mrphglobal.json" "$EXPLORER_DIR/chains/mainnet/mrphglobal.json"
cp "$CHAIN_SRC/scripts/prod/explorer/mrphglobal.svg" "$EXPLORER_DIR/public/logos/mrphglobal.svg"
sed -i "s|167.233.230.221|${PUBLIC_IP}|g" "$EXPLORER_DIR/chains/mainnet/mrphglobal.json"

# Landing page (persists outside explorer dist)
log "Installing landing page..."
mkdir -p /opt/mrphglobal/public
cp "$CHAIN_SRC/scripts/prod/explorer/landing.html" /opt/mrphglobal/public/landing.html

# Only MRPH chain — remove demo chains (cosmos, osmosis, etc.)
log "Keeping only mrphglobal chain config..."
find "$EXPLORER_DIR/chains/mainnet" -maxdepth 1 -name '*.json' ! -name 'mrphglobal.json' -delete 2>/dev/null || true
rm -rf "$EXPLORER_DIR/chains/testnet" 2>/dev/null || true

# --- Build ---
log "Building explorer (yarn install + build, ~5–10 min)..."
cd "$EXPLORER_DIR"
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=4096}"
yarn install --frozen-lockfile 2>/dev/null || yarn install
yarn build

# Branding
if [[ -f "$EXPLORER_DIR/dist/index.html" ]]; then
  sed -i 's|<title>[^<]*</title>|<title>MRPH Global Explorer</title>|' "$EXPLORER_DIR/dist/index.html"
fi

# --- nginx (port 8080 — port 80 often used by Caddy/VPN on same host) ---
log "Configuring nginx on port ${EXPLORER_PORT}..."
sed "s|167.233.230.221|${PUBLIC_IP}|g; s|listen 8080|listen ${EXPLORER_PORT}|g" \
  "$CHAIN_SRC/scripts/prod/explorer/nginx-mrph-explorer.conf" > "$NGINX_SITE"

rm -f /etc/nginx/sites-enabled/default
ln -sf "$NGINX_SITE" /etc/nginx/sites-enabled/mrph-explorer
nginx -t
systemctl enable nginx
systemctl restart nginx

ufw allow "${EXPLORER_PORT}/tcp" comment 'MRPH Explorer' 2>/dev/null || true

log "Smoke tests..."
curl -fsS "http://127.0.0.1:1317/cosmos/base/tendermint/v1beta1/node_info" | head -c 80 && echo " ... LCD OK"
curl -fsSL "http://127.0.0.1:${EXPLORER_PORT}/" | head -c 80 && echo " ... Explorer HTML OK"

echo ""
echo "=============================================="
echo " Phase 2 — Explorer deployed"
echo "=============================================="
echo " URL:  http://${PUBLIC_IP}:${EXPLORER_PORT}/"
echo " Chain: mrphglobal (mrphglobal-1)"
echo " LCD:  http://${PUBLIC_IP}:1317"
echo " RPC:  http://${PUBLIC_IP}:26657"
echo ""
echo " Open in browser → select mrphglobal"
echo " Treasury: mrph1r3720pxx58qapagmrtldpey4c6hzqrqqvravx8"
echo "=============================================="
