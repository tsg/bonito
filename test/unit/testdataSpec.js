(function() {
  'use strict';

  describe('testdata generator', function() {
    beforeEach(module('bonitoTestData'));
    var testdata;
    beforeEach(inject(function(_testdata_) {
      testdata = _testdata_;
    }));

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
})();
