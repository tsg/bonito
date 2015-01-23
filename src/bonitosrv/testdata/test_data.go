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
	Timestamp    elasticsearch.Time `json:"timestamp"`
	Service      string             `json:"service"`
	Host         string             `json:"host"`
	Count        int                `json:"count"`
	Responsetime int                `json:"responsetime"`
	Status       string             `json:"status"`
}

type TestTransactionsGenerator struct {
	Increment  time.Duration
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

func (gen *TestTransactionsGenerator) GenerateInChan(transactions chan TestTransaction) {

	if gen.Increment == 0 {
		gen.Increment = time.Millisecond
	}

	i := 0
	for ts := gen.From; ts.Before(gen.To); ts = ts.Add(gen.Increment) {
		var trans TestTransaction

		trans.Timestamp = elasticsearch.Time(ts)
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

		transactions <- trans
		i++
	}

	close(transactions)
}

func (gen *TestTransactionsGenerator) Generate() []TestTransaction {
	transChan := make(chan TestTransaction, 100)

	go gen.GenerateInChan(transChan)

	transactions := []TestTransaction{}
	for trans := range transChan {
		transactions = append(transactions, trans)
	}
	return transactions
}

// Inserts the given test transactions in an Elasticsearch index.
func InsertInto(es *elasticsearch.Elasticsearch, index string,
	transactions []TestTransaction) error {

	transChan := make(chan TestTransaction, 100)
	go func() {
		for _, trans := range transactions {
			transChan <- trans
		}
		close(transChan)
	}()

	_, err := InsertInEsFromChan(es, index, transChan)
	return err
}

// Inserts into Elasticsearch the transactions from the channel
// Uses batches and the bulk API.
func InsertInEsFromChan(es *elasticsearch.Elasticsearch, index string,
	transactions chan TestTransaction) (int, error) {

	var buf bytes.Buffer

	enc := json.NewEncoder(&buf)

	var insOp struct {
		Index struct {
			Type string `json:"_type"`
		} `json:"index"`
	}
	insOp.Index.Type = "trans"

	flush := func() error {
		_, err := es.Bulk(index, &buf)
		if err != nil {
			return err
		}

		buf.Reset()
		enc = json.NewEncoder(&buf)
		return nil
	}

	i := 0
	for trans := range transactions {
		enc.Encode(insOp)
		enc.Encode(trans)

		if i%1000 == 0 {
			if err := flush(); err != nil {
				return i, err
			}
		}
		i++
	}

	if err := flush(); err != nil {
		return i, err
	}

	_, err := es.Refresh(index)
	if err != nil {
		return i, err
	}

	return i, nil
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
	transactions := gen.Generate()

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
