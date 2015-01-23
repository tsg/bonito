package testdata

import (
	"fmt"
	"math/rand"
	"os"
)

// Generate values from a given set.

type ChoiceOptions struct {

	// Values to choose from
	Values []interface{}

	// One of:
	//   * random: choose randomly
	//   * loop: loop through the choices
	//   * weighted: random with weights
	Type string

	// If type is "weighted", than this array contains the
	// weights. They should be numbers between 0 and 1 and should
	// add up to 1.0.
	// Example:
	//  Values: ["ala", "bala, "portocala"]
	//  Weights: [0.2, 0.4, 0.4]
	Weights []float32
}

type Choice struct {
	options ChoiceOptions

	rand       *rand.Rand
	thresholds []float32
}

func (gen *GenGen) NewChoice(options ChoiceOptions) (*Choice, error) {

	if len(options.Values) == 0 {
		return nil, fmt.Errorf("The Values option is required")
	}

	choice := &Choice{
		options: options,
	}

	switch options.Type {
	case "random", "loop":
		// pass
	case "weighted":
		if len(options.Weights) == 0 {
			return nil, fmt.Errorf("Type weighted requires the Weights option")
		}

		if len(options.Weights) != len(options.Values) {
			return nil, fmt.Errorf("The Weights arrey needs to have the same len as the Values array")
		}

		choice.thresholds = []float32{}
		var sum float32
		for _, weight := range options.Weights {
			sum += weight
			choice.thresholds = append(choice.thresholds, sum)
		}
		if sum > 1.00001 || sum < 0.9999 {
			return nil, fmt.Errorf("The weights shouldn't add up to 1.0")
		}

	default:
		return nil, fmt.Errorf("Unknown type %s", options.Type)
	}

	choice.rand = rand.New(rand.NewSource(int64(os.Getpid())))

	return choice, nil
}

func (choice *Choice) Generate(step int) interface{} {
	var idx int = 0
	switch choice.options.Type {
	case "random":
		idx = choice.rand.Intn(len(choice.options.Values))

	case "loop":
		idx = step % len(choice.options.Values)

	case "weighted":
		r := rand.Float32()
		var thr float32
		for idx, thr = range choice.thresholds {
			if r < thr {
				break
			}
		}

	default:
		panic(fmt.Sprintf("Unkown type %s", choice.options.Type))
	}

	return choice.options.Values[idx]
}
