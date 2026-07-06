// Minimal Ignite scaffold runner for environments where ignite CLI cannot build (e.g. Windows).
// Uses official Ignite scaffolder package — same output as: ignite scaffold chain mrphglobal --address-prefix mrph
package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"github.com/ignite/cli/v29/ignite/pkg/cache"
	"github.com/ignite/cli/v29/ignite/services/scaffolder"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Fprintf(os.Stderr, "usage: scaffold <output-dir>\n")
		os.Exit(1)
	}

	outDir, err := filepath.Abs(os.Args[1])
	if err != nil {
		fatal(err)
	}

	ctx := context.Background()
	cacheDir, err := os.MkdirTemp("", "ignite-cache-*")
	if err != nil {
		fatal(err)
	}
	defer os.RemoveAll(cacheDir)

	cacheStorage, err := cache.NewStorage(filepath.Join(cacheDir, "cache"))
	if err != nil {
		fatal(err)
	}

	appDir, goModule, err := scaffolder.Init(
		ctx,
		outDir,
		"mrphglobal",
		"mrph",
		118,
		"stake",
		"proto",
		false,
		false,
		nil,
		nil,
	)
	if err != nil {
		fatal(err)
	}

	// Proto generation requires buf; ignite chain serve completes this on Linux.
	if err := scaffolder.PostScaffold(ctx, cacheStorage, appDir, "proto", goModule, true); err != nil {
		fatal(err)
	}

	fmt.Printf("Scaffolded chain at %s\n", appDir)
}

func fatal(err error) {
	fmt.Fprintf(os.Stderr, "error: %v\n", err)
	os.Exit(1)
}
