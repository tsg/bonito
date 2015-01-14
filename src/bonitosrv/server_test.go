package main

import (
	"github.com/codegangsta/negroni"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
)

type ResponseMessage struct {
	Status  string
	Message string
}

func BonitosrvQuery(n *negroni.Negroni, method string,
	url string, data io.Reader) *httptest.ResponseRecorder {

	request, _ := http.NewRequest(method, url, data)
	response := httptest.NewRecorder()
	n.ServeHTTP(response, request)
	return response
}

var _ = Describe("Public Bonitosrv Api", func() {
	var bonitosrv *negroni.Negroni

	BeforeEach(func() {
		bonitosrv = newNegroniServer()
	})

	Context("Ping API", func() {
		It("Should return pong when pinged", func() {
			response := BonitosrvQuery(bonitosrv, "GET", "/api/ping", nil)

			Expect(response.Code).To(Equal(200))

			var resp ResponseMessage
			err := json.Unmarshal(response.Body.Bytes(), &resp)
			Expect(err).To(BeNil())
			Expect(resp.Status).To(Equal("ok"))
			Expect(resp.Message).To(Equal("pong"))
		})
	})
})

func TestBonitosrv(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Bonitosrv suite")
}
