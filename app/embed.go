package app

import "embed"

//go:embed dist
var StaticFS embed.FS
