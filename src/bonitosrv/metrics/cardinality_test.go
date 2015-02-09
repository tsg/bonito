package metrics

import (
	"encoding/json"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

var _ = Describe("Cardinality metric", func() {

	var metric cardinalityMetric
	BeforeEach(func() {
		metric = cardinalityMetric{}
	})

	Context("buildEsAggs", func() {
		It("should create a cardinality aggregation", func() {
			var config = ConfigRaw{
				Name: "cardinality",
				Type: "cardinality",
				Config: json.RawMessage(
					`{ "field": "host" }`,
				),
			}

			aggs, err := metric.buildEsAggs(config)
			Expect(err).NotTo(HaveOccurred())
			Expect(aggs).To(BeEquivalentTo(MapStr{
				"cardinality": MapStr{
					"cardinality": MapStr{
						"field": "host",
					},
				},
			}))
		})
	})

	Context("fromEsResponse", func() {
		It("should extract the value from the ES value", func() {
			resp := map[string]json.RawMessage{
				"cardinality": json.RawMessage(`{
					"value": 123
				}`),
			}
			config := ConfigRaw{
				Name: "cardinality",
				Type: "cardinality",
			}
			rez, err := metric.fromEsResponse(resp, config, Interval{Seconds: 2.0})
			Expect(err).NotTo(HaveOccurred())
			Expect(rez["value"].(float32)).To(BeNumerically("~", 123, 0.001))
		})
	})
})
