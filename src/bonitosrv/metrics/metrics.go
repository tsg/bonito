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
	fromEsResponse(resp map[string]json.RawMessage,
		metric ConfigRaw, interval Interval) (MapStr, error)
}

type Metrics struct {
	metrics map[string]metric
}

func (metrics *Metrics) BuildEsAggs(metric ConfigRaw) (MapStr, error) {
	m, exists := metrics.metrics[metric.Type]
	if !exists {
		return MapStr{}, nil
	}
	return m.buildEsAggs(metric)
}

func (metrics *Metrics) FromEsResponse(resp map[string]json.RawMessage,
	metric ConfigRaw, interval Interval) (MapStr, error) {

	m, exists := metrics.metrics[metric.Type]
	if !exists {
		return MapStr{}, nil
	}
	return m.fromEsResponse(resp, metric, interval)
}

func (metrics *Metrics) RegisterAll() {
	metrics.metrics = map[string]metric{
		"volume":     volumeMetric{},
		"percentile": percentileMetric{},
		"errorsrate": errorsrateMetric{},
	}
}

func NewMetrics() *Metrics {
	var metrics Metrics
	metrics.RegisterAll()
	return &metrics
}
