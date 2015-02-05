(function() {
  'use strict';

  describe('testdata generator', function() {
    beforeEach(module('bonitoTestData'));
    var testdata;
    beforeEach(inject(function(_testdata_) {
      testdata = _testdata_;
    }));

    describe('getRandoms', function() {
      it('should generate 50 points by default', function() {
        expect(testdata.getRandoms().length).toBe(50);
      });

      it('should generate 50 points in jump up mode', function() {
        expect(testdata.getRandoms({curve: 'jump-up'}).length).toBe(50);
      });

      it('should generate 50 points in jump down mode', function() {
        expect(testdata.getRandoms({curve: 'jump-down'}).length).toBe(50);
      });

      it('should generate 50 points in peak mode', function() {
        expect(testdata.getRandoms({curve: 'peak'}).length).toBe(50);
      });
    });

    describe('getLogNormal', function() {
      var lognormal;
      beforeEach(function() {
        lognormal = testdata.getLogNormal({
          samples: 100, max: 5000, median: 1000, points: 10
        });
      });
      it('should generate 10 points', function() {
        expect(lognormal.length).toBe(10);
      });
      it('should contain X and Y within the ranges', function() {
        expect(_.every(lognormal, function(d) {
          return 0 <= d.value && d.value <= 5000 && 0 <= d.count && d.count <= 1000;
        })).toBeTruthy();
      });
    });

  });
})();
