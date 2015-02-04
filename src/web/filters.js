(function() {
  'use strict';

  var app = angular.module('bonitoFilters', [
    'bonitoFormatters'
  ]);

  /**
   * Print large number using prefix (k, M, G, etc.) to
   * keep their size short and to be friendlier to the poor non-robots.
   */
  app.filter('humanNumber', ['formatters', function(formatters) {
    return function(input, precision) {
      return formatters.formatNumber(input, precision);
    };
  }]);

  /**
   * Returns a class for each number prefix to allow coloring.
   */
  app.filter('humanNumberClass', ['formatters', function(formatters) {
    return function(input, precision) {
      var units = ['', 'k', 'M', 'G', 'T', 'P'];
      input = parseFloat(input);
      if (isNaN(input) || !isFinite(input) || input === 0 || Math.abs(input) < 1) {
        return 'number-' + units[0];
      }

      var number = Math.floor(Math.log(input) / Math.log(1000));
      if (number >= units.length) {
        return 'number-' + units[0];
      }
      return 'number-' + units[number];
    };
  }]);

  /**
   * Print durations (given as number of microseconds) in a friendlier way.
   */
  app.filter('humanDuration', ['formatters', function(formatters) {
    return function(input, precision) {
      return formatters.formatDuration(input, precision);
    };
  }]);

  /**
   * Returns a class for each duration prefix to allow coloring.
   */
  app.filter('humanDurationClass', function() {
    return function(input, precision) {
      var units = ['micro', 'ms', 's', 'm', 'h'];
      input = parseFloat(input);
      if (isNaN(input) || !isFinite(input) || input === 0 || Math.abs(input) < 1) {
        return 'duration-' + units[0];
      }

      var number = Math.floor(Math.log(input) / Math.log(1000));
      if (number >= units.length) {
        return 'duration-' + units[0];
      }
      return 'duration-' + units[number];
    };
  });
})();
