(function() {
  'use strict';

  var app = angular.module('bonito-filters', []);

  /**
   * Generic function to transform between units.
   * Adapted from: https://gist.github.com/thomseddon/3511330
   */
  var transform = function(input, precision, units, multiplier) {
      input = parseFloat(input);
      if (isNaN(input) || !isFinite(input)) {
        return '-';
      }
      if (input === 0) {
        return '0';
      }
      var negativeSign = '';
      if (input < 0) {
        input = -input;
        negativeSign = '-';
      }
      if (typeof precision === 'undefined') {
        precision = 1;
      }
      var number = Math.floor(Math.log(input) / Math.log(multiplier));

      if (number >= units.length) {
        return '-';
      }
      if (number === 0) {
        // no precision for simple units
        precision = 0;
      }

      return negativeSign + (input / Math.pow(multiplier, number)).toFixed(precision) + units[number];
  };

  /**
   * Print large number using prefix (k, M, G, etc.) to
   * keep their size short and to be friendlier to the poor non-robots.
   */
  app.filter('humanNumber', function() {
    return function(input, precision) {
      return transform(input, precision, ['', 'k', 'M', 'G', 'T', 'P'], 1000);
    };
  });

  /**
   * Returns a class for each prefix to allow coloring 
   */
  app.filter('humanNumberClass', function() {
    return function(input, precision) {
      var units = ['', 'k', 'M', 'G', 'T', 'P'];
      input = parseFloat(input);
      if (isNaN(input) || !isFinite(input) || input === 0) {
        return 'number-' + units[0];
      }

      var number = Math.floor(Math.log(input) / Math.log(1000));
      if (number >= units.length) {
        return 'number-' + units[0];
      }
      return 'number-' + units[number];
    };
  });

  /**
   * Print durations (given as number of microseconds) in a friendlier way.
   */
  app.filter('humanDuration', function() {
    return function(input, precision) {
      return transform(input, precision, ['micro', 'ms', 's', 'm', 'h'], 1000);
    };
  });
})();
