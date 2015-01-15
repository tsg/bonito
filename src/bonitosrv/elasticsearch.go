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

func (es *Elasticsearch) Insert(index string, doctype string, docjson string) error {

	path := fmt.Sprintf("%s/%s/%s", es.Url, index, doctype)

	resp, err := http.Post(path, "application/json", strings.NewReader(docjson))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode > 299 {
		return fmt.Errorf("ES returned an error: %s", resp.Status)
	}

	return nil
}

func (es *Elasticsearch) Refresh(index string) error {
	path := fmt.Sprintf("%s/%s/_refresh", es.Url, index)

	resp, err := http.Post(path, "", nil)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode > 299 {
		return fmt.Errorf("ES returned an error: %s", resp.Status)
	}

	return nil
}
