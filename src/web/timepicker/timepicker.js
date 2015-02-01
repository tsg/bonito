(function() {
  'use strict';

  var module = angular.module('bonitoTimepicker', []);

  module.constant('defaultTime', {
    mode: 'quick',
    from: 'now-1h',
    to: 'now',
    display: 'Last 1 hour'
  });


  module.directive('bonitoTimepicker', function(_, quickRanges, refreshIntervals) {
    return {
      restrict: 'E',
      templateUrl: 'timepicker/timepicker.html',
      controller: ['timefilter', '$scope', 'timepicker', '$location', '$routeParams',
        function(timefilter, $scope, timepicker, $location, $routeParams) {
        var self = this;

        self.quickLists = _(quickRanges).groupBy('section').values().value();
        self.refreshLists = _(refreshIntervals).groupBy('section').values().value();

        timefilter.set(timepicker.fromUrlParameters($routeParams));
        timefilter.setInterval(timepicker.intervalFromUrlParameters($routeParams));
        self.time = timefilter.time;
        self.mode = self.time.mode;


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

        if (self.time.mode === 'relative') {
          var parsed = timepicker.parseRelativeFrom(self.time.from);
          if (parsed !== undefined) {
            self.relative.count = parsed[0];
            self.relative.unit = parsed[1];
          }
        }

        self.format = 'YYYY-MM-DD, HH:mm:ss.SSS';
        self.absolute = {
          to: moment(),
          from: moment().subtract(60, 'minutes'),
          valid: true
        };

        if (self.time.mode === 'absolute') {
          self.absolute.to = self.time.to;
          self.absolute.from = self.time.from;
        }

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

        $scope.$watch('timepicker.absolute.from', function(date) {
          // transform in a moment date
          if (_.isDate(date)) self.absolute.from = moment(date);
        });

        $scope.$watch('timepicker.absolute.to', function(date) {
          // transform in a moment date
          if (_.isDate(date)) self.absolute.to = moment(date);
        });


        self.absoluteValidate = function() {
          self.absolute.valid = !_.isUndefined(self.absolute.from) &&
            !_.isUndefined(self.absolute.to) &&
            self.absolute.from < self.absolute.to;
        };

        self.setAbsolute = function() {
          timefilter.set({
            from: self.absolute.from,
            to: self.absolute.to,
            display: timepicker.absoluteDisplay(self.absolute.from, self.absolute.to),
            mode: 'absolute'
          });
        };

        self.setRefreshInterval = function(interval) {
          timefilter.setInterval(interval);
        };

        // watch for time filter changes to update the URL bar
        $scope.$watch(function() {
          return timefilter.time;
        }, function(newVals, oldVals) {
          if (newVals !== oldVals) {
            var params = timepicker.toUrlParameters(timefilter.time);
            _.each(params, function(value, key) {
              $location.search(key, value);
            });
          }
        }, true);

        // watch for interval changes to update the URL bar
        $scope.$watch(function() {
          return timefilter.interval;
        }, function(newVals, oldVals) {
          if (newVals !== oldVals) {
            var params = timepicker.intervalToUrlParameters(timefilter.interval);
            _.each(params, function(value, key) {
              $location.search(key, value);
            });

            if (_.isEmpty(params)) {
              // remove the parameter when it's not needed
              if ($location.$$search.interval) {
                delete $location.$$search.interval;
                $location.$$compose();
              }
            }
          }
        }, true);

      }],
      controllerAs: 'timepicker'
    };
  });


  module.service('timepicker', ['_', 'quickRanges', 'defaultTime', 'refreshIntervals',
      function(_, quickRanges, defaultTime, refreshIntervals) {

    var writeTimeFormat = 'YYYY-MM-DDTHH:mm:ss.SSS[Z]';
    var readTimeFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZ';
    var absoluteDisplayFormat = 'YYYY-MM-DD HH:mm:ss.SSS';

    self.absoluteDisplay = function(from, to) {
        return from.format(absoluteDisplayFormat) + ' to ' +
          to.format(absoluteDisplayFormat);
    };

    self.parseRelativeFrom = function(from) {
      var m = from.match(/now-([0-9]+)([smhdwMy])/);
      if (m === null) {
        return undefined;
      }
      var count = parseInt(m[1]), unit = m[2];
      if (isNaN(count) || unit === '') {
        return undefined;
      }
      return [count, unit];
    };

    return {
      absoluteDisplay: self.absoluteDisplay,
      parseRelativeFrom: self.parseRelativeFrom,

      toUrlParameters: function(time) {
        if (time.mode == 'absolute') {
          return {
            "time-from": moment(time.from).utc().format(writeTimeFormat),
            "time-to": moment(time.to).utc().format(writeTimeFormat),
            "time-mode": time.mode
          };
        }
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

          var parsed = self.parseRelativeFrom(from);
          if (parsed === undefined) {
            return defaultTime;
          }

          return {
            mode: 'relative',
            from: from,
            to: 'now',
            display: 'Last ' + parsed[0] + parsed[1]
          };

        } else if (mode == 'absolute') {
          var mfrom = moment(from, readTimeFormat).local(),
            mto = moment(to, readTimeFormat).local();
          return {
            mode: 'absolute',
            from: mfrom,
            to: mto,
            display: absoluteDisplay(mfrom, mto)
          };
        }

        return defaultTime;
      },

      intervalFromUrlParameters: function(params) {
        var value = parseInt(params.interval) || 0;
        var interval = _.find(refreshIntervals,{value: value});
        if (_.isUndefined(interval)) {
          return {
            value: 0,
            display: 'Off'
          };
        }
        return interval;
      },

      intervalToUrlParameters: function(interval) {
        if (interval.value === 0) {
          return {};    // 0 is implicit
        }
        return {
          'interval': interval.value
        };
      },

    };
  }]);

})();
