package main

import (
	"bonitosrv/datetime"
	"bonitosrv/elasticsearch"
	"bonitosrv/metrics"
	"bonitosrv/testdata"
	"encoding/json"
	"fmt"
	"os"

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

	Context("With test ES", func() {
		var es *elasticsearch.Elasticsearch
		var index_name string
		var api *PerfDashApi
		BeforeEach(func() {
			index_name = fmt.Sprintf("packetbeat-unittest-%v", os.Getpid())
			es = elasticsearch.NewElasticsearch()

			_, err := es.DeleteIndex(index_name)
			Expect(err).To(BeNil())
			es.Refresh(index_name)

			ts1, _ := elasticsearch.TimeParse("2015-01-02T15:04:05.000Z")
			ts2, _ := elasticsearch.TimeParse("2015-01-02T15:04:05.001Z")

			transactions := []testdata.TestTransaction{
				testdata.TestTransaction{
					Timestamp:    ts1,
					Service:      "service1",
					Host:         "Host0",
					Count:        2,
					Responsetime: 2000,
					Status:       "ok",
				},
				testdata.TestTransaction{
					Timestamp:    ts2,
					Service:      "service2",
					Host:         "Host3",
					Count:        4,
					Responsetime: 2000,
					Status:       "ok",
				},
				testdata.TestTransaction{
					Timestamp:    ts2,
					Service:      "service1",
					Host:         "host2",
					Count:        3,
					Responsetime: 2100,
					Status:       "error",
				},
			}

			err = testdata.InsertInto(es, index_name, transactions)
			Expect(err).To(BeNil())

			api = NewPerfDashApi(index_name)

		})
		AfterEach(func() {
			_, err := es.DeleteIndex(index_name)
			Expect(err).To(BeNil())
			es.Refresh(index_name)
			//fmt.Println("index name", index_name)
		})

		It("should get a json with metrics", func() {
			req := PerfDashRequest{
				Timerange: datetime.Timerange{
					From: datetime.MustParseJsTime("2015-01-02T15:04:04.000Z"),
					To:   datetime.MustParseJsTime("2015-01-02T15:04:06.000Z"),
				},
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

			resp, code, err := api.Query(&req)
			Expect(err).NotTo(HaveOccurred())
			Expect(code).To(Equal(200))
			Expect(json.Marshal(resp)).To(BeEquivalentTo(`{"dim":{},"metrics":{"percentile_50th":{"value":2000},"volume_avg":{"value":4.5}},"status":"ok"}`))

		})

		It("should get a json with dimensions' metrics", func() {
			req := PerfDashRequest{
				Timerange: datetime.Timerange{
					From: datetime.MustParseJsTime("2015-01-02T15:04:04.000Z"),
					To:   datetime.MustParseJsTime("2015-01-02T15:04:06.000Z"),
				},
				Dimensions: []DimensionConfigRaw{
					DimensionConfigRaw{
						Name: "services",
						Metrics: []ConfigRaw{
							ConfigRaw{
								Name: "services",
								Type: "cardinality",
								Config: json.RawMessage(`{
									"field": "service"
								}`),
							},
							ConfigRaw{
								Name: "volume_per_service",
								Type: "cardvolume",
								Config: json.RawMessage(`{
									"dimension_field": "service",
									"count_field": "count"
								}`),
							},
						},
					},
				},
			}

			resp, code, err := api.Query(&req)
			Expect(err).NotTo(HaveOccurred())
			Expect(code).To(Equal(200))
			Expect(json.Marshal(resp)).To(BeEquivalentTo(`{"dim":{"services":{"metrics":{"services":{"value":2},"volume_per_service":{"value":2.25}}}},"metrics":{},"status":"ok"}`))

		})
	})

})
