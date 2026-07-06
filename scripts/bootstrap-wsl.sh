#!/usr/bin/env bash
# Копирует проект из OneDrive (/mnt/c) в ~/mrphglobal и запускает setup.
# Использование (внутри Ubuntu WSL):
#   bash /mnt/c/Users/marte/OneDrive/Desktop/mrphglobal/scripts/bootstrap-wsl.sh
#
set -euo pipefail

DEFAULT_SRC="/mnt/c/Users/marte/OneDrive/Desktop/mrphglobal"
SRC="${1:-$DEFAULT_SRC}"
DEST="${MRPH_WSL_HOME:-$HOME/mrphglobal}"

if [[ ! -d "$SRC" ]]; then
  echo "Error: source not found: $SRC"
  echo "Usage: $0 [/mnt/c/path/to/mrphglobal]"
  exit 1
fi

echo "==> Copying MRPH Global"
echo "    From: $SRC"
echo "    To:   $DEST"
echo "    (рабочая копия вне OneDrive — быстрая сборка, без синка)"
echo ""

mkdir -p "$(dirname "$DEST")"
if [[ -d "$DEST" ]]; then
  read -r -p "    $DEST already exists. Overwrite? [y/N] " ans
  if [[ ! "$ans" =~ ^[Yy]$ ]]; then
    echo "Using existing $DEST"
  else
    rm -rf "$DEST"
    cp -a "$SRC" "$DEST"
  fi
else
  cp -a "$SRC" "$DEST"
fi

cd "$DEST"
echo ""
echo "==> Running setup-dev.sh in $DEST ..."
bash scripts/setup-dev.sh

echo ""
echo "==> Next:"
echo "    cd $DEST"
echo "    ignite chain serve"
