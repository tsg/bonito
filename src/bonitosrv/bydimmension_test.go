package main

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"bonitosrv/elasticsearch"
	"bonitosrv/testdata"
)

var _ = Describe("ByDimension API", func() {
	Context("Simple requests with 2 services", func() {
		var es *elasticsearch.Elasticsearch
		var index_name string
		var api *ByDimensionApi
		BeforeEach(func() {
			index_name = "packetbeat-test"
			es = elasticsearch.NewElasticsearch()

			_, err := es.DeleteIndex(index_name)
			Expect(err).To(BeNil())
			es.Refresh(index_name)

			transactions := []testdata.TestTransaction{
				testdata.TestTransaction{
					Timestamp:    "2006-01-02T15:04:05.000000",
					Service:      "service1",
					Host:         "Host0",
					Count:        2,
					Responsetime: 2000,
					Status:       "ok",
				},
				testdata.TestTransaction{
					Timestamp:    "2006-01-02T15:04:05.001000",
					Service:      "service2",
					Host:         "Host3",
					Count:        4,
					Responsetime: 2000,
					Status:       "ok",
				},
				testdata.TestTransaction{
					Timestamp:    "2006-01-02T15:04:05.001000",
					Service:      "service1",
					Host:         "host2",
					Count:        3,
					Responsetime: 2100,
					Status:       "error",
				},
			}

			err = testdata.InsertInto(es, index_name, transactions)
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

			resp, code, err := api.Query(&req)
			Expect(err).To(BeNil())
			Expect(code).To(Equal(200))
			Expect(len(resp.Primary)).To(Equal(2))

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

		It("should get error rate if only that is requested", func() {
			var req ByDimensionRequest
			req.Metrics = []string{"errors_rate"}

			resp, _, err := api.Query(&req)
			Expect(err).To(BeNil())
			Expect(len(resp.Primary)).To(Equal(2))

			services := map[string]PrimaryDimension{}
			for _, primary := range resp.Primary {
				services[primary.Name] = primary
			}

			Expect(services["service1"].Metrics["errors_rate"]).To(BeNumerically("~",
				0.6, 1e-6))
			Expect(services["service2"].Metrics["errors_rate"]).To(BeNumerically("~", 0))
		})

		It("should get 1.0 error rates when nothing is successful", func() {
			var req ByDimensionRequest
			req.Metrics = []string{"errors_rate"}
			req.Config.Status_value_ok = "nothing"

			resp, _, err := api.Query(&req)
			Expect(err).To(BeNil())
			Expect(len(resp.Primary)).To(Equal(2))

			services := map[string]PrimaryDimension{}
			for _, primary := range resp.Primary {
				services[primary.Name] = primary
			}

			Expect(services["service1"].Metrics["errors_rate"]).To(BeNumerically("~",
				1.0, 1e-6))
			Expect(services["service2"].Metrics["errors_rate"]).To(BeNumerically("~",
				1.0))
		})

		It("should return error when the metric is not defined", func() {
			var req ByDimensionRequest
			req.Metrics = []string{"something"}
			_, code, err := api.Query(&req)
			Expect(err).NotTo(BeNil())
			Expect(code).To(Equal(400))
		})
	})

	Context("On an inexisting index", func() {
		It("should return an error", func() {
			api := NewByDimensionApi("no-such-index")
			var req ByDimensionRequest
			req.Metrics = []string{"volume"}

			_, code, err := api.Query(&req)
			Expect(err).NotTo(BeNil())
			Expect(code).To(Equal(500))
		})
	})
})
