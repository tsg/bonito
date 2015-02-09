package metrics

import (
	"encoding/json"
	"errors"
	"fmt"
)

type cardvolumeMetric struct {
}

type cardvolumeMetricConfig struct {
	Dimension_field string
	Count_field     string
}

func (m cardvolumeMetric) buildEsAggs(metric ConfigRaw) (MapStr, error) {
	var config cardvolumeMetricConfig
	err := json.Unmarshal(metric.Config, &config)
	if err != nil {
		return nil, err
	}

	if len(config.Dimension_field) == 0 {
		return nil, errors.New("dimension_field parameter is required")
	}
	if len(config.Count_field) == 0 {
		return nil, errors.New("count_field parameter is required")
	}

	return MapStr{
		fmt.Sprintf("%s_card", metric.Name): MapStr{
			"cardinality": MapStr{
				"field": config.Dimension_field,
			},
		},
		fmt.Sprintf("%s_volume", metric.Name): MapStr{
			"sum": MapStr{
				"field": config.Count_field,
			},
		},
	}, nil
}

func (m cardvolumeMetric) fromEsResponse(resp map[string]json.RawMessage,
	metric ConfigRaw, interval Interval) (MapStr, error) {

	var cardinality struct {
		Value float32
	}
	var volume struct {
		Value float32
	}

	val, exists := resp[fmt.Sprintf("%s_card", metric.Name)]
	if !exists {
		return nil, errors.New("Elasticsearch didn't return the aggregation")
	}

	err := json.Unmarshal(val, &cardinality)
	if err != nil {
		return nil, err
	}

	val, exists = resp[fmt.Sprintf("%s_volume", metric.Name)]
	if !exists {
		return nil, errors.New("Elasticsearch didn't return the aggregation")
	}

	err = json.Unmarshal(val, &volume)
	if err != nil {
		return nil, err
	}

	return MapStr{
		"value": volume.Value / cardinality.Value / interval.Seconds,
	}, nil
}
