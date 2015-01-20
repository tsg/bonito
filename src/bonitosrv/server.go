package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/albrow/negroni-json-recovery"
	"github.com/codegangsta/negroni"
	"github.com/gorilla/mux"
	"github.com/unrolled/render"
)

type Timerange struct {
	From string
	To   string
}

// General purpose shortcut
type MapStr map[string]interface{}

func newNegroniServer(index_name string) *negroni.Negroni {

	r := render.New(render.Options{
		IndentJSON: true,
	})

	api := NewByDimensionApi(index_name)

	router := mux.NewRouter()
	router.HandleFunc("/api/ping", func(w http.ResponseWriter, req *http.Request) {
		r.JSON(w, 200, map[string]interface{}{
			"status":  "ok",
			"message": "pong",
		})
	}).Methods("GET")

	router.HandleFunc("/api/bydimension", func(w http.ResponseWriter, req *http.Request) {
		var request ByDimensionRequest
		body, err := ioutil.ReadAll(req.Body)
		if err != nil {
			panic(err)
		}
		if len(body) > 0 {
			err := json.Unmarshal(body, &request)
			if err != nil {
				r.JSON(w, 400, map[string]interface{}{
					"status":  "error",
					"message": fmt.Sprintf("Bad parameter: %s", err),
				})
				return
			}
		}

		resp, code, err := api.Query(&request)
		if err != nil {
			fmt.Printf("Error: %s\n", err)
			r.JSON(w, code, MapStr{
				"status":  "error",
				"message": fmt.Sprintf("Error: %s", err),
			})
		}

		r.JSON(w, code, resp)

	}).Methods("GET", "POST")

	n := negroni.New(negroni.NewLogger())
	n.Use(recovery.JSONRecovery(true))
	n.Use(negroni.NewStatic(http.Dir("../web")))
	n.UseHandler(router)

	return n
}

func main() {
	n := newNegroniServer("packetbeat-test")
	n.Run(":3001")
}
