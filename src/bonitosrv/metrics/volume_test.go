package metrics

import (
	"encoding/json"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

var _ = Describe("Volume metric", func() {

	var metric volumeMetric
	BeforeEach(func() {
		metric = volumeMetric{}
	})

	Context("buildEsAggs", func() {
		It("should create a volume aggregation", func() {
			var config = ConfigRaw{
				Name: "volume_avg",
				Type: "volume",
				Config: json.RawMessage(
					`{ "type": "volume",
					"field": "count",
					"agg": "avg",
					"interval": "s" }`,
				),
			}

			aggs, err := metric.buildEsAggs(config)
			Expect(err).NotTo(HaveOccurred())
			Expect(aggs).To(BeEquivalentTo(MapStr{
				"volume_avg": MapStr{
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
				"volume_avg": json.RawMessage(`{
					"value": 123.4
				}`),
			}
			config := ConfigRaw{
				Name: "volume_avg",
				Type: "volume",
			}
			rez, err := metric.fromEsResponse(resp, config, Interval{Seconds: 2.0})
			Expect(err).NotTo(HaveOccurred())
			Expect(rez["value"].(float32)).To(BeNumerically("~", 61.7, 0.001))
		})
	})
})
