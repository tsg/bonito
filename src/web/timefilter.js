(function() {
  'use strict';

  var module = angular.module('bonitoTimefilter', []);

  /**
   * Singleton service that holds the current time filter.
   */
  module.factory('timefilter', ['_', function(_) {
    var timeDefaults = {
      from: 'now-1h',
      to: 'now',
      mode: 'quick',
      display: 'Last hour'
    };

    var intervalDefaults = {
      value: 0,
      display: 'Off'
    };

    var self = this;

    self.timeJsFormat = 'YYYY-MM-DDTHH:mm:ss.SSS[Z]';
    self.time = timeDefaults;
    self.interval = intervalDefaults;

    return {
      time: self.time,
      interval: self.interval,
      format: function(date) {
        if (moment.isMoment(date)) {
          console.log("Formatting", date);
          return moment(date).utc().format(self.timeJsFormat);
        } else {
          return date;
        }
      },
      set: function(options) {
        _.assign(self.time, options);
      },
      setInterval: function(options) {
        _.assign(self.interval, options);
      }
    };
  }]);

})();
