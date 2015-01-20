package testdata

/**
 * Utility functions to generate test transactions data.
 * These are meant to be used by unit tests.
 */

import (
	"bytes"
	"encoding/json"
	"fmt"
	"math/rand"
	"time"

	"bonitosrv/elasticsearch"
)

type TestTransaction struct {
	Timestamp    string `json:"timestamp"`
	Service      string `json:"service"`
	Host         string `json:"host"`
	Count        int    `json:"count"`
	Responsetime int    `json:"responsetime"`
	Status       string `json:"status"`
}

const TsLayout = "2006-01-02T15:04:05.000000"

type TestTransactionsGenerator struct {
	From       time.Time
	To         time.Time
	NrServices int
	NrHosts    int
	RtMin      int
	RtMax      int
	CountMin   int
	CountMax   int
	ErrorProb  float32
}

func (gen *TestTransactionsGenerator) generateTestTransactions() []TestTransaction {

	transactions := []TestTransaction{}

	i := 0
	for ts := gen.From; ts.Before(gen.To); ts = ts.Add(time.Millisecond) {
		var trans TestTransaction

		trans.Timestamp = ts.UTC().Format(TsLayout)
		trans.Service = fmt.Sprintf("Service%d", i%gen.NrServices)
		trans.Host = fmt.Sprintf("Service%d-Host%d",
			i%gen.NrServices, i%gen.NrHosts)
		trans.Count = gen.CountMin + rand.Intn(gen.CountMax-gen.CountMin)
		trans.Responsetime = gen.RtMin + rand.Intn(gen.RtMax-gen.RtMin)
		if rand.Float32() < gen.ErrorProb {
			trans.Status = "Error"
		} else {
			trans.Status = "OK"
		}

		transactions = append(transactions, trans)

		i++
	}

	return transactions
}

func InsertInto(es *elasticsearch.Elasticsearch, index string,
	transactions []TestTransaction) error {

	var buf bytes.Buffer

	enc := json.NewEncoder(&buf)

	var insOp struct {
		Index struct {
			Type string `json:"_type"`
		} `json:"index"`
	}
	insOp.Index.Type = "trans"
	for i, trans := range transactions {
		enc.Encode(insOp)
		enc.Encode(trans)

		if i%1000 == 0 {
			_, err := es.Bulk(index, &buf)
			if err != nil {
				return err
			}
		}
	}

	_, err := es.Bulk(index, &buf)
	if err != nil {
		return err
	}
	es.Refresh(index)
	return nil
}

func InsertTestData(index string) error {

	es := elasticsearch.NewElasticsearch()

	gen := TestTransactionsGenerator{
		From:       time.Now().Add(-10 * time.Millisecond),
		To:         time.Now().Add(-1 * time.Microsecond),
		NrServices: 60,
		NrHosts:    10,
		RtMin:      0,
		RtMax:      1000,
		CountMin:   1,
		CountMax:   10,
		ErrorProb:  0.1,
	}
	transactions := gen.generateTestTransactions()

	// make sure we start fresh
	_, err := es.DeleteIndex(index)
	if err != nil {
		return err
	}
	es.Refresh(index)

	err = InsertInto(es, index, transactions)
	if err != nil {
		return err
	}
	return nil
}

func DeleteTestData(index string) error {
	es := elasticsearch.NewElasticsearch()
	_, err := es.DeleteIndex(index)
	es.Refresh(index)
	return err
}
