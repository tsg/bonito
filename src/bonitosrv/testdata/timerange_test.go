package testdata_test

import (
	"time"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"bonitosrv/testdata"
)

var _ = Describe("GenGen Timerange", func() {
	Context("Simple timestamps generation", func() {
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
					},
				},
			})

			Expect(err).NotTo(HaveOccurred())
		})

		It("should generate 100 point", func() {
			lst := gen.GenerateList()
			Expect(lst).To(HaveLen(100))
		})

		It("should generate a timestamp key for all elements", func() {
			lst := gen.GenerateList()
			for _, el := range lst {
				Expect(el).To(HaveKey("ts"))
			}
		})

		It("should genereate time.Time elements", func() {
			ts, ok := gen.Generate(0)[0]["ts"].(time.Time)
			Expect(ok).To(BeTrue())
			Expect(ts).To(Equal(from))
		})

		It("all timestamps should be before From and To", func() {
			lst := gen.GenerateList()
			for _, el := range lst {
				ts, ok := el["ts"].(time.Time)
				Expect(ok).To(BeTrue())
				Expect(ts).To(BeTemporally(">=", from))
				Expect(ts).To(BeTemporally("<=", to))
			}
		})

		It("each timestamp should be newer than the last", func() {
			lst := gen.GenerateList()
			var prev time.Time
			for _, el := range lst {
				ts, ok := el["ts"].(time.Time)
				Expect(ok).To(BeTrue())
				if !prev.IsZero() {
					Expect(ts).To(BeTemporally(">", prev))
				}
				prev = ts
			}
		})
	})
})
