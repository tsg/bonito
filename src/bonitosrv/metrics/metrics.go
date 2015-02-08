package metrics

import "encoding/json"

type ConfigRaw struct {
	Name   string
	Type   string
	Config json.RawMessage
}

type MapStr map[string]interface{}

type Interval struct {
	Seconds float32
}

type metric interface {
	buildEsAggs(metric ConfigRaw) (MapStr, error)
	fromEsResponse(resp json.RawMessage, interval Interval) (MapStr, error)
}

type Metrics struct {
	metrics map[string]metric
}

func (metrics *Metrics) BuildEsAggs(metric ConfigRaw) (MapStr, error) {
	return metrics.metrics[metric.Type].buildEsAggs(metric)
}

func (metrics *Metrics) RegisterAll() {
	metrics.metrics = map[string]metric{
		"volume": volumeMetric{},
	}
}

func NewMetrics() *Metrics {
	var metrics Metrics
	metrics.RegisterAll()
	return &metrics
}
