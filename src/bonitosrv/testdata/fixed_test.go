package testdata_test

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"bonitosrv/testdata"
)

var _ = Describe("GenGen Timerange", func() {
	Context("Simple fixed string generation", func() {
		var gen *testdata.GenGen
		BeforeEach(func() {
			var err error
			gen, err = testdata.NewGenGen(testdata.GenGenOptions{
				Samples: 10,
				Specs: []map[string]testdata.GenGenSpec{
					map[string]testdata.GenGenSpec{
						"service": testdata.GenGenSpec{
							Fixed: &testdata.FixedOptions{
								Value: "Service 0",
							},
						},
					},
				},
			})

			Expect(err).NotTo(HaveOccurred())
		})

		It("should generate 10 point", func() {
			lst := gen.GenerateList()
			Expect(lst).To(HaveLen(10))
		})

		It("should generate the same value for all", func() {
			lst := gen.GenerateList()
			for _, el := range lst {
				str, ok := el["service"].(string)
				Expect(ok).To(BeTrue())
				Expect(str).To(Equal("Service 0"))
			}
		})

	})

	Context("Simple fixed number generation", func() {
		var gen *testdata.GenGen
		BeforeEach(func() {
			var err error
			gen, err = testdata.NewGenGen(testdata.GenGenOptions{
				Samples: 10,
				Specs: []map[string]testdata.GenGenSpec{
					map[string]testdata.GenGenSpec{
						"service": testdata.GenGenSpec{
							Fixed: &testdata.FixedOptions{
								Value: float32(3.14),
							},
						},
					},
				},
			})

			Expect(err).NotTo(HaveOccurred())
		})

		It("should generate 10 point", func() {
			lst := gen.GenerateList()
			Expect(lst).To(HaveLen(10))
		})

		It("should generate the same value for all", func() {
			lst := gen.GenerateList()
			for _, el := range lst {
				nr, ok := el["service"].(float32)
				Expect(ok).To(BeTrue())
				Expect(nr).To(BeNumerically("~", 3.14, 1e-6))
			}
		})

	})
})
