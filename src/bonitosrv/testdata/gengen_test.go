package testdata_test

import (
	"time"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"bonitosrv/testdata"
)

var _ = Describe("GenGen Timerange", func() {
	Context("Two series", func() {
		var gen *testdata.GenGen
		to := time.Now()
		from := to.Add(-1 * time.Minute)
		BeforeEach(func() {
			var err error
			gen, err = testdata.NewGenGen(testdata.GenGenOptions{
				Samples: 100,
				Specs: []map[string]testdata.GenGenSpec{
					map[string]testdata.GenGenSpec{
						"ts": testdata.GenGenSpec{
							Timerange: &testdata.TimerangeOptions{
								From: from,
								To:   to,
							},
						},
						"service": testdata.GenGenSpec{
							Fixed: &testdata.FixedOptions{
								Value: "Service 0",
							},
						},
					},
					map[string]testdata.GenGenSpec{
						"ts": testdata.GenGenSpec{
							Timerange: &testdata.TimerangeOptions{
								From: from,
								To:   to,
							},
						},
						"service": testdata.GenGenSpec{
							Fixed: &testdata.FixedOptions{
								Value: "Service 1",
							},
						},
					},
				},
			})

			Expect(err).NotTo(HaveOccurred())
		})

		It("Generate should return two values", func() {
			Expect(gen.Generate(50)).To(HaveLen(2))
		})

		It("should generate equal timestamps", func() {
			vals := gen.Generate(78)
			Expect(vals[0]["ts"]).To(Equal(vals[1]["ts"]))
		})

		It("should generate different services", func() {
			vals := gen.Generate(78)
			Expect(vals[0]["service"]).NotTo(Equal(vals[1]["service"]))
		})

		It("points should be generated in order", func() {
			vals := gen.Generate(78)
			Expect(vals[0]["service"]).To(Equal("Service 0"))
			Expect(vals[1]["service"]).To(Equal("Service 1"))
		})
	})
})
