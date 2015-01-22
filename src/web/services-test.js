(function() {
  'use strict';

  var app = angular.module('services-test', []);

  /**
   * Test service for the services list.
   */
  app.factory('byDimensionProxyMock', function() {
    var test_data = [];

    this.generateData = function(lower, upper, curve) {
      var end = +(new Date()),
        start = end - 120 * 1000,
        data = [],
        t, min, max;

      // something interesting to happen at the tipping point
      var tipping_point = start + (end - start) / 3;
      var locality = (end - start) / 25;

      switch (curve) {
      case 'jump-up':
        max = upper;
        min = lower;
        for (t = start; t < end; t+= 1000) {
          if (Math.abs(t - tipping_point) < locality) {
            min = lower * 2;
            max = upper * 2;
          }
          data.push({
            'ts': new Date(t),
            'value': _.random(min, max)
          });
        }
        return data;

      case 'jump-down':
        max = upper;
        min = lower;
        for (t = start; t < end; t+= 1000) {
          if (Math.abs(t - tipping_point) < locality) {
            min = lower / 2;
            max = upper / 2;
          }
          data.push({
            'ts': new Date(t),
            'value': _.random(min, max)
          });
        }
        return data;

      case 'peak':
        for (t = start; t < end; t+= 1000) {
          max = upper;
          min = lower;
          if (Math.abs(t - tipping_point) < locality) {
            min = upper * 2.2;
            max = upper * 2.5;
          }
          data.push({
            'ts': new Date(t),
            'value': _.random(min, max)
          });
        }
        return data;

      default:  // just random
        for (t = start; t < end; t+= 1000) {
          data.push({
            'ts': new Date(t),
            'value': _.random(lower, upper)
          });
        }
        return data;
      }
    };

    var upper = 0, lower = 0;
    for (var i = 0; i < 81; i++) {
      var avg = _.random(10, 1500),
        curves = ['random', 'peak', 'jump-up', 'jump-down'];
      // grow exponentially only until 30 to avoid
      // integer overflows
      lower = 100 * (1 << (i % 30));
      upper = 100 * (1 << ((i % 30) + 1));


      test_data.push({
        name: 'Service' + i,
        size: _.random(lower, upper),
        values: this.generateData(lower, upper, curves[_.random(curves.length)]),
        errors: _.random(0, i),
        rt_avg: avg,
        rt_50p: avg * 1.1,
        rt_95p: avg * 10.3,
        rt_99p: avg * 100.12,
        rt_max: avg * 1000.45
      });
    }

    var compute_relative_sizes = function(data, useLogarithmicPlanetSize) {
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
        // returns a dummy promise that resolves immediately.
        return {
          then: function(f) {
            f();
          }
        };
      },
      get: function(sort_key, useLogarithmicPlanetSize) {
        // TODO: move this where we fetch the data
        compute_relative_sizes(test_data, useLogarithmicPlanetSize);

        switch (sort_key) {
          case 'errors':
            return test_data.sort(function(a, b) {
              if (a.errors === b.errors) {
                return a.size - b.size;
              }
              return b.errors - a.errors;
            });
          case 'volume':
            return _.sortBy(test_data, function(d) { return -d.size; });
          case 'alpha':
            return _.sortBy(test_data, 'name');
          case 'max':
          case '99p':
          case '95p':
          case '50p':
          case 'avg':
            return _.sortBy(test_data, function(d) { return -d['rt_' + sort_key]; });
          default:
            return test_data;
        }
      }
    };
  });
})();
