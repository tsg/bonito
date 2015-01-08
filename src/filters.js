(function() {
  'use strict';

  var app = angular.module('bonito-filters', []);

  /**
   * Print large number using prefixes (k, M, G, etc.) to
   * keep their size short and to be friendlier to the poor non-robots.
   * Adapted from: https://gist.github.com/thomseddon/3511330
   */
  app.filter('humanNumber', function() {
    return function(input, precision) {
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
      var units = ['', 'k', 'M', 'G', 'T', 'P'],
        number = Math.floor(Math.log(input) / Math.log(1000));

      return negativeSign + (input / Math.pow(1000, number)).toFixed(precision) + units[number];
    };
  });
})();
