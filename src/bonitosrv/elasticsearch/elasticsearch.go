package elasticsearch

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"strings"
	"time"
)

type Elasticsearch struct {
	Url string

	client *http.Client
}

type Time time.Time

const TsLayout = "2006-01-02T15:04:05.000Z"

func (t Time) MarshalJSON() ([]byte, error) {
	return json.Marshal(time.Time(t).UTC().Format(TsLayout))
}

func TimeParse(str string) (Time, error) {
	ts, err := time.Parse(TsLayout, str)
	return Time(ts), err
}

// General purpose shortcut
type MapStr map[string]interface{}

func NewElasticsearch() *Elasticsearch {
	url := os.Getenv("ELASTICSEARCH_URL")
	if len(url) == 0 {
		url = "http://localhost:9200"
	}
	return &Elasticsearch{
		Url:    url,
		client: &http.Client{},
	}
}

func (es *Elasticsearch) Insert(index string, doctype string, docjson string, refresh bool) (*http.Response, error) {

	path := fmt.Sprintf("%s/%s/%s", es.Url, index, doctype)

	if refresh {
		path = fmt.Sprintf("%s?refresh=true", path)
	}

	resp, err := es.client.Post(path, "application/json", strings.NewReader(docjson))
	if err != nil {
		return nil, err
	}

	if resp.StatusCode > 299 {
		return resp, fmt.Errorf("ES returned an error: %s", resp.Status)
	}

	return resp, nil
}

// Generic request method. Returns the HTTP response that we get from ES.
// If ES returns an error HTTP code (>299), the error is non-nil and the
// response is also non-nil.
func (es *Elasticsearch) Request(method string, index string, path string,
	data io.Reader) (*http.Response, error) {

	url := fmt.Sprintf("%s/%s/%s", es.Url, index, path)

	req, err := http.NewRequest(method, url, data)
	if err != nil {
		return nil, err
	}

	resp, err := es.client.Do(req)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode > 299 {
		return resp, fmt.Errorf("ES returned an error: %s", resp.Status)
	}

	return resp, nil
}

// Refresh an index. Call this after doing inserts or creating/deleting
// indexes in unit tests.
func (es *Elasticsearch) Refresh(index string) (*http.Response, error) {
	return es.Request("POST", index, "_refresh", nil)
}

// Execute a bulk request via the ES _bulk API.
func (es *Elasticsearch) Bulk(index string, data io.Reader) (*http.Response, error) {
	return es.Request("POST", index, "_bulk", data)
}

// Utility function to read the full body of an HTTP response
// into a string.
func ResponseBody(resp *http.Response) string {
	if resp.Body == nil {
		return ""
	}
	respbytes, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return fmt.Sprintf("Error reading response body: %v", err)
	}
	return string(respbytes)
}

func (es *Elasticsearch) DeleteIndex(index string) (*http.Response, error) {
	path := fmt.Sprintf("%s/%s", es.Url, index)

	req, err := http.NewRequest("DELETE", path, nil)
	if err != nil {
		return nil, err
	}

	resp, err := es.client.Do(req)
	if err != nil {
		return nil, err
	}

	return resp, nil
}

type EsSearchResults struct {
	Took   int                        `json:"took"`
	Shards json.RawMessage            `json:"_shards"`
	Hits   EsHits                     `json:"hits"`
	Aggs   map[string]json.RawMessage `json:"aggregations"`
}

type EsHits struct {
	Total int
	Hits  []json.RawMessage `json:"hits"`
}

func (es *Elasticsearch) Search(index string, params string, reqjson string) (*http.Response, error) {

	path := fmt.Sprintf("%s/%s/_search%s", es.Url, index, params)

	req, err := http.NewRequest("GET", path, strings.NewReader(reqjson))
	if err != nil {
		return nil, err
	}

	resp, err := es.client.Do(req)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode > 299 {
		return resp, fmt.Errorf("ES returned an error: %s", resp.Status)
	}

	return resp, nil
}
