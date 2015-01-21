package main

import (
	"bonitosrv/elasticsearch"
	"bonitosrv/testdata"
	"bytes"
	"fmt"
	"time"
)

func main() {
	gen := testdata.TestTransactionsGenerator{
		Increment:  10 * time.Millisecond,
		From:       time.Now().Add(-30 * time.Minute),
		To:         time.Now().Add(-2 * time.Microsecond),
		NrServices: 60,
		NrHosts:    10,
		RtMin:      0,
		RtMax:      1000,
		CountMin:   1,
		CountMax:   10,
		ErrorProb:  0.1,
	}

	transChan := make(chan testdata.TestTransaction, 100)

	index_name := "packetbeat-test"
	es := elasticsearch.NewElasticsearch()

	// make sure we start fresh
	_, err := es.DeleteIndex(index_name)
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

	go gen.GenerateInChan(transChan)
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
