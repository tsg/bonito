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
			err := es.Insert("packetbeat-test", "trans", `{"test": 1}`)
			Expect(err).To(BeNil())
		})

		It("Should return an error on bogus json", func() {
			err := es.Insert("packetbeat-test", "trans", `{"test": 1`)
			Expect(err).NotTo(BeNil())
		})
	})
})
