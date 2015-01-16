package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

var _ = Describe("Elasticsearch proxy", func() {
	var es *Elasticsearch
	index_name := fmt.Sprintf("packetbeat-test-%d", os.Getpid())
	BeforeEach(func() {
		es = NewElasticsearch()

		_, err := es.DeleteIndex(index_name)
		Expect(err).To(BeNil())
		es.Refresh(index_name)

	})
	AfterEach(func() {
		_, err := es.DeleteIndex(index_name)
		Expect(err).To(BeNil())
		es.Refresh(index_name)
	})

	Context("Insert and Refresh APIs", func() {

		It("Should insert successfuly", func() {
			resp, err := es.Insert(index_name, "trans", `{"test": 1}`, false)
			Expect(err).To(BeNil())
			Expect(resp).NotTo(BeNil())
		})

		It("Should return an error on bogus json", func() {
			resp, err := es.Insert(index_name, "trans", `{"test": 1`, false)
			Expect(err).NotTo(BeNil())
			Expect(resp).NotTo(BeNil())
		})

		It("Should refresh without error", func() {
			resp, err := es.Insert(index_name, "trans", `{"test": 1}`, true)
			defer resp.Body.Close()
			objresp, err := ioutil.ReadAll(resp.Body)
			fmt.Println(string(objresp))
			Expect(err).To(BeNil())
			Expect(resp).NotTo(BeNil())

		})

		It("Should get one document when searching", func() {
			resp, err := es.Insert(index_name, "trans", `{"test": 1}`, true)
			Expect(err).To(BeNil())
			Expect(resp).NotTo(BeNil())
			es.Refresh(index_name)

			resp, err = es.Search(index_name, "{}")
			Expect(resp).NotTo(BeNil())
			Expect(resp.StatusCode).To(Equal(200))
			defer resp.Body.Close()
			objresp, err := ioutil.ReadAll(resp.Body)
			Expect(err).To(BeNil())

			var esResult EsSearchResults
			err = json.Unmarshal(objresp, &esResult)
			Expect(err).To(BeNil())

			Expect(esResult.Hits.Total).To(Equal(1))

		})
	})
})
