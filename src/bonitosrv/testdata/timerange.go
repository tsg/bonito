package testdata

import "time"

// Generate timestamps.

type TimerangeOptions struct {
	From time.Time
	To   time.Time
}

type Timerange struct {
	options TimerangeOptions

	increment time.Duration
}

func (gen *GenGen) NewTimerange(options TimerangeOptions) *Timerange {
	samples := int64(gen.GenGenOptions.Samples)

	if options.From.IsZero() {
		options.From = time.Now().Add(-time.Duration(time.Hour))
	}
	if options.To.IsZero() {
		options.To = time.Now()
	}

	increment := time.Duration(int64(options.To.Sub(options.From)) / samples)

	return &Timerange{
		options:   options,
		increment: increment,
	}
}

func (tr *Timerange) Generate(step int) interface{} {
	return tr.options.From.Add(time.Duration(int64(tr.increment) * int64(step)))
}
