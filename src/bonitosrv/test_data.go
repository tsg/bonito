package main

/**
 * Utility functions to generate test transactions data.
 * These are meant to be used by unit tests.
 */

import (
	"fmt"
	"math/rand"
	"time"
)

type TestTransaction struct {
	Timestamp    string
	Service      string
	Host         string
	Count        int
	Responsetime int
	Status       string
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
