package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
)

type Elasticsearch struct {
	Url string

	client *http.Client
}

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

func (es *Elasticsearch) Refresh(index string) (*http.Response, error) {
	path := fmt.Sprintf("%s/%s/_refresh", es.Url, index)

	resp, err := es.client.Post(path, "", nil)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode > 299 {
		return resp, fmt.Errorf("ES returned an error: %s", resp.Status)
	}

	return resp, nil
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
