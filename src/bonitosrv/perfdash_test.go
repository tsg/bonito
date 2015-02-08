package main

import (
	"bonitosrv/metrics"
	"encoding/json"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

var _ = Describe("PerfDashApi", func() {

	Context("Query without ES", func() {
		var api *PerfDashApi
		BeforeEach(func() {
			api = NewPerfDashApi("")
		})

		Context("buildAggs", func() {
			It("should create a sum aggregation for a volume metric", func() {
				var req = PerfDashRequest{
					Metrics: []ConfigRaw{
						ConfigRaw{
							Name: "volume_avg",
							Type: "volume",
							Config: json.RawMessage(`{ "type": "volume",
								"field": "count",
								"agg": "avg",
								"interval": "s" }`,
							),
						},
					},
				}

				aggs, err := api.buildEsAggs(&req)
				Expect(err).NotTo(HaveOccurred())
				Expect(aggs).To(BeEquivalentTo(MapStr{
					"volume_avg": metrics.MapStr{
						"sum": metrics.MapStr{
							"field": "count",
						},
					},
				}))
			})

			It("should create a percentiles agg for a percentile metric", func() {
				var req = PerfDashRequest{
					Metrics: []ConfigRaw{
						ConfigRaw{
							Name: "percentile_50th",
							Type: "percentile",
							Config: json.RawMessage(
								`{ "type": "percentile",
								"field": "responsetime",
								"datatype": "duration",
								"percentile": 50 }`,
							),
						},
					},
				}

				aggs, err := api.buildEsAggs(&req)
				Expect(err).NotTo(HaveOccurred())
				Expect(aggs).To(BeEquivalentTo(MapStr{
					"percentile_50th": metrics.MapStr{
						"percentiles": metrics.MapStr{
							"field":    "responsetime",
							"percents": []float32{50},
						},
					},
				}))
			})

			It("should work to request two metrics", func() {
				var req = PerfDashRequest{
					Metrics: []ConfigRaw{
						ConfigRaw{
							Name: "volume_avg",
							Type: "volume",
							Config: json.RawMessage(`{ "type": "volume",
								"field": "count",
								"agg": "avg",
								"interval": "s" }`,
							),
						},
						ConfigRaw{
							Name: "percentile_50th",
							Type: "percentile",
							Config: json.RawMessage(
								`{ "type": "percentile",
								"field": "responsetime",
								"datatype": "duration",
								"percentile": 50 }`,
							),
						},
					},
				}
				aggs, err := api.buildEsAggs(&req)
				Expect(err).NotTo(HaveOccurred())
				Expect(aggs).To(BeEquivalentTo(MapStr{
					"volume_avg": metrics.MapStr{
						"sum": metrics.MapStr{
							"field": "count",
						},
					},
					"percentile_50th": metrics.MapStr{
						"percentiles": metrics.MapStr{
							"field":    "responsetime",
							"percents": []float32{50},
						},
					},
				}))
			})
		})
	})
})
