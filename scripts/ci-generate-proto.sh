#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

export GOFLAGS="${GOFLAGS:--buildvcs=false}"

echo "--> buf dep update"
go tool github.com/bufbuild/buf/cmd/buf dep update

echo "--> buf generate (gogo)"
go tool github.com/bufbuild/buf/cmd/buf generate --template proto/buf.gen.gogo.yaml

echo "--> buf generate (openapi)"
go tool github.com/bufbuild/buf/cmd/buf generate --template proto/buf.gen.sta.yaml

if [[ ! -f x/mrphglobal/types/tx.pb.go ]]; then
  for dir in mrphglobal/x/mrphglobal/types proto/mrphglobal/x/mrphglobal/types; do
    if [[ -f "${dir}/tx.pb.go" ]]; then
      echo "--> moving generated protos from ${dir}"
      mkdir -p x/mrphglobal/types
      cp "${dir}"/*.pb.go x/mrphglobal/types/ 2>/dev/null || true
      cp "${dir}"/*.pb.gw.go x/mrphglobal/types/ 2>/dev/null || true
      break
    fi
  done
fi

if [[ ! -f x/mrphglobal/types/tx.pb.go ]]; then
  echo "ERROR: proto generation did not produce x/mrphglobal/types/tx.pb.go" >&2
  find . -name '*.pb.go' 2>/dev/null | head -20 || true
  exit 1
fi

echo "--> proto generation complete"
