package metrics

import (
	"encoding/json"
	"testing"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

var _ = Describe("Percentile metric", func() {

	var metric percentileMetric
	BeforeEach(func() {
		metric = percentileMetric{}
	})

	Context("buildEsAggs", func() {
		It("should create a percentile aggregation", func() {
			var config = ConfigRaw{
				Name: "percentile_50th",
				Type: "percentile",
				Config: json.RawMessage(
					`{ "type": "percentile",
					"field": "responsetime",
					"datatype": "duration",
					"percentile": 50 }`,
				),
			}

			aggs, err := metric.buildEsAggs(config)
			Expect(err).NotTo(HaveOccurred())
			Expect(aggs).To(BeEquivalentTo(MapStr{
				"percentile_50th": MapStr{
					"percentiles": MapStr{
						"field":    "responsetime",
						"percents": []float32{50.0},
					},
				},
			}))
		})
	})

	Context("fromEsResponse", func() {
		It("should extract the value from the ES values array", func() {
			resp := map[string]json.RawMessage{
				"percentile_50th": json.RawMessage(`{
					"values": {
						"50.0": 123.4
					}
				}`),
			}
			config := ConfigRaw{
				Name: "percentile_50th",
				Type: "percentile",
			}
			rez, err := metric.fromEsResponse(resp, config, Interval{})
			Expect(err).NotTo(HaveOccurred())
			Expect(rez["value"].(float32)).To(BeNumerically("~", 123.4, 0.001))
		})
	})
})

func TestDataGenerator(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Metrics suite")
}
