package main

import (
	"bonitosrv/datetime"
	"bonitosrv/elasticsearch"
	"bonitosrv/metrics"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"time"
)

// Type grouping the methods of this API end point
type PerfDashApi struct {
	es      *elasticsearch.Elasticsearch
	Index   string
	metrics *metrics.Metrics
}

type PerfDashRequest struct {
	Timerange  datetime.Timerange
	Metrics    []ConfigRaw
	Viz        []ConfigRaw
	Dimensions []DimensionConfigRaw

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

type DimensionResponse struct {
	Metrics map[string]json.RawMessage `json:"metrics"`
	Viz     map[string]json.RawMessage `json:"viz"`
}

func (api *PerfDashApi) setRequestDefaults(req *PerfDashRequest) {
	if len(req.Config.Timestamp_field) == 0 {
		req.Config.Timestamp_field = "timestamp"
	}
	if req.Timerange.IsZero() {
		req.Timerange.From = datetime.JsTime(time.Now().Add(-1 * time.Hour))
		req.Timerange.To = datetime.JsTime(time.Now())
	}
}

func esBuildTimeFilter(tsField string, tr datetime.Timerange) MapStr {
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
			return nil, fmt.Errorf("Metric '%s' error: %v", metric.Name, err)
		}
		aggs.update(MapStr(agg))
	}

	for _, dim := range req.Dimensions {
		for _, metric := range dim.Metrics {
			agg, err := api.metrics.BuildEsAggs(metrics.ConfigRaw(metric))
			if err != nil {
				return nil, fmt.Errorf("Dim '%s' metric '%s': %v",
					dim.Name, metric.Name, err)
			}
			aggs.update(MapStr(agg))
		}
	}
	return aggs, nil
}

func (api *PerfDashApi) metricsFromEsResponse(resp map[string]json.RawMessage,
	configs []ConfigRaw, interval metrics.Interval) (MapStr, error) {

	result := MapStr{}

	for _, metric := range configs {
		res, err := api.metrics.FromEsResponse(resp,
			metrics.ConfigRaw(metric), interval)
		if err != nil {
			return nil, err
		}

		result[metric.Name] = res
	}

	return result, nil
}

func (api *PerfDashApi) Query(req *PerfDashRequest) (MapStr, int, error) {
	var err error
	api.setRequestDefaults(req)

	esreq := MapStr{}
	esreq["query"] = MapStr{
		"filtered": MapStr{
			"filter": esBuildTimeFilter(req.Config.Timestamp_field, req.Timerange),
		},
	}

	esreq["aggs"], err = api.buildEsAggs(req)
	if err != nil {
		return nil, 400, err
	}

	objreq, err := json.Marshal(&esreq)
	if err != nil {
		return nil, 500, err
	}

	fmt.Println(string(objreq))

	resp, err := api.es.Search(api.Index, "?search_type=count",
		string(objreq))
	defer resp.Body.Close()
	if err != nil {
		return nil, 500, err
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, 500, err
	}

	var answ struct {
		Aggregations map[string]json.RawMessage
	}
	err = json.Unmarshal(body, &answ)
	if err != nil {
		return nil, 500, err
	}

	interval := metrics.Interval{
		Seconds: float32(time.Time(req.Timerange.To).Sub(
			time.Time(req.Timerange.From))) / 1e9,
	}

	metricsRes, err := api.metricsFromEsResponse(answ.Aggregations,
		req.Metrics, interval)

	dimRes := MapStr{}
	for _, dim := range req.Dimensions {
		dimMetricsRes, err := api.metricsFromEsResponse(answ.Aggregations,
			dim.Metrics, interval)
		if err != nil {
			return nil, 500, err
		}

		dimRes[dim.Name] = MapStr{
			"metrics": dimMetricsRes,
		}
	}

	return MapStr{
		"status":  "ok",
		"metrics": metricsRes,
		"dim":     dimRes,
	}, 200, nil
}

func NewPerfDashApi(index string) *PerfDashApi {
	return &PerfDashApi{
		es:      elasticsearch.NewElasticsearch(),
		Index:   index,
		metrics: metrics.NewMetrics(),
	}
}
