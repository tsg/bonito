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

      it('should work for relative intervals', function() {
        var time = timepicker.fromUrlParameters({
          'time-from': 'now-24h',
          'time-to': 'now',
          'time-mode': 'relative'
        });

        expect(time.display).toBe('Last 24h');
      });

      it('in relative mode, the to is not needed', function() {
        var time = timepicker.fromUrlParameters({
          'time-from': 'now-24h',
          'time-mode': 'relative'
        });
        expect(time.display).toBe('Last 24h');
      });

      it('should return defaults if parameters are broken / not found', function() {
        var time = timepicker.fromUrlParameters({
          'time-from': 'now-7h',
          'time-to': 'now',
          'time-mode': 'quick'
        });

        expect(time.display).toBe('Last 1 hour');
      });

      it('should put parameters in UTC when in absolute mode', function() {
        var time = {
          from: moment('2015-01-03 12:45:45 +0100', 'YYYY-MM-DD HH:mm:ss Z'),
          to: moment('2015-01-03 14:45:45 +0100', 'YYYY-MM-DD HH:mm:ss Z'),
          mode: 'absolute'
        };
        expect(timepicker.toUrlParameters(time)).toEqual({
          'time-from': '2015-01-03T11:45:45.000Z',
          'time-to': '2015-01-03T13:45:45.000Z',
          'time-mode': 'absolute'
        });
      });

      it('should get parameters correctly when in absolute form', function() {
        var time = timepicker.fromUrlParameters({
          'time-from': '2015-01-03T11:45:45.000Z',
          'time-to': '2015-01-03T13:45:45.000Z',
          'time-mode': 'absolute'
        });

        var expected_from = moment('2015-01-03 12:45:45 +0100', 'YYYY-MM-DD HH:mm:ss Z'),
          expected_to = moment('2015-01-03 14:45:45 +0100', 'YYYY-MM-DD HH:mm:ss Z');

        expect(moment(time.from).isSame(expected_from)).toBe(true);
        expect(moment(time.to).isSame(expected_to)).toBe(true);
        expect(time.mode).toBe('absolute');
      });


      it('should correctly put an interval into parameters', function() {
        var params = timepicker.intervalToUrlParameters({
          value: 5000,
          display: '5 seconds',
          section: 1
        });
        expect(params.interval).toBe(5000);
      });

      it('should put nothing in parameters for refresher Off', function() {
        var params = timepicker.intervalToUrlParameters({
          value: 0,
          display: 'Off',
          section: 0
        });
        expect(params).toEqual({});
      });

      it('should find the 5 seconds interval by URL parameters', function() {
        var interval = timepicker.intervalFromUrlParameters({
          interval: '5000'
        });
        expect(interval.display).toBe('5 seconds');
      });

      it('should find the 1 hour interval by URL parameters', function() {
        var interval = timepicker.intervalFromUrlParameters({
          interval: '3600000'
        });
        expect(interval.display).toBe('1 hour');
      });

      it('should return Off for missing interval', function() {
        var interval = timepicker.intervalFromUrlParameters({
        });
        expect(interval.display).toBe('Off');
        expect(interval.value).toBe(0);
      });

      it('should return Off for unknown interval', function() {
        var interval = timepicker.intervalFromUrlParameters({
          interval: 15
        });
        expect(interval.display).toBe('Off');
        expect(interval.value).toBe(0);
      });

    });

    describe('Timepicker directive', function() {
      var $compile, $rootScope, $elem, $location;
      beforeEach(module('templates'));
      beforeEach(inject(function(_$compile_, _$rootScope_, _$location_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $location = _$location_;

        $elem = angular.element('<bonito-timepicker></bonito-timepicker>');
        $compile($elem)($rootScope);
        $rootScope.$digest();
      }));

      it('should contain two tabs', function() {
          expect($elem.find('.tab-pane').length).toBe(2);
      });

      it('should change tabs depending on the mode', function() {
        $rootScope.timepicker.mode = 'relative';
        $rootScope.$digest();

        var el = $elem.find('.tab-content li.active a');
        expect(el.text()).toBe('Relative');

        $rootScope.timepicker.mode = 'absolute';
        $rootScope.$digest();

        el = $elem.find('.tab-content li.active a');
        expect(el.text()).toBe('Absolute');
      });

      it('should generate three lists of quick options', function() {
        expect($elem.find('div[ng-switch-when=quick] .timepicker-section').length).toBe(3);
      });

      it('calling the setQuick function should update the timefilter', function() {
        $rootScope.timepicker.setQuick({
          from: 'now/d',
          to: 'now',
          display: 'The day so far',
          section: 0
        });
        expect($rootScope.timepicker.time.from).toBe('now/d');
        expect($rootScope.timepicker.time.display).toBe('The day so far');
      });

      it('setting a time should update the location bar', function() {
        $rootScope.timepicker.setQuick({
          from: 'now/d',
          to: 'now',
          display: 'The day so far',
          section: 0
        });
        $rootScope.$digest();

        expect($location.url()).toContain('time-from=now%2Fd');
      });

      it('setting a time refresher interval should update the location bar', function() {
        $rootScope.timepicker.setRefreshInterval({
          value: 5000,
          display: '5 seconds'
        });
        $rootScope.$digest();

        expect($location.url()).toContain('interval=5000');
      });


    });

  });
})();
