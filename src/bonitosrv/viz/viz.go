package viz

import (
	"encoding/json"
	"time"
)

type ConfigRaw struct {
	Name   string
	Index  int
	Type   string
	Config json.RawMessage
}

type Interval struct {
	From          time.Time
	To            time.Time
	BucketTsSize  string
	BucketSeconds float32
	Seconds       float32
}

type MapStr map[string]interface{}

type visualization interface {
	buildEsAggs(config ConfigRaw, interval Interval) (MapStr, error)
	fromEsResponse(resp map[string]json.RawMessage,
		config ConfigRaw, interval Interval) (MapStr, error)
}

type Visualizations struct {
	viz map[string]visualization
}

func (viz *Visualizations) BuildEsAggs(config ConfigRaw, interval Interval) (MapStr, error) {
	m, exists := viz.viz[config.Type]
	if !exists {
		return MapStr{}, nil
	}
	return m.buildEsAggs(config, interval)
}

func (viz *Visualizations) FromEsResponse(resp map[string]json.RawMessage,
	config ConfigRaw, interval Interval) (MapStr, error) {

	m, exists := viz.viz[config.Type]
	if !exists {
		return MapStr{}, nil
	}
	return m.fromEsResponse(resp, config, interval)
}

func (viz *Visualizations) RegisterAll() {
	viz.viz = map[string]visualization{
		"volume-line": volumeLine{},
	}
}

func NewVisualizations() *Visualizations {
	var viz Visualizations
	viz.RegisterAll()
	return &viz
}
