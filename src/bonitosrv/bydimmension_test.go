package main

import (
	"fmt"

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

			transactions := []TestTransaction{
				TestTransaction{
					Timestamp:    "2006-01-02T15:04:05.000000",
					Service:      "Service1",
					Host:         "Host0",
					Count:        2,
					Responsetime: 2000,
					Status:       "OK",
				},
				TestTransaction{
					Timestamp:    "2006-01-02T15:04:05.001000",
					Service:      "Service2",
					Host:         "Host3",
					Count:        4,
					Responsetime: 2000,
					Status:       "OK",
				},
				TestTransaction{
					Timestamp:    "2006-01-02T15:04:05.001000",
					Service:      "Service1",
					Host:         "Host2",
					Count:        3,
					Responsetime: 2100,
					Status:       "Error",
				},
			}

			err = transactionsInsertInto(es, index_name, transactions)
			Expect(err).To(BeNil())

			api = NewByDimensionApi(index_name)

		})
		AfterEach(func() {
			//_, err := es.DeleteIndex(index_name)
			//Expect(err).To(BeNil())
			es.Refresh(index_name)
		})

		It("should get", func() {
			var req ByDimensionRequest
			req.Timerange.From = "now-1d"
			req.Timerange.To = "now"
			req.Metrics = []string{"volume", "rt_avg", "rt_max"}

			resp, err := api.Query(&req)
			Expect(err).To(BeNil())
			Expect(len(resp.Primary)).To(Equal(2))

			fmt.Println("response: ", resp)

			services := map[string]PrimaryDimension{}
			for _, primary := range resp.Primary {
				services[primary.Name] = primary
			}

			By("correct volumes")
			Expect(services["service1"].Metrics["volume"]).To(Equal(float32(5)))
			Expect(services["service2"].Metrics["volume"]).To(Equal(float32(4)))

			By("correct response times max and avg")
			Expect(services["service1"].Metrics["rt_max"]).To(Equal(float32(2100)))
			Expect(services["service2"].Metrics["rt_max"]).To(Equal(float32(2000)))
			Expect(services["service1"].Metrics["rt_avg"]).To(Equal(float32(2050)))
			Expect(services["service2"].Metrics["rt_avg"]).To(Equal(float32(2000)))
		})
	})
})
