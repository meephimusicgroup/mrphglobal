#!/usr/bin/env bash
# MRPH Global — полная установка (Ubuntu / WSL / Hetzner)
#
# Использование:
#   bash scripts/setup-dev.sh
#
# WSL: НЕ запускайте из /mnt/c/OneDrive — скопируйте проект в ~/mrphglobal:
#   bash scripts/bootstrap-wsl.sh
#
set -euo pipefail

# Go 1.26 + cosmos-sdk/sonic ломают сборку (GoMapIterator). По умолчанию — 1.25.x.
# Переопределить: GO_VERSION=1.26.4 bash scripts/setup-dev.sh (тогда обязателен sonic-fix ниже)
GO_VERSION="${GO_VERSION:-1.25.7}"
IGNITE_MIN_VERSION="29.8.0"
CHAIN_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> MRPH Global dev setup"
echo "    Directory: $CHAIN_DIR"

# --- Предупреждение: /mnt/c + OneDrive ---
if [[ "$CHAIN_DIR" == /mnt/* ]]; then
  echo ""
  echo "!! WARNING: проект на Windows-диске ($CHAIN_DIR)"
  echo "   Сборка из /mnt/c в WSL медленная; OneDrive может лочить файлы при компиляции."
  echo "   Рекомендуется: bash scripts/bootstrap-wsl.sh"
  echo "   (копия в ~/mrphglobal, вне OneDrive)"
  echo ""
  if [[ "${MRPH_IGNORE_MNT_WARNING:-}" != "1" ]]; then
    read -r -p "   Продолжить здесь? [y/N] " ans
    if [[ ! "$ans" =~ ^[Yy]$ ]]; then
      echo "Отменено. Запустите: bash scripts/bootstrap-wsl.sh"
      exit 1
    fi
  fi
fi

# --- Go ---
export PATH="/usr/local/go/bin:$HOME/go/bin:$PATH"

install_go() {
  echo "==> Installing Go ${GO_VERSION}..."
  curl -fsSL "https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz" -o /tmp/go.tar.gz
  sudo rm -rf /usr/local/go
  sudo tar -C /usr/local -xzf /tmp/go.tar.gz
  grep -q '/usr/local/go/bin' ~/.bashrc 2>/dev/null || \
    echo 'export PATH="/usr/local/go/bin:$HOME/go/bin:$PATH"' >> ~/.bashrc
}

if ! command -v go &>/dev/null; then
  install_go
else
  current_go=$(go version | grep -oE 'go[0-9]+\.[0-9]+(\.[0-9]+)?' | head -1 | tr -d 'go')
  major_minor=$(echo "$current_go" | cut -d. -f1,2)
  if [[ "$major_minor" == "1.26" ]] && [[ "${GO_VERSION}" != 1.26* ]]; then
    echo "!! Go $current_go detected — sonic/GoMapIterator risk with cosmos-sdk."
    echo "   Installing Go ${GO_VERSION} to /usr/local/go ..."
    install_go
  fi
fi
echo "    Go: $(go version)"

# --- Ignite CLI (>= v29.8.0) ---
if ! command -v ignite &>/dev/null; then
  echo "==> Installing Ignite CLI..."
  curl -fsSL https://get.ignite.com/cli! | bash
  export PATH="/usr/local/bin:$PATH"
fi

ignite_ver=$(ignite version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1 || echo "0.0.0")
echo "    Ignite: v${ignite_ver}"
if ! printf '%s\n%s\n' "$IGNITE_MIN_VERSION" "$ignite_ver" | sort -V -C 2>/dev/null; then
  echo "!! Ignite v${ignite_ver} < v${IGNITE_MIN_VERSION} — обновите: curl https://get.ignite.com/cli! | bash"
  exit 1
fi

# --- Scaffold chain if not present ---
needs_scaffold=false
if [[ ! -f "$CHAIN_DIR/go.mod" ]]; then
  needs_scaffold=true
elif ! grep -q 'module.*mrphglobal' "$CHAIN_DIR/go.mod" 2>/dev/null; then
  needs_scaffold=true
fi

if $needs_scaffold; then
  echo "==> Scaffolding chain (ignite scaffold chain mrphglobal --address-prefix mrph)..."
  WORK=$(mktemp -d)
  cd "$WORK"
  ignite scaffold chain mrphglobal --address-prefix mrph --yes --skip-git
  echo "==> Merging scaffold into project..."
  shopt -s dotglob nullglob
  for item in mrphglobal/*; do
    name=$(basename "$item")
    case "$name" in
      scripts|README.md|ARTIST_MEMO.md|.git) continue ;;
    esac
    if [[ -d "$item" ]]; then
      mkdir -p "$CHAIN_DIR/$name"
      cp -a "$item/." "$CHAIN_DIR/$name/"
    else
      cp -a "$item" "$CHAIN_DIR/$name"
    fi
  done
  shopt -u dotglob nullglob
  rm -rf "$WORK"
  echo "    Scaffold complete."
fi

cd "$CHAIN_DIR"

# --- Apply MRPH config ---
echo "==> Applying config.yml..."
cp scripts/config.yml config.yml

# --- Sonic / go.mod fix (обязательно при Go 1.26; безвредно при 1.25) ---
fix_sonic() {
  echo "==> Sonic compatibility (bytedance/sonic v1.15.0)..."
  if ! grep -q 'github.com/bytedance/sonic =>' go.mod 2>/dev/null; then
    go mod edit -replace=github.com/bytedance/sonic=github.com/bytedance/sonic@v1.15.0
  fi
  go get github.com/bytedance/sonic@v1.15.0
  go mod tidy
}

fix_sonic

# --- Proto (required before first build) ---
if [[ ! -f x/mrphglobal/types/tx.pb.go ]]; then
  echo "==> Generating protobuf files..."
  bash scripts/generate-proto.sh
fi

echo ""
echo "==> Done!"
echo "    Start chain:  ignite chain serve"
echo "    Chain ID:     mrphglobal-1"
echo "    Binary:       mrphglobald"
echo "    Denom:        umrph (MRPH)"
echo ""
echo "    Smoke test (второй терминал, после старта блоков):"
echo "    mrphglobald keys show treasury -a --keyring-backend test"
echo "    mrphglobald tx bank send treasury <addr> 1000000umrph --chain-id mrphglobal-1 --keyring-backend test -y"
