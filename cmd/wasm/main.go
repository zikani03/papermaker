package main

import (
	"syscall/js"

	"github.com/zikani03/papermaker"
)

var done chan struct{}

func main() {
	js.Global().Set("GeneratePaper", js.FuncOf(papermaker.GeneratePaper))
	<-done
}
