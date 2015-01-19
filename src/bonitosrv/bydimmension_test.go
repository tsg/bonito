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
					Service:      "service1",
					Host:         "Host0",
					Count:        2,
					Responsetime: 2000,
					Status:       "ok",
				},
				TestTransaction{
					Timestamp:    "2006-01-02T15:04:05.001000",
					Service:      "service2",
					Host:         "Host3",
					Count:        4,
					Responsetime: 2000,
					Status:       "ok",
				},
				TestTransaction{
					Timestamp:    "2006-01-02T15:04:05.001000",
					Service:      "service1",
					Host:         "host2",
					Count:        3,
					Responsetime: 2100,
					Status:       "error",
				},
			}

			err = transactionsInsertInto(es, index_name, transactions)
			Expect(err).To(BeNil())

			api = NewByDimensionApi(index_name)

		})
		AfterEach(func() {
			_, err := es.DeleteIndex(index_name)
			Expect(err).To(BeNil())
			es.Refresh(index_name)
		})

		It("should get", func() {
			var req ByDimensionRequest
			req.Timerange.From = "now-1d"
			req.Timerange.To = "now"
			req.Metrics = []string{"volume", "rt_avg", "rt_max",
				"rt_percentiles", "secondary_count", "errors_rate"}
			req.Config.Percentiles = []float32{50, 99.995}

			resp, err := api.Query(&req)
			Expect(err).To(BeNil())
			Expect(len(resp.Primary)).To(Equal(2))

			fmt.Println("response: ", resp)

			services := map[string]PrimaryDimension{}
			for _, primary := range resp.Primary {
				services[primary.Name] = primary
			}

			By("correct volumes")
			Expect(services["service1"].Metrics["volume"]).To(BeNumerically("~", 5))
			Expect(services["service2"].Metrics["volume"]).To(BeNumerically("~", 4))

			By("correct response times max and avg")
			Expect(services["service1"].Metrics["rt_max"]).To(BeNumerically("~", 2100))
			Expect(services["service2"].Metrics["rt_max"]).To(BeNumerically("~", 2000))
			Expect(services["service1"].Metrics["rt_avg"]).To(BeNumerically("~", 2050))
			Expect(services["service2"].Metrics["rt_avg"]).To(BeNumerically("~", 2000))

			By("correct percentiles")
			Expect(services["service1"].Metrics["rt_50.0p"]).To(BeNumerically("~", 2050))
			Expect(services["service2"].Metrics["rt_50.0p"]).To(BeNumerically("~", 2000))
			Expect(services["service2"].Metrics["rt_99.995p"]).To(BeNumerically("~", 2000))

			By("correct hosts values")
			Expect(services["service1"].Metrics["secondary_count"]).To(BeNumerically("~", 2))
			Expect(services["service2"].Metrics["secondary_count"]).To(BeNumerically("~", 1))

			By("correct errors rate")
			Expect(services["service1"].Metrics["errors_rate"]).To(BeNumerically("~",
				0.6, 1e-6))
			Expect(services["service2"].Metrics["errors_rate"]).To(BeNumerically("~", 0))
		})
	})
})
