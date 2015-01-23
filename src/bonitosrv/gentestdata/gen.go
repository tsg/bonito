package main

import (
	"bonitosrv/elasticsearch"
	"bonitosrv/testdata"
	"bytes"
	"fmt"
	"math/rand"
	"time"
)

func gengenOptionsForServices(samples int,
	from time.Time, to time.Time) *testdata.GenGenOptions {

	options := testdata.GenGenOptions{
		Samples: samples,
	}

	options.Specs = []map[string]testdata.GenGenSpec{}

	curves := []string{"random", "peak", "jump-up", "jump-down"}

	// 81 services, a spec for each
	for i := 0; i < 81; i++ {

		spec := map[string]testdata.GenGenSpec{}

		// timestamp
		spec["timestamp"] = testdata.GenGenSpec{
			Timerange: &testdata.TimerangeOptions{
				From: from,
				To:   to,
			},
		}

		// service
		spec["service"] = testdata.GenGenSpec{
			Fixed: &testdata.FixedOptions{
				Value: fmt.Sprintf("Service%d", i),
			},
		}

		// count
		count := 100 * float64((uint64(1) << (uint(i) % 25)))
		switch curves[i%len(curves)] {
		case "random":
			spec["count"] = testdata.GenGenSpec{
				Eventful: &testdata.EventfulOptions{
					Value:            count,
					Type:             "constant",
					RandomizedHeight: count / 10,
				},
			}
		case "peak":
			spec["count"] = testdata.GenGenSpec{
				Eventful: &testdata.EventfulOptions{
					Value:            count,
					Type:             "peak",
					RandomizedHeight: count / 10,
				},
			}
		case "jump-up":
			spec["count"] = testdata.GenGenSpec{
				Eventful: &testdata.EventfulOptions{
					Value:            count,
					Type:             "jump",
					RandomizedHeight: count / 10,
				},
			}
		case "jump-down":
			spec["count"] = testdata.GenGenSpec{
				Eventful: &testdata.EventfulOptions{
					Value:            count,
					Type:             "jump",
					RandomizedHeight: count / 10,
					Factor:           0.5,
				},
			}
		}

		// host
		hosts := []interface{}{}
		for j := 0; j < i+10; j++ {
			hosts = append(hosts, interface{}(fmt.Sprintf("host%d.service%d", j, i)))
		}
		spec["host"] = testdata.GenGenSpec{
			Choice: &testdata.ChoiceOptions{
				Type:   "loop",
				Values: []interface{}(hosts),
			},
		}

		// responsetime
		rt_base := i*10 + rand.Intn(100+i*10)
		rt_choices := []interface{}{rt_base, rt_base * 10, rt_base * 100}
		rt_weights := []float32{0.9, 0.07, 0.03}
		spec["responsetime"] = testdata.GenGenSpec{
			Choice: &testdata.ChoiceOptions{
				Type:    "weighted",
				Values:  rt_choices,
				Weights: rt_weights,
			},
		}

		// status
		error_probabilty := rand.Float32() / 5
		spec["status"] = testdata.GenGenSpec{
			Choice: &testdata.ChoiceOptions{
				Type:    "weighted",
				Values:  []interface{}{"Ok", "Error"},
				Weights: []float32{1 - error_probabilty, error_probabilty},
			},
		}

		options.Specs = append(options.Specs, spec)

	}

	return &options
}

func main() {
	to := time.Now()
	from := to.Add(-1 * time.Hour)

	samples := 100
	options := gengenOptionsForServices(samples, to, from)
	gen, err := testdata.NewGenGen(*options)
	if err != nil {
		fmt.Println(err)
		return
	}

	transChan := make(chan testdata.TestTransaction, 100)

	index_name := "packetbeat-test"
	es := elasticsearch.NewElasticsearch()

	// make sure we start fresh
	_, err = es.DeleteIndex(index_name)
	if err != nil {
		fmt.Println("Error: ", err)
		return
	}

	// create index with custom settings
	resp, err := es.Request("PUT", index_name, "", bytes.NewBufferString(
		`{"settings": {"index": {"refresh_interval": "-1"}}}`,
	))
	if err != nil {
		fmt.Println(elasticsearch.ResponseBody(resp))
		fmt.Println("Error: ", err)
		return
	}

	// generate in channel
	go func() {
		for i := 0; i < samples; i++ {
			for _, trans := range gen.Generate(i) {
				transChan <- testdata.TestTransaction{
					Timestamp:    elasticsearch.Time(trans["timestamp"].(time.Time)),
					Service:      trans["service"].(string),
					Host:         trans["host"].(string),
					Count:        int(trans["count"].(float64)),
					Responsetime: trans["responsetime"].(int),
					Status:       trans["status"].(string),
				}
			}
		}
		close(transChan)
	}()

	inserted, err := testdata.InsertInEsFromChan(es, index_name, transChan)
	if err != nil {
		fmt.Println("Error: ", err)
	}

	fmt.Printf("%d transactions inserted into %s\n", inserted, index_name)

	// set back the refreshing interval
	_, err = es.Request("PUT", index_name, "_settings", bytes.NewBufferString(
		`{"index": {"refresh_interval": "1s"}}`,
	))
	if err != nil {
		fmt.Println("Error: ", err)
	}
}
