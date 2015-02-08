package metrics

import "encoding/json"

type volumeMetric struct {
}

type volumeMetricConfig struct {
	Field    string
	Agg      string
	Interval string
}

func (m volumeMetric) buildEsAggs(metric ConfigRaw) (MapStr, error) {
	var config volumeMetricConfig
	err := json.Unmarshal(metric.Config, &config)
	if err != nil {
		return nil, err
	}

	return MapStr{
		metric.Name: MapStr{
			"sum": MapStr{
				"field": config.Field,
			},
		},
	}, nil
}

func (m volumeMetric) fromEsResponse(resp json.RawMessage, interval Interval) (MapStr, error) {
	var volume struct {
		Value float32
	}

	err := json.Unmarshal(resp, &volume)
	if err != nil {
		return nil, err
	}

	return MapStr{
		"value": volume.Value / interval.Seconds,
	}, nil
}
