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

echo "--> proto generation complete"
