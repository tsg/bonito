(function() {
  'use strict';

  describe('Filter: humanNumber', function() {
    beforeEach(module('bonito-filters'));

    var humanNumber;
    beforeEach(inject(function($filter) {
      humanNumber = $filter('humanNumber');
    }));

    it('should should return - when it get\'s garbage', function() {
      expect(humanNumber('garbage')).toBe('-');
    });

    it('should return 1.2k for 1234', function() {
      expect(humanNumber('1234')).toBe('1.2k');
    });

    it('should return 1k for 1234 when precision is 0', function() {
      expect(humanNumber('1234', 0)).toBe('1k');
    });

    it('should return 12.3k for 12345', function() {
      expect(humanNumber('12345')).toBe('12.3k');
    });

    it('should return 123.5k for 123456', function() {
      expect(humanNumber('123456')).toBe('123.5k');
    });

    it('should return 1.2M for 1234567', function() {
      expect(humanNumber('1234567')).toBe('1.2M');
    });

    it('should return 12.3M for 12345678', function() {
      expect(humanNumber('12345678')).toBe('12.3M');
    });

    it('should return 123.4M for 123456789', function() {
      expect(humanNumber('123456789')).toBe('123.5M');
    });

    it('should work for negative numbers', function() {
      expect(humanNumber('-1234')).toBe('-1.2k');
    });

    it('should work for large negative numbers', function() {
      expect(humanNumber('-125813724259')).toBe('-125.8G');
    });

    it('should return 0 for 0', function() {
      expect(humanNumber('0')).toBe('0');
    });
  });


  describe('Filter: humanNumberClass', function() {
    beforeEach(module('bonito-filters'));

    var humanNumberClass;
    beforeEach(inject(function($filter) {
      humanNumberClass = $filter('humanNumberClass');
    }));

    it('should return number- for small numbers', function() {
      expect(humanNumberClass('42')).toBe('number-');
    });

    it('should return number-k for thousands', function() {
      expect(humanNumberClass('3425')).toBe('number-k');
    });

    it('should return number-G for gigs', function() {
      expect(humanNumberClass('125813724259')).toBe('number-G');
    });

    it('should return number- for 0', function() {
      expect(humanNumberClass('0')).toBe('number-');
    });

    it('should return number- for NaN', function() {
      expect(humanNumberClass('garbage')).toBe('number-');
    });
  });
})();
