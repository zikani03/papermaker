package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"

	"github.com/zikani03/papermaker"
)

func main() {
	envErr := godotenv.Load(".env")
	if envErr != nil {
		fmt.Printf("Please configure via a .env file")
		return
	}

	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		// AllowedOrigins:   []string{"https://foo.com"}, // Use this to allow specific origin hosts
		AllowedOrigins: []string{"https://*", "http://*", "https://labs.zikani.me"},
		// AllowOriginFunc:  func(r *http.Request, origin string) bool { return true },
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))

	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)

	r.Get("/healthcheck", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("X-Healthcheck", "ok")
		w.Write([]byte("Healthy :)"))
	})

	r.Post("/api/v1/generate", func(w http.ResponseWriter, r *http.Request) {
		requestBody, err := ioutil.ReadAll(r.Body)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		var paperRequest papermaker.ExamPaper
		err = json.Unmarshal([]byte(requestBody), &paperRequest)
		if err != nil {
			http.Error(w, "failed to generate pdf", http.StatusInternalServerError)
			return
		}

		validationErrors := paperRequest.Validate()
		if validationErrors != nil {
			http.Error(w, validationErrors.ToJSON(), http.StatusBadRequest)
			return
		}

		var buf bytes.Buffer
		if err := paperRequest.WriteDocx(&buf); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		base64Encoded := base64.StdEncoding.EncodeToString(buf.Bytes())
		dataURL := fmt.Sprintf("data:application/octet-stream;base64,%s", base64Encoded)
		w.Write([]byte(dataURL))
	})

	// FileServer(r, "/", http.FS(public.StaticFS))

	FileServer(r, "/", http.Dir("./public"))
	log.Println("Server started")

	address := os.Getenv("PAPERMAKER_ADDRESS")
	if address == "" {
		address = "localhost:7765"
	}

	if err := http.ListenAndServe(address, r); err != nil {
		log.Fatal(err)
	}
}

// FileServer conveniently sets up a http.FileServer handler to serve
// static files from a http.FileSystem.
func FileServer(r chi.Router, path string, root http.FileSystem) {
	if strings.ContainsAny(path, "{}*") {
		panic("FileServer does not permit any URL parameters.")
	}

	if path != "/" && path[len(path)-1] != '/' {
		r.Get(path, http.RedirectHandler(path+"/", 301).ServeHTTP)
		path += "/"
	}
	path += "*"

	r.Get(path, func(w http.ResponseWriter, r *http.Request) {
		rctx := chi.RouteContext(r.Context())
		pathPrefix := strings.TrimSuffix(rctx.RoutePattern(), "/*")
		fs := http.StripPrefix(pathPrefix, http.FileServer(root))
		fs.ServeHTTP(w, r)
	})
}
