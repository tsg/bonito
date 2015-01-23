package testdata_test

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"bonitosrv/testdata"
)

var _ = Describe("GenGen Choice", func() {
	Context("Simple choice loop generation", func() {
		var gen *testdata.GenGen
		BeforeEach(func() {
			var err error
			gen, err = testdata.NewGenGen(testdata.GenGenOptions{
				Samples: 10,
				Specs: []map[string]testdata.GenGenSpec{
					map[string]testdata.GenGenSpec{
						"host": testdata.GenGenSpec{
							Choice: &testdata.ChoiceOptions{
								Values: []interface{}{"Host1", "Host2", "Host3"},
								Type:   "loop",
							},
						},
					},
				},
			})

			Expect(err).NotTo(HaveOccurred())
		})

		It("should generate 10 points", func() {
			lst := gen.GenerateList()
			Expect(lst).To(HaveLen(10))
		})

		It("should generate a host key for all elements", func() {
			lst := gen.GenerateList()
			for _, el := range lst {
				Expect(el).To(HaveKey("host"))
			}
		})

		It("should loop through the options", func() {
			lst := gen.GenerateList()
			hosts := []string{}
			for _, el := range lst {
				hosts = append(hosts, el["host"].(string))
			}

			Expect(hosts).To(Equal([]string{"Host1", "Host2", "Host3",
				"Host1", "Host2", "Host3", "Host1", "Host2", "Host3", "Host1"}))
		})
	})

	Context("Weighted choice generation", func() {
		var gen *testdata.GenGen
		BeforeEach(func() {
			var err error
			gen, err = testdata.NewGenGen(testdata.GenGenOptions{
				Samples: 100,
				Specs: []map[string]testdata.GenGenSpec{
					map[string]testdata.GenGenSpec{
						"status": testdata.GenGenSpec{
							Choice: &testdata.ChoiceOptions{
								Values:  []interface{}{"Ok", "Error"},
								Type:    "weighted",
								Weights: []float32{0.80, 0.20},
							},
						},
					},
				},
			})

			Expect(err).NotTo(HaveOccurred())
		})

		It("Should generate elements with both values, but more OKs", func() {
			var ok_count, error_count int
			lst := gen.GenerateList()
			for _, el := range lst {
				if el["status"].(string) == "Ok" {
					ok_count += 1
				} else {
					error_count += 1
				}
			}

			Expect(ok_count).To(BeNumerically(">", 0))
			Expect(error_count).To(BeNumerically(">", 0))
			Expect(ok_count).To(BeNumerically(">", error_count))
		})
	})

	Context("Random choice generation", func() {
		var gen *testdata.GenGen
		BeforeEach(func() {
			var err error
			gen, err = testdata.NewGenGen(testdata.GenGenOptions{
				Samples: 10,
				Specs: []map[string]testdata.GenGenSpec{
					map[string]testdata.GenGenSpec{
						"status": testdata.GenGenSpec{
							Choice: &testdata.ChoiceOptions{
								Values: []interface{}{"Ok", "Error"},
								Type:   "random",
							},
						},
					},
				},
			})

			Expect(err).NotTo(HaveOccurred())
		})

		It("Should generate elements with both values", func() {
			var ok_count, error_count int
			lst := gen.GenerateList()
			for _, el := range lst {
				if el["status"].(string) == "Ok" {
					ok_count += 1
				} else {
					error_count += 1
				}
			}

			Expect(ok_count).To(BeNumerically(">", 0))
			Expect(error_count).To(BeNumerically(">", 0))
		})
	})
})
