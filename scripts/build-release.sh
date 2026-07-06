#!/usr/bin/env bash
set -euo pipefail

APPNAME="${APPNAME:-mrphglobal}"
OUTDIR="${OUTDIR:-dist}"
VERSION="${VERSION:-dev}"
COMMIT="${COMMIT:-$(git rev-parse HEAD 2>/dev/null || echo unknown)}"

mkdir -p "$OUTDIR"

LDFLAGS="-s -w \
  -X github.com/cosmos/cosmos-sdk/version.Name=${APPNAME} \
  -X github.com/cosmos/cosmos-sdk/version.AppName=${APPNAME}d \
  -X github.com/cosmos/cosmos-sdk/version.Version=${VERSION} \
  -X github.com/cosmos/cosmos-sdk/version.Commit=${COMMIT}"

build_one() {
  local goos=$1 goarch=$2 suffix=$3
  local out="${OUTDIR}/${APPNAME}d-${VERSION}-${suffix}"
  echo "--> ${goos}/${goarch} -> ${out}"
  GOOS="$goos" GOARCH="$goarch" CGO_ENABLED=0 \
    go build -mod=readonly -trimpath -ldflags "$LDFLAGS" \
    -o "$out" "./cmd/${APPNAME}d"
  tar -czf "${out}.tar.gz" -C "$OUTDIR" "$(basename "$out")"
  rm -f "$out"
}

build_one linux amd64 linux-amd64
build_one linux arm64 linux-arm64
build_one darwin amd64 darwin-amd64
build_one darwin arm64 darwin-arm64

echo "--> artifacts in ${OUTDIR}/"
