(function() {
  'use strict';

  var module = angular.module('bonitoPerformanceDashboard');

  /**
   * A proxy service to the ByDimension API.
   */
  module.factory('perfDashProxy', ['_', '$http', 'timefilter',
    function(_, $http, timefilter) {

    var self = this;

    self.load = function(config) {
      var request = {
        timerange: {
          from: timefilter.format(timefilter.time.from),
          to: timefilter.format(timefilter.time.to)
        },
        metrics: config.dashboard.metrics,
        viz: config.dashboard.viz,
        dim: config.dashboard.dim
      };

      return $http.post('/api/perfdash', request)
        .success(function(result) {
          self.result = result;
        })
        .error(function(data, status, headers, config) {
          console.log('Error: ', status);
        });
    };

    return {
      load: function(config) {
        return self.load(config);
      },

      metricsResult: function() {
        return self.result.metrics;
      },

      vizResult: function() {
        return self.result.viz;
      },

      dimResult: function() {
        return self.result.dim;
      },
    };

  }]);
})();
