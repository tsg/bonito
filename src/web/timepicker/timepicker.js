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
        var mode = params['time-mode'] || 'quick',
          from = params['time-from'] || 'now-1h',
          to = params['time-to'] || 'now';

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
        }

        // TODO: support for other modes
        return defaultTime;
      }
    };
  }]);

})();
