package testdata

import (
	"errors"
	"math/rand"
	"os"
)

// Generate values with a mostly constant value and a particular
// event at a given tipping point.
//
// A randomization vertical window can by apply to make the values
// seem more real.

type EventfulOptions struct {

	// One of:
	//   * constant: Value for all the samples.
	//   * peak: Value with a peak at TippingPoint
	//   * jump: Value up to the TippingPoint than jump
	//     to Value multiplied by Factor.
	//
	// Default is constant.
	Type string

	// The Value outside of peaks and jump areas.
	Value float64

	// Where to place the "peak" or "jump" events. The
	// point is identified by the sample step. By default it is
	// calculated to the number of samples divided by 3.
	TippingPoint int

	// The "width" of the peak in sample points. The default is 0,
	// which means a single point will be peaked.
	Locality int

	// With how much to multiply the values at peak or in jump-up/
	// jump-down areas. Default is 2.
	Factor float64

	// Make the generated values look more real by applying this
	// Randomization vertical interval. This is the maximum height of the
	// randomized interval. By default it is 0 which means it's disabled.
	RandomizedHeight float64

	// If true it will generate (32 bits) integers. Overflows are
	// possible, so be careful.
	Integerify bool
}

type Eventful struct {
	options EventfulOptions

	rand *rand.Rand
}

func (gen *GenGen) NewEventful(options EventfulOptions) (*Eventful, error) {
	samples := gen.GenGenOptions.Samples

	if options.TippingPoint == 0 {
		options.TippingPoint = samples / 3
	}
	if options.TippingPoint > samples {
		return nil, errors.New("TippingPoint must be lower than the number of samples")
	}

	if options.Factor < 0.0001 && options.Factor > -0.0001 {
		options.Factor = 2
	}

	return &Eventful{
		options: options,
		rand:    rand.New(rand.NewSource(int64(os.Getpid()))),
	}, nil
}

func (eventful *Eventful) Generate(step int) interface{} {
	opt := eventful.options
	var value float64
	switch opt.Type {
	case "peak":
		if step >= opt.TippingPoint-opt.Locality &&
			step <= opt.TippingPoint+opt.Locality {

			value = opt.Value * opt.Factor
		} else {
			value = opt.Value
		}

	case "jump":
		if step >= opt.TippingPoint {
			value = opt.Value * opt.Factor
		} else {
			value = opt.Value
		}
	default:
		value = opt.Value
	}

	if opt.RandomizedHeight > 0.0001 {
		lower := value - opt.RandomizedHeight/2
		upper := value + opt.RandomizedHeight/2

		value = lower + eventful.rand.Float64()*(upper-lower)
	}

	if opt.Integerify {
		return int32(value)
	} else {
		return value
	}
}
