#!/usr/bin/env bash
# Запуск ноды с логом в файл (удобно для livestream / отладки)
# Использование: bash scripts/run-serve.sh
set -euo pipefail

CHAIN_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$CHAIN_DIR"
export PATH="/usr/local/go/bin:$HOME/go/bin:$PATH"

LOG="${MRPH_SERVE_LOG:-$HOME/mrphglobal-serve.log}"

if [[ "$CHAIN_DIR" == /mnt/* ]]; then
  echo "ERROR: run from ~/mrphglobal (bash scripts/bootstrap-wsl.sh first)"
  exit 1
fi

if [[ ! -f x/mrphglobal/types/tx.pb.go ]]; then
  echo "==> Proto missing, running generate-proto.sh ..."
  bash scripts/generate-proto.sh
fi

echo "==> Log file: $LOG"
echo "==> Starting ignite chain serve (Ctrl+C to stop)"
echo "    Look for: 'Blockchain is running' and 'committed state height=N'"
echo ""

# tee: видно в терминале + пишется в файл для вставки в чат
ignite chain serve 2>&1 | tee -a "$LOG"
