package viz

import (
	"bonitosrv/datetime"
	"bonitosrv/elasticsearch"
	"encoding/json"
	"errors"
	"fmt"
	"time"
)

type volumeLine struct {
}

type volumeLineConfig struct {
	Count_field string
	Ts_field    string
}

func (v volumeLine) buildEsAggs(config ConfigRaw, interval Interval) (MapStr, error) {

	var cfg volumeLineConfig
	err := json.Unmarshal(config.Config, &cfg)
	if err != nil {
		return nil, err
	}

	if len(cfg.Count_field) == 0 {
		return nil, errors.New("count_field is required")
	}

	if len(cfg.Ts_field) == 0 {
		return nil, errors.New("count_field is required")
	}

	return MapStr{
		fmt.Sprintf("v%d_%s", config.Index, config.Name): MapStr{
			"date_histogram": MapStr{
				"field":         cfg.Ts_field,
				"interval":      interval.BucketTsSize,
				"min_doc_count": 0,
				"extended_bounds": MapStr{
					"min": elasticsearch.Time(interval.From),
					"max": elasticsearch.Time(interval.To),
				},
			},
			"aggs": MapStr{
				"volume": MapStr{
					"sum": MapStr{
						"field": cfg.Count_field,
					},
				},
			},
		},
	}, nil
}

func (v volumeLine) fromEsResponse(resp map[string]json.RawMessage,
	config ConfigRaw, interval Interval) (MapStr, error) {

	var volume_hist struct {
		Buckets []struct {
			Key_as_string elasticsearch.Time
			Volume        struct {
				Value float32
			}
		}
	}

	val, exists := resp[fmt.Sprintf("v%d_%s", config.Index, config.Name)]
	if !exists {
		return nil, errors.New("Elasticsearch didn't return the aggregation")
	}

	err := json.Unmarshal(val, &volume_hist)
	if err != nil {
		return nil, err
	}

	values := []MapStr{}
	for _, bucket := range volume_hist.Buckets {
		bucket_secs := computeRealSecondsInInterval(interval,
			time.Time(bucket.Key_as_string))

		values = append(values, MapStr{
			"ts":    datetime.JsTime(bucket.Key_as_string),
			"value": bucket.Volume.Value / bucket_secs,
		})
	}

	return MapStr{
		"data": values,
	}, nil
}

// Returns the real number of seconds in a bucket returned by Elasticsearch.
// This can be different from interval.BucketSeconds for the first and last buckets,
// which can be smaller.
func computeRealSecondsInInterval(interval Interval, start_interval time.Time) float32 {
	// When dividing by the seconds, we have to be careful with
	// the first and the last interval which can be shorter.
	var from, to time.Time
	if start_interval.Before(interval.From) {
		from = interval.From
	} else {
		from = start_interval
	}

	end_interval := start_interval.Add(time.Duration(interval.BucketSeconds) * time.Second)
	if end_interval.After(interval.To) {
		to = interval.To
	} else {
		to = end_interval
	}

	return float32(int64(to.Sub(from))/1e6) / 1000.0
}
