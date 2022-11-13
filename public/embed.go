package public

import "embed"

//go:embed css js img index.html main.wasm manifest.json .htaccess
var StaticFS embed.FS
