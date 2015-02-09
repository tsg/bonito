package metrics

import (
	"encoding/json"
	"errors"
)

type cardinalityMetric struct {
}

type cardinalityMetricConfig struct {
	Field string
}

func (m cardinalityMetric) buildEsAggs(metric ConfigRaw) (MapStr, error) {
	var config cardinalityMetricConfig
	err := json.Unmarshal(metric.Config, &config)
	if err != nil {
		return nil, err
	}

	return MapStr{
		metric.Name: MapStr{
			"cardinality": MapStr{
				"field": config.Field,
			},
		},
	}, nil
}

func (m cardinalityMetric) fromEsResponse(resp map[string]json.RawMessage,
	metric ConfigRaw, interval Interval) (MapStr, error) {

	var cardinality struct {
		Value float32
	}

	val, exists := resp[metric.Name]
	if !exists {
		return nil, errors.New("Elasticsearch didn't return the aggregation")
	}

	err := json.Unmarshal(val, &cardinality)
	if err != nil {
		return nil, err
	}

	return MapStr{
		"value": cardinality.Value,
	}, nil
}
