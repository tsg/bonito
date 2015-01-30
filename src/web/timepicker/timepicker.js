(function() {
  'use strict';

  var module = angular.module('bonitoTimepicker', []);

  module.directive('bonitoTimepicker', function(_, quickRanges) {
    return {
      restrict: 'E',
      templateUrl: 'timepicker/timepicker.html',
      controller: function(timefilter) {
        var self = this;
        self.time = timefilter.time;
        self.mode = 'quick';

        self.quickLists = _(quickRanges).groupBy('section').values().value();

        self.relativeOptions = [
          {text: 'Seconds ago', value: 's'},
          {text: 'Minutes ago', value: 'm'},
          {text: 'Hours ago', value: 'h'},
          {text: 'Days ago', value: 'd'},
          {text: 'Weeks ago', value: 'w'},
          {text: 'Months ago', value: 'M'},
          {text: 'Years ago', value: 'y'},
        ];

        self.relative = {
          count: 30,
          unit: 'm',
          valid: true
        };

        self.setMode = function(mode) {
          self.mode = mode;
        };

        self.setQuick = function(option) {
          timefilter.set({
            mode: 'quick',
            from: option.from,
            to: option.to,
            display: option.display
          });
        };

        self.setRelative = function() {
          var from = "now-" + self.relative.count + self.relative.unit,
            display = "Last " + self.relative.count + self.relative.unit;
          timefilter.set({
            from: from,
            to: 'now',
            display: display,
            mode: 'relative'
          });
        };

        self.relativeValidate = function() {
          var count = parseInt(self.relative.count);
          self.relative.valid = (!isNaN(count) && count > 0);
        };

      },
      controllerAs: 'timepicker'
    };
  });

  module.constant('defaultTime', {
    mode: 'quick',
    from: 'now-1h',
    to: 'now',
    display: 'Last 1 hour'
  });

  module.service('timepicker', ['_', 'quickRanges', 'defaultTime',
      function(_, quickRanges, defaultTime) {

    return {
      toUrlParameters: function(time) {
        return {
          "time-from": time.from,
          "time-to": time.to,
          "time-mode": time.mode
        };
      },

      fromUrlParameters: function(params) {
        var mode = params['time-mode'] || defaultTime.mode,
          from = params['time-from'] || defaultTime.from,
          to = params['time-to'] || defaultTime.to;

        if (mode === 'quick') {
          var opt = _.find(quickRanges, function(d) {
            return d.from === from && d.to === to;
          });

          if (opt === undefined) {
            // potentially invalid values. Revert to defaults
            return defaultTime;
          }

          return {
            mode: 'quick',
            from: from,
            to: to,
            display: opt.display
          };
        } else if (mode === 'relative') {
          var m = from.match(/now-([0-9]+)([smhdwMy])/);
          if (m === null) {
            return defaultTime;
          }
          var count = parseInt(m[1]), unit = m[2];
          if (isNaN(count) || unit === '') {
            return defaultTime;
          }

          return {
            mode: 'relative',
            from: from,
            to: 'now',
            display: 'Last ' + count + unit
          };

        }

        // TODO: support for other modes
        return defaultTime;
      }
    };
  }]);

})();
