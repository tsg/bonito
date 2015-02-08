package metrics

import (
	"encoding/json"
	"errors"
	"fmt"
)

type errorsrateMetric struct {
}

type errorsrateMetricConfig struct {
	Status_field string
	Count_field  string
	Ok_value     string
}

func (m errorsrateMetric) buildEsAggs(metric ConfigRaw) (MapStr, error) {
	var config errorsrateMetricConfig
	err := json.Unmarshal(metric.Config, &config)
	if err != nil {
		return nil, err
	}

	return MapStr{
		fmt.Sprintf("%s_errcount", metric.Name): MapStr{
			"filter": MapStr{
				"not": MapStr{
					"term": MapStr{
						config.Status_field: config.Ok_value,
					},
				},
			},
			"aggs": MapStr{
				"count": MapStr{
					"sum": MapStr{
						"field": config.Count_field,
					},
				},
			},
		},
		fmt.Sprintf("%s_count", metric.Name): MapStr{
			"sum": MapStr{
				"field": config.Count_field,
			},
		},
	}, nil
}

func (m errorsrateMetric) fromEsResponse(resp map[string]json.RawMessage,
	metric ConfigRaw, interval Interval) (MapStr, error) {

	var err_count struct {
		Count struct {
			Value float32
		}
	}
	var count struct {
		Value float32
	}

	val, exists := resp[fmt.Sprintf("%s_errcount", metric.Name)]
	if !exists {
		return nil, errors.New("Elasticsearch didn't return the aggregation")
	}

	err := json.Unmarshal(val, &err_count)
	if err != nil {
		return nil, err
	}

	val, exists = resp[fmt.Sprintf("%s_count", metric.Name)]
	if !exists {
		return nil, errors.New("Elasticsearch didn't return the aggregation")
	}

	err = json.Unmarshal(val, &count)
	if err != nil {
		return nil, err
	}

	return MapStr{
		"value": err_count.Count.Value / count.Value,
	}, nil
}
