package testdata

// Generate a constant value for all steps.

type FixedOptions struct {
	Value interface{}
}

type Fixed struct {
	options FixedOptions
}

func (gen *GenGen) NewFixed(options FixedOptions) *Fixed {
	return &Fixed{
		options: options,
	}
}

func (fixed *Fixed) Generate(step int) interface{} {
	return fixed.options.Value
}
