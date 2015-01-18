package main

import (
	"time"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

var _ = Describe("ByDimension API", func() {
	Context("Simple requests with 2 services", func() {
		var es *Elasticsearch
		var index_name string
		var api *ByDimensionApi
		BeforeEach(func() {
			index_name = "packetbeat-test"
			es = NewElasticsearch()

			_, err := es.DeleteIndex(index_name)
			Expect(err).To(BeNil())
			es.Refresh(index_name)

			gen := TestTransactionsGenerator{
				From:       time.Now().Add(-10 * time.Millisecond),
				To:         time.Now().Add(-1 * time.Microsecond),
				NrServices: 2,
				NrHosts:    100,
				RtMin:      0,
				RtMax:      1000,
				CountMin:   1,
				CountMax:   10,
				ErrorProb:  0.1,
			}
			transactions := gen.generateTestTransactions()

			err = gen.insertInto(es, index_name, transactions)
			Expect(err).To(BeNil())

			api = NewByDimensionApi(index_name)

		})
		AfterEach(func() {
			_, err := es.DeleteIndex(index_name)
			Expect(err).To(BeNil())
			es.Refresh(index_name)
		})

		It("should get the two services when queried", func() {
			var req ByDimensionRequest
			req.Timerange.From = "now-1d"
			req.Timerange.To = "now"
			req.Metrics = []string{"volume"}

			resp, err := api.Query(&req)
			Expect(err).To(BeNil())
			Expect(len(resp.Primary)).To(Equal(2))
		})
	})
})
