package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
)

// Type grouping the methods of this API end point
type ByDimensionApi struct {
	es    *Elasticsearch
	Index string
}

func NewByDimensionApi(index string) *ByDimensionApi {
	return &ByDimensionApi{
		es:    NewElasticsearch(),
		Index: index,
	}
}

type ByDimensionRequest struct {
	Timerange
	Metrics []string
	Config  struct {
		Primary_dimension   string
		Secondary_dimension string
		Responsetime_field  string
		Status_field        string
		Count_field         string
		Percentiles         []float32
	}
}

func (api *ByDimensionApi) setConfigDefaults(req *ByDimensionRequest) {
	c := &req.Config

	if len(c.Primary_dimension) == 0 {
		c.Primary_dimension = "service"
	}
	if len(c.Secondary_dimension) == 0 {
		c.Secondary_dimension = "host"
	}
	if len(c.Responsetime_field) == 0 {
		c.Responsetime_field = "responsetime"
	}
	if len(c.Status_field) == 0 {
		c.Status_field = "status"
	}
	if len(c.Count_field) == 0 {
		c.Count_field = "count"
	}
	if len(c.Percentiles) == 0 {
		c.Percentiles = []float32{50, 95, 99, 99.5}
	}
}

type ByDimensionResponse struct {
	Status  string             `json:"status"`
	Primary []PrimaryDimension `json:"primary"`
}

type PrimaryDimension struct {
	Name    string             `json:"name"`
	Metrics map[string]float32 `json:"metrics"`
}

type EsByDimensionReq struct {
	Aggs struct {
		Primary struct {
			Terms struct {
				Field string `json:"field"`
			} `json:"terms"`
			Aggs map[string]interface{} `json:"aggs"`
		} `json:"primary"`
	} `json:"aggs"`
}

func (api *ByDimensionApi) Query(req *ByDimensionRequest) (*ByDimensionResponse, error) {

	var esreq EsByDimensionReq
	es := NewElasticsearch()

	api.setConfigDefaults(req)

	primary := &esreq.Aggs.Primary
	primary.Terms.Field = req.Config.Primary_dimension

	// set the aggregations
	primary.Aggs = MapStr{}
	for _, metric := range req.Metrics {
		switch metric {
		case "volume":
			primary.Aggs["volume"] = MapStr{
				"sum": MapStr{
					"field": req.Config.Count_field,
				},
			}
		case "rt_max":
		case "rt_avg":
			primary.Aggs["rt_stats"] = MapStr{
				"stats": MapStr{
					"field": req.Config.Responsetime_field,
				},
			}
		case "rt_percentiles":
			primary.Aggs["rt_percentiles"] = MapStr{
				"percentile_ranks": MapStr{
					"field":  req.Config.Responsetime_field,
					"values": req.Config.Percentiles,
				},
			}
		case "secondary_count":
			primary.Aggs["secondary_card"] = MapStr{
				"cardinality": MapStr{
					"field": req.Config.Secondary_dimension,
				},
			}
		default:
			return nil, fmt.Errorf("Unknown metric name '%s'", metric)
		}
	}

	objreq, err := json.Marshal(&esreq)
	if err != nil {
		return nil, err
	}

	fmt.Println("Objreq=", string(objreq))

	resp, err := es.Search(api.Index, "?search_type=count",
		string(objreq))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var answ struct {
		Aggregations struct {
			Primary struct {
				Buckets []map[string]json.RawMessage
			}
		}
	}

	err = json.Unmarshal(body, &answ)
	if err != nil {
		return nil, err
	}

	var response ByDimensionResponse
	response.Primary = []PrimaryDimension{}

	for _, bucket := range answ.Aggregations.Primary.Buckets {
		var primary PrimaryDimension

		err := json.Unmarshal(bucket["key"], &primary.Name)
		if err != nil {
			return nil, err
		}

		primary.Metrics = map[string]float32{}

		// transform metrics
		for _, metric := range req.Metrics {
			switch metric {
			case "volume":
				var volume struct {
					Value float32
				}

				err = json.Unmarshal(bucket["volume"], &volume)
				if err != nil {
					return nil, err
				}

				primary.Metrics["volume"] = volume.Value
			}
		}

		response.Primary = append(response.Primary, primary)
	}

	// if we got so far, we're successful
	response.Status = "ok"

	return &response, nil
}
