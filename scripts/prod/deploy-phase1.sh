#!/usr/bin/env bash
# MRPH Global — Phase 1: production node on Hetzner (24/7)
# Run ON THE SERVER as root:
#   cd /opt/mrphglobal && bash scripts/prod/deploy-phase1.sh
#
# Secrets (mnemonics) are written ONLY to:
#   /root/.mrphglobal-secrets/  (chmod 700)
# Copy offline once, then delete from server.
set -euo pipefail

GO_VERSION="${GO_VERSION:-1.25.10}"
CHAIN_SRC="${CHAIN_SRC:-/opt/mrphglobal}"
HOME_DIR="${MRPH_HOME:-/root/.mrphglobal}"
SECRETS_DIR="/root/.mrphglobal-secrets"
PASSFILE="${SECRETS_DIR}/keyring.pass"
MONIKER="${MRPH_MONIKER:-merphi-vpn-1}"
CHAIN_ID="mrphglobal-1"
BINARY="/usr/local/bin/mrphglobald"

export PATH="/usr/local/go/bin:/usr/local/bin:$PATH"

log() { echo "==> $*"; }

# --- 1. System packages ---
log "Installing system dependencies..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq build-essential curl jq chrony ufw ca-certificates git
systemctl enable --now chrony

# --- 2. Go ---
if ! command -v go &>/dev/null || ! go version | grep -q "go${GO_VERSION%.*}"; then
  log "Installing Go ${GO_VERSION}..."
  curl -fsSL "https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz" -o /tmp/go.tar.gz
  rm -rf /usr/local/go
  tar -C /usr/local -xzf /tmp/go.tar.gz
fi
export PATH="/usr/local/go/bin:$PATH"
log "Go: $(go version)"

# --- 3. Build binary ---
cd "$CHAIN_SRC"
log "Building mrphglobald from $CHAIN_SRC ..."

if [[ ! -f x/mrphglobal/types/tx.pb.go ]]; then
  log "Generating protobuf..."
  if command -v ignite &>/dev/null; then
    ignite generate proto-go --yes
    go mod tidy
  else
    curl -fsSL https://get.ignite.com/cli! | bash
    export PATH="/usr/local/bin:$PATH"
    ignite generate proto-go --yes
    go mod tidy
  fi
fi

# sonic fix (Go 1.26 safety; harmless on 1.25)
if ! grep -q 'github.com/bytedance/sonic =>' go.mod 2>/dev/null; then
  go mod edit -replace=github.com/bytedance/sonic=github.com/bytedance/sonic@v1.15.0
fi
go get github.com/bytedance/sonic@v1.15.0 2>/dev/null || true
go mod tidy

log "Compiling (may take several minutes)..."
go build -o "$BINARY" ./cmd/mrphglobald
log "Binary: $($BINARY version 2>&1 | head -1 || $BINARY --help 2>&1 | head -1)"

# --- 4. Init chain (production keys, file keyring) ---
mkdir -p "$SECRETS_DIR"
chmod 700 "$SECRETS_DIR"

if [[ ! -f "$PASSFILE" ]]; then
  openssl rand -base64 32 > "$PASSFILE"
  chmod 600 "$PASSFILE"
fi

if [[ ! -f "$HOME_DIR/config/genesis.json" ]]; then
  log "Initializing chain (NEW production keys — not dev/test)..."
  rm -rf "$HOME_DIR"
  "$BINARY" init "$MONIKER" --chain-id "$CHAIN_ID" --default-denom umrph --home "$HOME_DIR"

create_key() {
    local name=$1
    local outfile="$SECRETS_DIR/${name}-key.json"
    if [[ -f "$outfile" ]]; then
      log "Key $name already exists in secrets, skipping add"
      return
    fi
    local pass
    pass=$(cat "$PASSFILE")
    # file keyring: pipe encryption password twice (no --keyring-passphrase-file in SDK 0.53)
    { echo "$pass"; echo "$pass"; } | "$BINARY" keys add "$name" \
      --home "$HOME_DIR" \
      --keyring-backend file \
      --output json > "$outfile"
    chmod 600 "$outfile"
    log "Key created: $name (mnemonic in $outfile — backup offline, do not commit)"
  }

  keyring_args() {
    echo --home "$HOME_DIR" --keyring-backend file
  }

  with_keyring() {
    local pass
    pass=$(cat "$PASSFILE")
    { echo "$pass"; } | "$BINARY" "$@" --home "$HOME_DIR" --keyring-backend file
  }

  create_key treasury
  create_key validator

  TREASURY_ADDR=$(with_keyring keys show treasury -a)
  VALIDATOR_ADDR=$(with_keyring keys show validator -a)

  "$BINARY" genesis add-genesis-account "$TREASURY_ADDR" 1000000000000000umrph --home "$HOME_DIR"
  "$BINARY" genesis add-genesis-account "$VALIDATOR_ADDR" 100100000000umrph --home "$HOME_DIR"

  { pass=$(cat "$PASSFILE"); echo "$pass"; } | "$BINARY" genesis gentx validator 100000000000umrph \
    --chain-id "$CHAIN_ID" \
    --moniker "$MONIKER" \
    --home "$HOME_DIR" \
    --keyring-backend file

  "$BINARY" genesis collect-gentxs --home "$HOME_DIR"

  log "Patching genesis (umrph params)..."
  GENESIS="$HOME_DIR/config/genesis.json"
  tmp=$(mktemp)
  jq '
    .app_state.staking.params.bond_denom = "umrph" |
    .app_state.mint.params.mint_denom = "umrph" |
    .app_state.gov.params.min_deposit = [{"denom":"umrph","amount":"1000000"}] |
    .app_state.crisis.constant_fee = {"denom":"umrph","amount":"1000"} |
    .app_state.bank.denom_metadata = [{
      "description": "MRPH Global native token",
      "denom_units": [
        {"denom": "umrph", "exponent": 0},
        {"denom": "MRPH", "exponent": 6}
      ],
      "base": "umrph",
      "display": "MRPH",
      "name": "MRPH",
      "symbol": "MRPH"
    }]
  ' "$GENESIS" > "$tmp" && mv "$tmp" "$GENESIS"

  "$BINARY" genesis validate --home "$HOME_DIR"
else
  log "Genesis already exists at $HOME_DIR — skipping init"
fi

# --- 5. Node config (public RPC + LCD) ---
APP_TOML="$HOME_DIR/config/app.toml"
CONFIG_TOML="$HOME_DIR/config/config.toml"

sed -i 's/^minimum-gas-prices = .*/minimum-gas-prices = "0.001umrph"/' "$APP_TOML"
sed -i 's/^enable = false/enable = true/' "$APP_TOML" 2>/dev/null || true
sed -i 's|^address = "tcp://localhost:1317"|address = "tcp://0.0.0.0:1317"|' "$APP_TOML"
sed -i 's/^enabled-unsafe-cors = false/enabled-unsafe-cors = true/' "$APP_TOML" 2>/dev/null || true

# Enable API section if commented patterns differ — use grep-based patch
if grep -q '^\[api\]' "$APP_TOML"; then
  awk '
    /^\[api\]/ { in_api=1 }
    in_api && /^enable = / { sub(/false/, "true"); in_api=0 }
    { print }
  ' "$APP_TOML" > "${APP_TOML}.tmp" && mv "${APP_TOML}.tmp" "$APP_TOML"
fi

sed -i 's|^laddr = "tcp://127.0.0.1:26657"|laddr = "tcp://0.0.0.0:26657"|' "$CONFIG_TOML"
sed -i 's/^cors_allowed_origins = \[\]/cors_allowed_origins = ["*"]/' "$CONFIG_TOML" 2>/dev/null || true

# p2p external address (helps peers; single node ok)
PUBLIC_IP="${MRPH_PUBLIC_IP:-$(curl -fsSL -4 ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')}"
sed -i "s|^external_address = .*|external_address = \"${PUBLIC_IP}:26656\"|" "$CONFIG_TOML" 2>/dev/null || \
  echo "external_address = \"${PUBLIC_IP}:26656\"" >> "$CONFIG_TOML"

log "Public IP for p2p: $PUBLIC_IP"

# --- 6. systemd ---
log "Installing systemd service..."
cp "$CHAIN_SRC/scripts/prod/mrphglobald.service" /etc/systemd/system/mrphglobald.service
systemctl daemon-reload
systemctl enable mrphglobald
systemctl restart mrphglobald

# --- 7. Firewall ---
log "Configuring firewall..."
ufw allow 22/tcp comment 'SSH' 2>/dev/null || true
ufw allow 26656/tcp comment 'MRPH p2p' 2>/dev/null || true
ufw allow 26657/tcp comment 'MRPH RPC' 2>/dev/null || true
ufw allow 1317/tcp comment 'MRPH LCD' 2>/dev/null || true
ufw --force enable 2>/dev/null || true

# --- 8. Wait for blocks ---
log "Waiting for node to produce blocks..."
for i in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:26657/status" 2>/dev/null | jq -e '.result.sync_info.latest_block_height | tonumber > 0' >/dev/null 2>&1; then
  HEIGHT=$(curl -fsS "http://127.0.0.1:26657/status" | jq -r '.result.sync_info.latest_block_height')
    log "Node is running. Block height: $HEIGHT"
    break
  fi
  sleep 2
done

systemctl --no-pager status mrphglobald || true

echo ""
echo "=============================================="
echo " Phase 1 deploy complete"
echo "=============================================="
echo " RPC:  http://${PUBLIC_IP}:26657"
echo " LCD:  http://${PUBLIC_IP}:1317"
echo " Status: http://${PUBLIC_IP}:26657/status"
echo ""
echo " SECRETS (backup offline ONCE, then delete from server):"
echo "   ${SECRETS_DIR}/"
echo "   - treasury-key.json, validator-key.json (contain mnemonics)"
echo "   - keyring.pass (keyring passphrase)"
echo "   - Also backup: ${HOME_DIR}/config/priv_validator_key.json"
echo ""
echo " Verify from outside:"
echo "   curl -s http://${PUBLIC_IP}:26657/status | jq .result.sync_info.latest_block_height"
echo ""
echo " SECURITY TODO: put RPC/LCD behind nginx+TLS (not raw public ports)"
echo "=============================================="
