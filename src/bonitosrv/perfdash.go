package main

import (
	"bonitosrv/elasticsearch"
	"bonitosrv/metrics"
	"encoding/json"
	"time"
)

// Type grouping the methods of this API end point
type PerfDashApi struct {
	es      *elasticsearch.Elasticsearch
	Index   string
	metrics *metrics.Metrics
}

type PerfDashRequest struct {
	Timerange  Timerange
	Metrics    []ConfigRaw
	Viz        []ConfigRaw
	Dimensions DimensionConfigRaw

	Config struct {
		Timestamp_field string
	}
}

type ConfigRaw struct {
	Name   string
	Type   string
	Config json.RawMessage
}

type DimensionConfigRaw struct {
	Name    string
	Type    string
	Config  json.RawMessage
	Metrics []ConfigRaw
	Viz     []ConfigRaw
}

type PerfDashResponse struct {
	Metrics    map[string]json.RawMessage   `json:"metrics"`
	Viz        map[string]json.RawMessage   `json:"viz"`
	Dimensions map[string]DimensionResponse `json:"dimensions"`
}

type DimensionResponse struct {
	Metrics map[string]json.RawMessage `json:"metrics"`
	Viz     map[string]json.RawMessage `json:"viz"`
}

func (api *PerfDashApi) setRequestDefaults(req *PerfDashRequest) {
	if len(req.Config.Timestamp_field) == 0 {
		req.Config.Timestamp_field = "timestamp"
	}
	if req.Timerange.IsZero() {
		req.Timerange.From = JsTime(time.Now().Add(-1 * time.Hour))
		req.Timerange.To = JsTime(time.Now())
	}
}

func esBuildTimeFilter(tsField string, tr Timerange) MapStr {
	return MapStr{
		"range": MapStr{
			tsField: MapStr{
				"lte": elasticsearch.Time(tr.To),
				"gte": elasticsearch.Time(tr.From),
			},
		},
	}
}

func (api *PerfDashApi) buildEsAggs(req *PerfDashRequest) (MapStr, error) {
	aggs := MapStr{}

	for _, metric := range req.Metrics {
		agg, err := api.metrics.BuildEsAggs(metrics.ConfigRaw(metric))
		if err != nil {
			return nil, err
		}
		aggs.update(MapStr(agg))
	}
	return aggs, nil
}

func (api *PerfDashApi) Query(req *PerfDashRequest) (*PerfDashResponse, int, error) {
	var err error
	api.setRequestDefaults(req)

	esreq := MapStr{}
	esreq["query"] = MapStr{
		"filter": esBuildTimeFilter(req.Config.Timestamp_field, req.Timerange),
	}

	esreq["aggs"], err = api.buildEsAggs(req)
	if err != nil {
		return nil, 400, err
	}

	return nil, 0, nil
}

func NewPerfDashApi(index string) *PerfDashApi {
	return &PerfDashApi{
		es:      elasticsearch.NewElasticsearch(),
		Index:   index,
		metrics: metrics.NewMetrics(),
	}
}
