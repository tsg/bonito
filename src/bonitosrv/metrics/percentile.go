package metrics

import (
	"encoding/json"
	"errors"
)

type percentileMetric struct {
}

type percentileMetricConfig struct {
	Field      string
	Percentile float32
}

func (m percentileMetric) buildEsAggs(metric ConfigRaw) (MapStr, error) {
	var config percentileMetricConfig
	err := json.Unmarshal(metric.Config, &config)
	if err != nil {
		return nil, err
	}

	return MapStr{
		metric.Name: MapStr{
			"percentiles": MapStr{
				"field":    config.Field,
				"percents": []float32{config.Percentile},
			},
		},
	}, nil
}

func (m percentileMetric) fromEsResponse(resp json.RawMessage, interval Interval) (MapStr, error) {
	var percentiles struct {
		Values map[string]float32
	}

	err := json.Unmarshal(resp, &percentiles)
	if err != nil {
		return nil, err
	}

	for _, value := range percentiles.Values {
		// expecting only one value, so just return here
		return MapStr{
			"value": value,
		}, nil
	}
	return nil, errors.New("Invalid response from ES")
}
