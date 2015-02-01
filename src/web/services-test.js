(function() {
  'use strict';

  var app = angular.module('services-test', [
    'bonitoTestData'
  ]);

  /**
   * Test service for the services list.
   */
  app.factory('byDimensionProxyMock', function(testdata) {
    var test_data = [];


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
        values: testdata.getRandoms({
          lower: lower,
          upper: upper,
          curve: curves[_.random(curves.length)]
        }),
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
