package metrics

import (
	"encoding/json"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

var _ = Describe("Cardinality-Volume metric", func() {

	var metric cardvolumeMetric
	BeforeEach(func() {
		metric = cardvolumeMetric{}
	})

	Context("buildEsAggs", func() {
		It("should create a cardvolume aggregation", func() {
			var config = ConfigRaw{
				Name: "cardvolume",
				Type: "cardvolume",
				Config: json.RawMessage(
					`{ "dimension_field": "host",
					"count_field": "count" }`,
				),
			}

			aggs, err := metric.buildEsAggs(config)
			Expect(err).NotTo(HaveOccurred())
			Expect(aggs).To(BeEquivalentTo(MapStr{
				"cardvolume_card": MapStr{
					"cardinality": MapStr{
						"field": "host",
					},
				},
				"cardvolume_volume": MapStr{
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
				"cardvolume_card": json.RawMessage(`{
					"value": 10
				}`),
				"cardvolume_volume": json.RawMessage(`{
					"value": 123
				}`),
			}
			config := ConfigRaw{
				Name: "cardvolume",
				Type: "cardvolume",
			}
			rez, err := metric.fromEsResponse(resp, config, Interval{Seconds: 2.0})
			Expect(err).NotTo(HaveOccurred())
			Expect(rez["value"].(float32)).To(BeNumerically("~", 6.15, 0.001))
		})
	})
})
