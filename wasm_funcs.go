//go:build wasm

package papermaker

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"syscall/js"
)

type ErrorResponse struct {
	Err error
}

func GeneratePaper(this js.Value, args []js.Value) interface{} {
	argString := args[0].String()
	var paperRequest ExamPaper
	err := json.Unmarshal([]byte(argString), &paperRequest)
	if err != nil {
		return err.Error()
	}

	validationErrors := paperRequest.Validate()
	if validationErrors != nil {
		return validationErrors.ToJSON()
	}

	var buf bytes.Buffer
	err = paperRequest.WriteDocx(&buf)
	if err != nil {
		return err.Error()
	}

	return fmt.Sprintf("data:application/octet-stream;base64,%s", base64.StdEncoding.EncodeToString(buf.Bytes()))
}
