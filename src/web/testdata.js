(function() {
  'use strict';

  // generate random testdata useful during development and
  // unit tests.
  var module = angular.module('bonitoTestData', []);
  module.factory('testdata', function() {

    this.getRandoms = function(config) {
      if (_.isUndefined(config)) {
        config = {};
      }
      var from = config.from || moment().subtract(1, 'hours').toDate(),
        to = config.to || moment().toDate(),
        lower = config.lower || 0,
        upper = config.upper || 1000,
        curve = config.curve || 'random',

        start = +(from),  // convert to millis
        end = +(to),

        // something interesting to happen at the tipping point
        tipping_point = config.tipping_point || (start + (end - start) / 3),
        locality = config.locality || (end - start) / 25,
        points = config.points || 50;

      var data = [],
        t, min, max;

      var increment = (end - start) / points;

      switch (curve) {
      case 'jump-up':
        max = upper;
        min = lower;
        for (t = start; t < end; t+= increment) {
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
        for (t = start; t < end; t+= increment) {
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
        for (t = start; t < end; t+= increment) {
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
        for (t = start; t < end; t += increment) {
          data.push({
            'ts': new Date(t),
            'value': _.random(lower, upper)
          });
        }
        return data;
      }
    };

    return {
      getRandoms: this.getRandoms
    };
  });

})();
