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

	// Choice. If not nil, the generated samples
	// will have the field set to one the values from the Values array.
	Choice *ChoiceOptions

	// Eventful. If not nil, generate values around the given
	// value but also add an "event", which can be a peak or a
	// jump.
	Eventful *EventfulOptions
}

// All generator types implement this interface.
type generator interface {
	Generate(step int) interface{}
}

type GenGen struct {
	GenGenOptions

	generators []map[string]generator
}

type MapStr map[string]interface{}

func NewGenGen(options GenGenOptions) (*GenGen, error) {
	var err error

	if options.Samples == 0 {
		options.Samples = 100
	}

	if len(options.Specs) == 0 {
		return nil, fmt.Errorf("No specs given")
	}

	gen := &GenGen{
		GenGenOptions: options,
	}

	gen.generators = []map[string]generator{}

	// initialize generators
	for _, specMap := range options.Specs {
		generators := map[string]generator{}
		for key, spec := range specMap {
			if spec.Timerange != nil {
				generators[key] = gen.NewTimerange(*spec.Timerange)
			} else if spec.Fixed != nil {
				generators[key] = gen.NewFixed(*spec.Fixed)
			} else if spec.Choice != nil {
				generators[key], err = gen.NewChoice(*spec.Choice)
				if err != nil {
					return nil, fmt.Errorf("ChoiceOptions error: %v", err)
				}
			} else if spec.Eventful != nil {
				generators[key], err = gen.NewEventful(*spec.Eventful)
				if err != nil {
					return nil, fmt.Errorf("EventfulOptions error: %v", err)
				}
			} else {
				return nil, fmt.Errorf("Not implemented generator for: %s", key)
			}
		}
		gen.generators = append(gen.generators, generators)
	}

	return gen, nil
}

func (gen *GenGen) Generate(step int) []MapStr {
	var res []MapStr
	for _, arr := range gen.generators {
		m := MapStr{}
		for key, generator := range arr {
			m[key] = generator.Generate(step)
		}
		res = append(res, m)
	}

	return res
}

func (gen *GenGen) GenerateList() []MapStr {
	lst := []MapStr{}
	for i := 0; i < gen.GenGenOptions.Samples; i++ {
		lst = append(lst, gen.Generate(i)...)
	}
	return lst
}
