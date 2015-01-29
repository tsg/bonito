(function() {
  'use strict';

  describe('Timepicker component', function() {
    beforeEach(module('bonitoTimepicker'));

    describe('timepicker service functions', function() {
      var timepicker;
      beforeEach(inject(function(_timepicker_) {
        timepicker = _timepicker_;
      }));

      it('should find last day by the URL parameter', function() {
        var time = timepicker.fromUrlParameters({
          'time-from': 'now-24h',
          'time-to': 'now',
          'time-mode': 'quick'
        });

        expect(time.display).toBe('Last 24 hours');
      });

      it('should return defaults if parameters are broken / not found', function() {
        var time = timepicker.fromUrlParameters({
          'time-from': 'now-7h',
          'time-to': 'now',
          'time-mode': 'quick'
        });

        expect(time.display).toBe('Last 1 hour');
      });

    });
  });
})();
