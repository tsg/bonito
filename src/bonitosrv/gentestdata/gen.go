package main

import (
	"bonitosrv/elasticsearch"
	"bonitosrv/testdata"
	"fmt"
	"time"
)

func main() {
	gen := testdata.TestTransactionsGenerator{
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

	transactions := gen.Generate()

	index_name := "packetbeat-test"
	es := elasticsearch.NewElasticsearch()
	_, err := es.DeleteIndex(index_name)
	if err != nil {
		fmt.Println("Error: ", err)
	}

	testdata.InsertInto(es, index_name, transactions)

	fmt.Printf("%d transactions inserted into %s\n", len(transactions), index_name)
}
