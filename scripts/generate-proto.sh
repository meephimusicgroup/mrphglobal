#!/usr/bin/env bash
# Generate protobuf Go files (run on Linux/WSL after scaffold)
set -euo pipefail
cd "$(dirname "$0")/.."
export PATH="/usr/local/go/bin:$HOME/go/bin:$PATH"

if command -v ignite &>/dev/null; then
  echo "==> ignite generate proto-go"
  ignite generate proto-go --yes
else
  echo "==> buf generate (fallback)"
  go tool github.com/bufbuild/buf/cmd/buf dep update
  go tool github.com/bufbuild/buf/cmd/buf generate --template proto/buf.gen.gogo.yaml
  go tool github.com/bufbuild/buf/cmd/buf generate --template proto/buf.gen.sta.yaml
  go tool github.com/bufbuild/buf/cmd/buf generate --template proto/buf.gen.swagger.yaml
fi

go mod tidy
echo "==> Proto generation complete"
