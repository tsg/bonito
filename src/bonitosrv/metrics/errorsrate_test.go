package metrics

import (
	"encoding/json"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

var _ = Describe("Errorsrate metric", func() {

	var metric errorsrateMetric
	BeforeEach(func() {
		metric = errorsrateMetric{}
	})

	Context("buildEsAggs", func() {
		It("should create a errorsrate aggregation", func() {
			var config = ConfigRaw{
				Name: "errorsrate",
				Type: "errorsrate",
				Config: json.RawMessage(
					`{ "type": "errorsrate",
					"count_field": "count",
					"status_field": "status",
					"ok_value": "Ok"}`,
				),
			}

			aggs, err := metric.buildEsAggs(config)
			Expect(err).NotTo(HaveOccurred())
			Expect(aggs).To(BeEquivalentTo(MapStr{
				"errorsrate_errcount": MapStr{
					"filter": MapStr{
						"not": MapStr{
							"term": MapStr{
								"status": "Ok",
							},
						},
					},
					"aggs": MapStr{
						"count": MapStr{
							"sum": MapStr{
								"field": "count",
							},
						},
					},
				},
				"errorsrate_count": MapStr{
					"sum": MapStr{
						"field": "count",
					},
				},
			}))
		})
	})

	Context("fromEsResponse", func() {
		It("should extract the value from the ES value", func() {
			resp := map[string]json.RawMessage{
				"errorsrate_errcount": json.RawMessage(`{
					"count": { "value": 12 }
				}`),
				"errorsrate_count": json.RawMessage(`{
					"value": 1234
				}`),
			}
			config := ConfigRaw{
				Name: "errorsrate",
				Type: "errorsrate",
			}
			rez, err := metric.fromEsResponse(resp, config, Interval{Seconds: 2.0})
			Expect(err).NotTo(HaveOccurred())
			Expect(rez["value"].(float32)).To(BeNumerically("~", 0.0097, 0.0001))
		})
	})
})
