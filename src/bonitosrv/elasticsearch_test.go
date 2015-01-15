package main

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

var _ = Describe("Elasticsearch proxy", func() {
	var es *Elasticsearch
	BeforeEach(func() {
		es = NewElasticsearch()
	})

	Context("Insert and Refresh APIs", func() {
		It("Should insert successfuly", func() {
			resp, err := es.Insert("packetbeat-test", "trans", `{"test": 1}`)
			Expect(err).To(BeNil())
			Expect(resp).NotTo(BeNil())
		})

		It("Should return an error on bogus json", func() {
			resp, err := es.Insert("packetbeat-test", "trans", `{"test": 1`)
			Expect(err).NotTo(BeNil())
			Expect(resp).NotTo(BeNil())
		})

		It("Should refresh without error", func() {
			resp, err := es.Refresh("packetbeat-test")
			Expect(err).To(BeNil())
			Expect(resp).NotTo(BeNil())
		})
	})
})
