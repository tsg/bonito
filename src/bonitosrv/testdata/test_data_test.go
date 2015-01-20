package testdata

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"testing"
	"time"

	"bonitosrv/elasticsearch"
)

var _ = Describe("Test data generation", func() {

	Context("generateData", func() {
		var transactions []TestTransaction
		BeforeEach(func() {
			gen := TestTransactionsGenerator{
				From:       time.Now().Add(-1 * time.Second),
				To:         time.Now().Add(-2 * time.Microsecond),
				NrServices: 60,
				NrHosts:    10,
				RtMin:      0,
				RtMax:      1000,
				CountMin:   1,
				CountMax:   10,
				ErrorProb:  0.1,
			}
			transactions = gen.Generate()
		})

		It("Should generate 1000 points for a second of data", func() {
			Expect(len(transactions)).To(Equal(1000))
		})

		It("First transaction should have Service0 and host Service0-Host0", func() {
			Expect(transactions[0].Service).To(Equal("Service0"))
			Expect(transactions[0].Host).To(Equal("Service0-Host0"))
		})
	})

	Context("generate data in Elasticsearch", func() {
		var es *elasticsearch.Elasticsearch
		index_name := fmt.Sprintf("packetbeat-unittest-%v", os.Getpid())
		BeforeEach(func() {
			es = elasticsearch.NewElasticsearch()

			_, err := es.DeleteIndex(index_name)
			Expect(err).To(BeNil())
			es.Refresh(index_name)

		})
		AfterEach(func() {
			_, err := es.DeleteIndex(index_name)
			Expect(err).To(BeNil())
			es.Refresh(index_name)
		})

		It("Should be possible to insert them in ES", func() {

			gen := TestTransactionsGenerator{
				From:       time.Now().Add(-500 * time.Millisecond),
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

			err := InsertInto(es, index_name, transactions)
			Expect(err).To(BeNil())

			resp, err := es.Search(index_name, "", "{}")
			Expect(resp).NotTo(BeNil())
			defer resp.Body.Close()
			objresp, err := ioutil.ReadAll(resp.Body)
			Expect(err).To(BeNil())
			var esResult elasticsearch.EsSearchResults
			err = json.Unmarshal(objresp, &esResult)
			Expect(err).To(BeNil())
			Expect(esResult.Hits.Total).To(Equal(500))
		})
	})
})

func TestDataGenerator(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Bonitosrv TestData suite")
}
