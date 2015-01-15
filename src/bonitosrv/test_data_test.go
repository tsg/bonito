package main

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"time"
)

var _ = Describe("Test data generation", func() {

	Context("generateData", func() {

		gen := TestTransactionsGenerator{
			From:       time.Now().Add(-1 * time.Second),
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

		It("Should generate 1000 points for a second of data", func() {
			Expect(len(transactions)).To(Equal(1000))
		})

		It("First transaction should have Service0 and host Service0-Host0", func() {
			Expect(transactions[0].Service).To(Equal("Service0"))
			Expect(transactions[0].Host).To(Equal("Service0-Host0"))
		})
	})

})
