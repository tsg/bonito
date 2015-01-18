package main

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/codegangsta/negroni"
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

		It("Should return not found for POST (meh)", func() {
			response := BonitosrvQuery(bonitosrv, "POST", "/api/ping", nil)

			Expect(response.Code).To(Equal(404))
		})
	})

	Context("Bydimension API", func() {
		BeforeEach(func() {
			err := InsertTestData("packetbeat-test")
			Expect(err).To(BeNil())
		})
		AfterEach(func() {
			DeleteTestData("packetbeat-test")
		})
		It("Should return success for empty body", func() {
			response := BonitosrvQuery(bonitosrv,
				"GET", "/api/bydimension", strings.NewReader(""))
			Expect(response.Code).To(Equal(200))
			var resp ResponseMessage
			err := json.Unmarshal(response.Body.Bytes(), &resp)
			Expect(err).To(BeNil())
			Expect(resp.Status).To(Equal("ok"))
		})

		It("Should return success for a valid empty JSON", func() {
			response := BonitosrvQuery(bonitosrv,
				"GET", "/api/bydimension", strings.NewReader("{}"))
			Expect(response.Code).To(Equal(200))
			var resp ResponseMessage
			err := json.Unmarshal(response.Body.Bytes(), &resp)
			Expect(err).To(BeNil())
			Expect(resp.Status).To(Equal("ok"))
		})

		It("Should return success for a valid JSON", func() {
			data := `{
			  "timerange": {
				"from": "now-1h",
				"to": "now"
			  },
			  "metrics": ["volume"]
			}`
			response := BonitosrvQuery(bonitosrv,
				"GET", "/api/bydimension", strings.NewReader(data))
			Expect(response.Code).To(Equal(200))
			var resp ResponseMessage
			err := json.Unmarshal(response.Body.Bytes(), &resp)
			Expect(err).To(BeNil())
			Expect(resp.Status).To(Equal("ok"))
		})

		It("Should return error for an invalid JSON", func() {
			response := BonitosrvQuery(bonitosrv,
				"GET", "/api/bydimension", strings.NewReader("{hello:1 //test}"))
			Expect(response.Code).To(Equal(400))
			var resp ResponseMessage
			err := json.Unmarshal(response.Body.Bytes(), &resp)
			Expect(err).To(BeNil())
			Expect(resp.Status).To(Equal("error"))
			Expect(resp.Message).To(HavePrefix("Bad parameter"))
		})
	})
})

func TestBonitosrv(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Bonitosrv suite")
}
