package main

import (
	"fmt"
	"net/http"
	"os"
	"strings"
)

type Elasticsearch struct {
	Url string
}

func NewElasticsearch() *Elasticsearch {
	url := os.Getenv("ELASTICSEARCH_URL")
	if len(url) == 0 {
		url = "http://localhost:9200"
	}
	return &Elasticsearch{
		Url: url,
	}
}

func (es *Elasticsearch) Insert(index string, doctype string, docjson string) (*http.Response, error) {

	path := fmt.Sprintf("%s/%s/%s", es.Url, index, doctype)

	resp, err := http.Post(path, "application/json", strings.NewReader(docjson))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode > 299 {
		return resp, fmt.Errorf("ES returned an error: %s", resp.Status)
	}

	return resp, nil
}

func (es *Elasticsearch) Refresh(index string) (*http.Response, error) {
	path := fmt.Sprintf("%s/%s/_refresh", es.Url, index)

	resp, err := http.Post(path, "", nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode > 299 {
		return resp, fmt.Errorf("ES returned an error: %s", resp.Status)
	}

	return resp, nil
}
