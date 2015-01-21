(function() {
  'use strict';

  var app = angular.module('bydimension-service', []);

  /**
   * A proxy service to the ByDimension API.
   */
  app.factory('byDimensionProxy', ['$http', function($http) {

    this.data = [];

    this.config = {
      primary_dimension: 'service',
      secondary_dimension: 'host',
      use_logarithmic_planet_size: true
    };

    this.timerange = {
      from: "now-1d",
      to: "now"
    };

    this.metrics = [
      "volume",
      "rt_max",
      "rt_avg",
      "rt_percentiles",
      "secondary_count",
      "errros_rate"
    ];

    var service = this;

    this.load = function() {
      var request = {
        timerange: service.timerange,
        metrics: service.metrics,
        config: service.config
      };
      return $http.get('/api/bydimension', request)
        .success(function(data) {
          service.data = data.primary;

          service.compute_relative_sizes(service.data,
            service.config.use_logarithmic_planet_size);
        })
        .error(function(data, status, headers, config) {
          console.log("Error: ", status);
        });
    };

    this.compute_relative_sizes = function(data, useLogarithmicPlanetSize) {
        var max_size = _.max(data, 'size').size;

        _.each(data, function(d) {
          if (useLogarithmicPlanetSize) {
            // logarithmic scale
            d.size_rel = Math.log(d.size) / Math.log(max_size);
          } else {
            d.size_rel = d.size / max_size;
          }
        });
    };


    return {
      load: function() {
        return service.load();
      },
      get: function(sort_key) {
        switch (sort_key) {
          case 'errors':
            return service.data.sort(function(a, b) {
              if (a.metrics.errros_rate === b.metrics.errros_rate) {
                return a.metrics.volume - b.metrics.volume;
              }
              return b.metrics.errros_rate - a.metrics.errros_rate;
            });
          case 'volume':
            return _.sortBy(service.data, function(d) { return -d.size; });
          case 'alpha':
            return _.sortBy(service.data, 'name');
          default:
            return service.data;
        }
      }
    };
  }]);
})();
