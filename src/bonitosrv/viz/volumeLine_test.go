package viz

import (
	"bonitosrv/datetime"
	"bonitosrv/elasticsearch"
	"encoding/json"
	"testing"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

var _ = Describe("volumeLine visualization", func() {

	var viz volumeLine
	var interval Interval
	BeforeEach(func() {
		viz = volumeLine{}
		interval = Interval{
			From:          datetime.MustParseTime("2015-01-02T15:04:00.000Z"),
			To:            datetime.MustParseTime("2015-01-02T15:05:00.000Z"),
			BucketTsSize:  "30s",
			BucketSeconds: 30,
			Seconds:       60,
		}
	})

	Context("buildEsAggs", func() {
		It("should create a date_histogram aggregation", func() {
			var config = ConfigRaw{
				Name:  "volumehist",
				Type:  "volume-line",
				Index: 1,
				Config: json.RawMessage(`{
					"ts_field": "timestamp",
					"count_field": "count"}`,
				),
			}

			aggs, err := viz.buildEsAggs(config, interval)
			Expect(err).NotTo(HaveOccurred())
			Expect(aggs).To(BeEquivalentTo(MapStr{
				"v1_volumehist": MapStr{
					"date_histogram": MapStr{
						"field":         "timestamp",
						"interval":      "30s",
						"min_doc_count": 0,
						"extended_bounds": MapStr{
							"min": elasticsearch.Time(interval.From),
							"max": elasticsearch.Time(interval.To),
						},
					},
					"aggs": MapStr{
						"volume": MapStr{
							"sum": MapStr{
								"field": "count",
							},
						},
					},
				},
			}))
		})

		Context("fromEsResponse", func() {
			It("should extract the values from the ES response", func() {
				resp := map[string]json.RawMessage{
					"v1_volumehist": json.RawMessage(`{
					"buckets": [{
						"key_as_string": "2015-01-02T15:04:00.000Z",
						"volume": {
							"value": 30
						}
					}, {
						"key_as_string": "2015-01-02T15:04:30.000Z",
						"volume": {
							"value": 60
						}
					}]
				}`),
				}
				config := ConfigRaw{
					Name:  "volumehist",
					Type:  "volume-line",
					Index: 1,
				}
				res, err := viz.fromEsResponse(resp, config, interval)
				Expect(err).NotTo(HaveOccurred())
				Expect(json.Marshal(res["data"])).To(BeEquivalentTo(`[{"ts":"2015-01-02T15:04:00.000Z","value":1},{"ts":"2015-01-02T15:04:30.000Z","value":2}]`))
			})
		})
	})
})

func TestDataGenerator(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Viz suite")
}
