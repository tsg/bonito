(function() {
  'use strict';

  var app = angular.module('bonito-filters', []);

  /**
   * Print large number using  (k, M, G, etc.) to
   * keep their size short and to be friendlier to the poor non-robots.
   * Generalized from: https://gist.github.com/thomseddon/3511330
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

      return negativeSign + (input / Math.pow(multiplier, number)).toFixed(precision) + units[number];
  };

  app.filter('humanNumber', function() {
    return function(input, precision) {
      return transform(input, precision, ['', 'k', 'M', 'G', 'T', 'P'], 1000);
    };
  });

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
})();
