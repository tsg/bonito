package main

// General purpose shortcut
type MapStr map[string]interface{}

func (m MapStr) update(d MapStr) {
	for k, v := range d {
		m[k] = v
	}
}
