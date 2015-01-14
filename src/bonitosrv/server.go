package main

import (
	"encoding/json"
	"fmt"
	"github.com/albrow/negroni-json-recovery"
	"github.com/codegangsta/negroni"
	"github.com/gorilla/mux"
	"github.com/unrolled/render"
	"io/ioutil"
	"net/http"
)

type ByDimensionRequest struct {
	timerange           Timerange
	Primary_dimension   string
	Secondary_dimension string
	Metrics             []MetricDescription
}

type Timerange struct {
	From string
	To   string
}

type MetricDescription struct {
	Field          string
	Aggs           []string
	Custom_type    string
	Custom_options map[string]interface{}
}

func newNegroniServer() *negroni.Negroni {

	r := render.New(render.Options{
		IndentJSON: true,
	})

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

		r.JSON(w, 200, map[string]interface{}{
			"status":  "ok",
			"request": request,
		})

	}).Methods("GET", "POST")

	n := negroni.New(negroni.NewLogger())
	n.Use(recovery.JSONRecovery(true))
	n.Use(negroni.NewStatic(http.Dir("../web")))
	n.UseHandler(router)

	return n
}

func main() {
	n := newNegroniServer()
	n.Run(":3001")
}
