(function() {
  'use strict';

  var app = angular.module('bydimension-service', [
    'lodash'
  ]);

  /**
   * A proxy service to the ByDimension API.
   */
  app.factory('byDimensionProxy', ['_', '$http', 'timefilter', function(_, $http, timefilter) {

    this.data = [];

    this.config = {
      primary_dimension: 'service',
      secondary_dimension: 'host',
      use_logarithmic_planet_size: true,
      percentiles: [50, 90, 99, 99.5],
      histogram_points: 50
    };


    this.metrics = [
      'volume',
      'rt_max',
      'rt_avg',
      'rt_percentiles',
      'secondary_count',
      'errors_rate'
    ];

    this.hist_metrics = [
      'volume'
    ];

    var service = this;

    this.load = function() {
      var request = {
        timerange: {
          from: timefilter.format(timefilter.time.from),
          to: timefilter.format(timefilter.time.to)
        },
        metrics: service.metrics,
        histogram_metrics: service.hist_metrics,
        config: service.config
      };

      return $http.post('/api/bydimension', request)
        .success(function(data) {
          service.data = data.primary;
          service.afterLoad(service.data);
        })
        .error(function(data, status, headers, config) {
          console.log('Error: ', status);
        });
    };

    // process data after it's loaded
    this.afterLoad = function(data) {
      _.each(data, function(d) {
        // values come from the volume
        if (_.isObject(d.hist_metrics) && _.isArray(d.hist_metrics.volume)) {
          d.values = d.hist_metrics.volume;
        } else {
          d.values = [];
        }

        // parse timestamps
        _.each(d.values, function(v) {
          v.ts = new Date(Date.parse(v.ts));
        });
      });

      service.compute_relative_sizes(data,
        service.config.use_logarithmic_planet_size);
    };

    // compute the size of the relative planets
    this.compute_relative_sizes = function(data, useLogarithmicPlanetSize) {
      if (_.isEmpty(data)) {
        return;
      }

      var max_size = _.max(data, function(d) { return d.metrics.volume; })
        .metrics.volume;

      _.each(data, function(d) {
        if (useLogarithmicPlanetSize) {
          // logarithmic scale
          d.size_rel = Math.log(d.metrics.volume) / Math.log(max_size);
        } else {
          d.size_rel = d.metrics.volume / max_size;
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
              if (Math.abs(a.metrics.errors_rate - b.metrics.errors_rate) < 1e-6) {
                return b.metrics.volume - a.metrics.volume;
              }
              return b.metrics.errors_rate - a.metrics.errors_rate;
            });
          case 'volume':
            return _.sortBy(service.data, function(d) { return -d.metrics.volume; });
          case 'alpha':
            return _.sortBy(service.data, 'name');
          default:
            return service.data;
        }
      },
      recomputePlanetSizes: function(useLogScale) {
        service.compute_relative_sizes(service.data, useLogScale);
      }
    };
  }]);
})();
