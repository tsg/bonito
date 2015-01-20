package elasticsearch

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"testing"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

var _ = Describe("Elasticsearch proxy", func() {
	var es *Elasticsearch
	index_name := fmt.Sprintf("packetbeat-unittest-%d", os.Getpid())
	BeforeEach(func() {
		es = NewElasticsearch()

		_, err := es.DeleteIndex(index_name)
		Expect(err).To(BeNil())
		es.Refresh(index_name)

	})
	AfterEach(func() {
		_, err := es.DeleteIndex(index_name)
		Expect(err).To(BeNil())
		es.Refresh(index_name)
	})

	Context("Insert and Refresh APIs", func() {

		It("Should insert successfuly", func() {
			resp, err := es.Insert(index_name, "trans", `{"test": 1}`, false)
			Expect(err).To(BeNil())
			Expect(resp).NotTo(BeNil())
		})

		It("Should return an error on bogus json", func() {
			resp, err := es.Insert(index_name, "trans", `{"test": 1`, false)
			Expect(err).NotTo(BeNil())
			Expect(resp).NotTo(BeNil())
		})

		It("Should refresh without error", func() {
			resp, err := es.Insert(index_name, "trans", `{"test": 1}`, true)
			Expect(err).To(BeNil())
			Expect(resp).NotTo(BeNil())

		})

	})

	Context("Search and aggregations APIs", func() {
		It("Should get one document when searching", func() {
			resp, err := es.Insert(index_name, "trans", `{"test": 1}`, true)
			Expect(err).To(BeNil())
			Expect(resp).NotTo(BeNil())
			es.Refresh(index_name)

			resp, err = es.Search(index_name, "", "{}")
			Expect(resp).NotTo(BeNil())
			Expect(resp.StatusCode).To(Equal(200))
			defer resp.Body.Close()
			objresp, err := ioutil.ReadAll(resp.Body)
			Expect(err).To(BeNil())

			var esResult EsSearchResults
			err = json.Unmarshal(objresp, &esResult)
			Expect(err).To(BeNil())

			Expect(esResult.Hits.Total).To(Equal(1))
			Expect(len(esResult.Hits.Hits)).To(Equal(1))
		})

		It("Should work to add 2 to 3 with ES", func() {

			resp, err := es.Insert(index_name, "trans", `{"value": 2}`, false)
			Expect(err).To(BeNil())
			Expect(resp).NotTo(BeNil())

			resp, err = es.Insert(index_name, "trans", `{"value": 3}`, false)
			Expect(err).To(BeNil())
			Expect(resp).NotTo(BeNil())

			es.Refresh(index_name)

			objrequest := `
			{
				"aggs": {
					"value_sum": {
						"sum": {
							"field": "value"
						}
					}
				}
			}
			`

			resp, err = es.Search(index_name, "?search_type=count", objrequest)
			Expect(err).To(BeNil())
			objresp, err := ioutil.ReadAll(resp.Body)
			Expect(err).To(BeNil())

			var esResult EsSearchResults
			err = json.Unmarshal(objresp, &esResult)
			Expect(err).To(BeNil())
			Expect(len(esResult.Aggs)).To(Equal(1))
			Expect(esResult.Aggs["value_sum"]).NotTo(BeNil())

			var val struct {
				Value float32
			}
			err = json.Unmarshal(esResult.Aggs["value_sum"], &val)
			Expect(err).To(BeNil())
			Expect(int(val.Value)).To(Equal(5))
		})
	})
})

func TestElasticsearch(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Bonitosrv Elasticsearch suite")
}
