#!/usr/bin/env bash
# MRPH Global — деплой на Hetzner через Ignite Spaceship
# Использование: bash scripts/deploy-hetzner.sh root@<HETZNER_IP> [ssh_key_path]
#
# Перед деплоем локально: bash scripts/setup-dev.sh (Go 1.25.x + sonic-fix)
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 root@<HETZNER_IP> [~/.ssh/id_rsa]"
  exit 1
fi

REMOTE="$1"
SSH_KEY="${2:-$HOME/.ssh/id_rsa}"
CHAIN_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cd "$CHAIN_DIR"

if [[ ! -f config.yml ]]; then
  echo "Error: config.yml not found. Run scripts/setup-dev.sh first."
  exit 1
fi

if [[ ! -f go.mod ]]; then
  echo "Error: go.mod not found. Run scripts/setup-dev.sh first."
  exit 1
fi

if ! command -v ignite &>/dev/null; then
  echo "Error: ignite not found. Install Ignite CLI first (>= v29.8.0)."
  exit 1
fi

# Быстрая проверка sonic-replace (та же грабля, что GoMapIterator на 1.26)
if ! grep -q 'github.com/bytedance/sonic =>' go.mod; then
  echo "Warning: go.mod missing sonic replace — run: bash scripts/setup-dev.sh"
fi

if [[ "$CHAIN_DIR" == /mnt/* ]]; then
  echo "Warning: deploying from /mnt/c — лучше собирать из ~/mrphglobal (bootstrap-wsl.sh)"
fi

echo "==> Deploying MRPH Global to $REMOTE ..."
ignite spaceship deploy "$REMOTE" --key "$SSH_KEY"

echo ""
echo "==> Post-deploy checks (run on server via SSH):"
echo "  ssh $REMOTE"
echo "  mrphglobald status          # latest_block_height should grow"
echo "  sudo ufw allow 26656/tcp    # p2p (if using ufw)"
echo "  sudo apt install -y chrony  # time sync for consensus"
echo ""
echo "Backup validator keys on server:"
echo "  ~/.mrphglobal/config/priv_validator_key.json"
echo "  ~/.mrphglobal/config/node_key.json"
