package testdata_test

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"bonitosrv/testdata"
)

var _ = Describe("GenGen Eventful", func() {
	Context("Integer non-randomized generation", func() {
		It("Should generate the correct values for peak", func() {
			gen, err := testdata.NewGenGen(testdata.GenGenOptions{
				Samples: 10,
				Specs: []map[string]testdata.GenGenSpec{
					map[string]testdata.GenGenSpec{
						"count": testdata.GenGenSpec{
							Eventful: &testdata.EventfulOptions{
								Type:       "peak",
								Value:      20,
								Integerify: true,
							},
						},
					},
				},
			})
			Expect(err).NotTo(HaveOccurred())

			lst := gen.GenerateList()
			counts := []int32{}
			for _, el := range lst {
				counts = append(counts, el["count"].(int32))
			}

			Expect(counts).To(Equal([]int32{20, 20, 20, 40, 20, 20, 20, 20, 20, 20}))
		})

		It("Should generate the correct values for valley with locality", func() {
			gen, err := testdata.NewGenGen(testdata.GenGenOptions{
				Samples: 10,
				Specs: []map[string]testdata.GenGenSpec{
					map[string]testdata.GenGenSpec{
						"count": testdata.GenGenSpec{
							Eventful: &testdata.EventfulOptions{
								Type:       "peak",
								Value:      20,
								Factor:     0.5,
								Locality:   1,
								Integerify: true,
							},
						},
					},
				},
			})
			Expect(err).NotTo(HaveOccurred())

			lst := gen.GenerateList()
			counts := []int32{}
			for _, el := range lst {
				counts = append(counts, el["count"].(int32))
			}

			Expect(counts).To(Equal([]int32{20, 20, 10, 10, 10, 20, 20, 20, 20, 20}))
		})

		It("Should generate the correct values for jump-up", func() {
			gen, err := testdata.NewGenGen(testdata.GenGenOptions{
				Samples: 10,
				Specs: []map[string]testdata.GenGenSpec{
					map[string]testdata.GenGenSpec{
						"count": testdata.GenGenSpec{
							Eventful: &testdata.EventfulOptions{
								Type:       "jump",
								Value:      20,
								Integerify: true,
							},
						},
					},
				},
			})
			Expect(err).NotTo(HaveOccurred())

			lst := gen.GenerateList()
			counts := []int32{}
			for _, el := range lst {
				counts = append(counts, el["count"].(int32))
			}

			Expect(counts).To(Equal([]int32{20, 20, 20, 40, 40, 40, 40, 40, 40, 40}))
		})

		It("Should generate the correct values for jump-down", func() {
			gen, err := testdata.NewGenGen(testdata.GenGenOptions{
				Samples: 10,
				Specs: []map[string]testdata.GenGenSpec{
					map[string]testdata.GenGenSpec{
						"count": testdata.GenGenSpec{
							Eventful: &testdata.EventfulOptions{
								Type:       "jump",
								Value:      20,
								Factor:     0.5,
								Integerify: true,
							},
						},
					},
				},
			})
			Expect(err).NotTo(HaveOccurred())

			lst := gen.GenerateList()
			counts := []int32{}
			for _, el := range lst {
				counts = append(counts, el["count"].(int32))
			}

			Expect(counts).To(Equal([]int32{20, 20, 20, 10, 10, 10, 10, 10, 10, 10}))
		})
	})

	Context("Float randomized generation", func() {
		var gen *testdata.GenGen
		var err error
		BeforeEach(func() {
			gen, err = testdata.NewGenGen(testdata.GenGenOptions{
				Samples: 10,
				Specs: []map[string]testdata.GenGenSpec{
					map[string]testdata.GenGenSpec{
						"responsetime": testdata.GenGenSpec{
							Eventful: &testdata.EventfulOptions{
								Type:             "jump",
								Value:            1000,
								RandomizedHeight: 200,
							},
						},
					},
				},
			})
			Expect(err).NotTo(HaveOccurred())
		})

		It("should generate values in the right ranges", func() {
			lst := gen.GenerateList()
			for step, el := range lst {
				rt := el["responsetime"].(float64)
				if step < 3 {
					Expect(rt).To(BeNumerically(">=", 900))
					Expect(rt).To(BeNumerically("<=", 1100))
				} else {
					Expect(rt).To(BeNumerically(">=", 1900))
					Expect(rt).To(BeNumerically("<=", 2100))
				}
			}
		})

	})
})
