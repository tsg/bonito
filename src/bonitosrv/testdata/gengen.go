package testdata

import "fmt"

// GENeric GENerator.
//
// Generates timeseries JSON like objects starting from
// a set of specs.

type GenGenOptions struct {

	// The number of samples to generate.
	Samples int

	// The specs to use for generating values.
	Specs []map[string]GenGenSpec
}

type GenGenSpec struct {
	// Timestamp value. The timestamps are generated
	// monotonically within the given range.
	Timerange *TimerangeOptions

	// Fixed value. If not nil, all generated samples will have
	// the same value.
	Fixed *FixedOptions

	// Random Choice. If not nil, the generated samples
	// will have the field set to one the Choices, randomly.
	Choice_rand *struct {
		Choices []string
	}

	// Distribution. If not nil, generate values between Lower
	// and Upper bounds, respecting the type of the
	// distribution.
	Distribute *struct {
		Type  string
		Lower float64
		Upper float64
	}

	// Weighted choice. If not nil, the generated samples
	// will have the field set to one of the Choices, with the
	// give probability of each. The probability is given as
	// a float between 0 and 1.
	Choice_weighted *struct {
		Choices map[string]float32
	}
}

// All generator types implement this interface.
type generator interface {
	Generate(step int) interface{}
}

type GenGen struct {
	GenGenOptions

	generators map[string]generator
}

type MapStr map[string]interface{}

func NewGenGen(options GenGenOptions) (*GenGen, error) {
	if options.Samples == 0 {
		options.Samples = 100
	}

	if len(options.Specs) == 0 {
		return nil, fmt.Errorf("No specs given")
	}

	generators := map[string]generator{}

	gen := &GenGen{
		GenGenOptions: options,
	}

	// initialize generators
	for _, specMap := range options.Specs {
		for key, spec := range specMap {
			if spec.Timerange != nil {
				generators[key] = gen.NewTimerange(*spec.Timerange)
			} else if spec.Fixed != nil {
				generators[key] = gen.NewFixed(*spec.Fixed)
			} else {
				return nil, fmt.Errorf("Not implemented generator for: %s", key)
			}
		}
	}

	gen.generators = generators

	return gen, nil
}

func (gen *GenGen) Generate(step int) MapStr {
	m := MapStr{}

	for key, generator := range gen.generators {
		m[key] = generator.Generate(step)
	}

	return m
}

func (gen *GenGen) GenerateList() []MapStr {
	lst := []MapStr{}
	for i := 0; i < gen.GenGenOptions.Samples; i++ {
		lst = append(lst, gen.Generate(i))
	}
	return lst
}
