package main

import (
	"github.com/albrow/negroni-json-recovery"
	"github.com/codegangsta/negroni"
	"github.com/gorilla/mux"
	"github.com/unrolled/render"
	"net/http"
)

func main() {

	r := render.New(render.Options{
		IndentJSON: true,
	})

	router := mux.NewRouter()
	router.HandleFunc("/api/ping", func(w http.ResponseWriter, req *http.Request) {
		r.JSON(w, 200, map[string]interface{}{
			"status": "ok",
			"value":  "ping",
		})
	}).Methods("GET")

	n := negroni.New(negroni.NewLogger())
	n.Use(recovery.JSONRecovery(true))
	n.Use(negroni.NewStatic(http.Dir("../web")))
	n.UseHandler(router)
	n.Run(":3001")
}
